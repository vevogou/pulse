import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { WORKER_REGISTRY_ADDRESS, WORKER_REGISTRY_ABI, PULSE_VAULT_ADDRESS, PULSE_VAULT_ABI } from '@/config/contracts';
import type { UserRole } from '@/types';

interface AuthState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isRegisteredWorker: boolean;
  isEmployer: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthState>({
  role: null,
  setRole: () => {},
  address: undefined,
  isConnected: false,
  isRegisteredWorker: false,
  isEmployer: false,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [role, _setRole] = useState<UserRole>(() => {
    // Restore from localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pulse_role') : null;
    return (saved as UserRole) || null;
  });

  const setRole = (newRole: UserRole) => {
    _setRole(newRole);
    if (newRole) {
      localStorage.setItem('pulse_role', newRole);
    } else {
      localStorage.removeItem('pulse_role');
    }
  };

  // Check if registered worker
  const { data: workerData, isLoading: workerLoading } = useReadContract({
    address: WORKER_REGISTRY_ADDRESS,
    abi: WORKER_REGISTRY_ABI,
    functionName: 'getWorker',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!WORKER_REGISTRY_ADDRESS,
    },
  });

  // Check if employer (has principal deposited)
  const { data: principalData, isLoading: employerLoading } = useReadContract({
    address: PULSE_VAULT_ADDRESS,
    abi: PULSE_VAULT_ABI,
    functionName: 'employerPrincipal',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!PULSE_VAULT_ADDRESS,
    },
  });

  const isRegisteredWorker = !!(workerData as any)?.exists;
  const isEmployer = !!principalData && (principalData as bigint) > 0n;
  const isLoading = workerLoading || employerLoading;

  // Auto-detect role when wallet connects (only if no role set)
  useEffect(() => {
    if (!isConnected || isLoading) return;
    if (role) return; // Already has a role

    if (isRegisteredWorker) {
      setRole('worker');
    } else if (isEmployer) {
      setRole('employer');
    }
  }, [isConnected, isLoading, isRegisteredWorker, isEmployer, role]);

  // Reset role when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setRole(null);
    }
  }, [isConnected]);

  return (
    <AuthContext.Provider
      value={{ role, setRole, address, isConnected, isRegisteredWorker, isEmployer, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
