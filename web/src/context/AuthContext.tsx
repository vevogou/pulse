import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { WORKER_REGISTRY_ADDRESS, WORKER_REGISTRY_ABI } from '@/config/contracts';
import type { UserRole } from '@/types';

interface AuthState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isRegisteredWorker: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthState>({
  role: null,
  setRole: () => {},
  address: undefined,
  isConnected: false,
  isRegisteredWorker: false,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState<UserRole>(null);

  const { data: workerData, isLoading } = useReadContract({
    address: WORKER_REGISTRY_ADDRESS,
    abi: WORKER_REGISTRY_ABI,
    functionName: 'getWorker',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!WORKER_REGISTRY_ADDRESS,
    },
  });

  const isRegisteredWorker = !!(workerData as any)?.exists;

  // Reset role when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setRole(null);
    }
  }, [isConnected]);

  return (
    <AuthContext.Provider
      value={{ role, setRole, address, isConnected, isRegisteredWorker, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
