import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { WORKER_REGISTRY_ADDRESS, WORKER_REGISTRY_ABI } from '@/config/contracts';
import type { WorkerInfo } from '@/types';

export function useWorkerInfo(wallet: `0x${string}` | undefined) {
  const result = useReadContract({
    address: WORKER_REGISTRY_ADDRESS,
    abi: WORKER_REGISTRY_ABI,
    functionName: 'getWorker',
    args: wallet ? [wallet] : undefined,
    query: {
      enabled: !!wallet && !!WORKER_REGISTRY_ADDRESS,
    },
  });

  const worker = result.data as WorkerInfo | undefined;
  return { ...result, worker };
}

export function useDailyLimit(wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: WORKER_REGISTRY_ADDRESS,
    abi: WORKER_REGISTRY_ABI,
    functionName: 'getDailyLimit',
    args: wallet ? [wallet] : undefined,
    query: {
      enabled: !!wallet && !!WORKER_REGISTRY_ADDRESS,
    },
  });
}

export function useRegisterWorker() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (
    phoneHash: `0x${string}`,
    wallet: `0x${string}`,
    displayName: string,
    country: string
  ) => {
    writeContract({
      address: WORKER_REGISTRY_ADDRESS,
      abi: WORKER_REGISTRY_ABI,
      functionName: 'registerWorker',
      args: [phoneHash, wallet, displayName, country],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}
