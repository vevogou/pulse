import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PULSE_VAULT_ADDRESS, PULSE_VAULT_ABI } from '@/config/contracts';

export function useEmployerBalance(employer: `0x${string}` | undefined) {
  return useReadContract({
    address: PULSE_VAULT_ADDRESS,
    abi: PULSE_VAULT_ABI,
    functionName: 'getEmployerBalance',
    args: employer ? [employer] : undefined,
    query: {
      enabled: !!employer && !!PULSE_VAULT_ADDRESS,
      refetchInterval: 15_000,
    },
  });
}

export function useYieldEarned(employer: `0x${string}` | undefined) {
  return useReadContract({
    address: PULSE_VAULT_ADDRESS,
    abi: PULSE_VAULT_ABI,
    functionName: 'getYieldEarned',
    args: employer ? [employer] : undefined,
    query: {
      enabled: !!employer && !!PULSE_VAULT_ADDRESS,
      refetchInterval: 15_000,
    },
  });
}

export function useEmployerPrincipal(employer: `0x${string}` | undefined) {
  return useReadContract({
    address: PULSE_VAULT_ADDRESS,
    abi: PULSE_VAULT_ABI,
    functionName: 'employerPrincipal',
    args: employer ? [employer] : undefined,
    query: {
      enabled: !!employer && !!PULSE_VAULT_ADDRESS,
    },
  });
}

export function useDepositPayroll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amount: bigint) => {
    writeContract({
      address: PULSE_VAULT_ADDRESS,
      abi: PULSE_VAULT_ABI,
      functionName: 'depositPayroll',
      args: [amount],
    });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
}

export function useWithdrawPayroll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (amount: bigint) => {
    writeContract({
      address: PULSE_VAULT_ADDRESS,
      abi: PULSE_VAULT_ABI,
      functionName: 'withdrawPayroll',
      args: [amount],
    });
  };

  return { withdraw, hash, isPending, isConfirming, isSuccess, error };
}
