import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  STREAM_ENGINE_ADDRESS,
  STREAM_ENGINE_ABI,
} from '@/config/contracts';
import type { Stream } from '@/types';

export function useAccumulated(streamId: bigint | undefined) {
  return useReadContract({
    address: STREAM_ENGINE_ADDRESS,
    abi: STREAM_ENGINE_ABI,
    functionName: 'getAccumulated',
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined && !!STREAM_ENGINE_ADDRESS,
      refetchInterval: 10_000,
    },
  });
}

export function useStreamData(streamId: bigint | undefined) {
  const result = useReadContract({
    address: STREAM_ENGINE_ADDRESS,
    abi: STREAM_ENGINE_ABI,
    functionName: 'streams',
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined && !!STREAM_ENGINE_ADDRESS,
    },
  });

  const raw = result.data as any;
  const stream: Stream | undefined = raw
    ? {
        id: raw[0],
        employer: raw[1],
        worker: raw[2],
        ratePerSecond: raw[3],
        startTime: raw[4],
        endTime: raw[5],
        totalAmount: raw[6],
        withdrawnAmount: raw[7],
        isActive: raw[8],
        isCancelled: raw[9],
      }
    : undefined;

  return { ...result, stream };
}

export function useWorkerStreams(worker: `0x${string}` | undefined) {
  return useReadContract({
    address: STREAM_ENGINE_ADDRESS,
    abi: STREAM_ENGINE_ABI,
    functionName: 'getWorkerStreams',
    args: worker ? [worker] : undefined,
    query: {
      enabled: !!worker && !!STREAM_ENGINE_ADDRESS,
      refetchInterval: 30_000,
    },
  });
}

export function useEmployerStreams(employer: `0x${string}` | undefined) {
  return useReadContract({
    address: STREAM_ENGINE_ADDRESS,
    abi: STREAM_ENGINE_ABI,
    functionName: 'getEmployerStreams',
    args: employer ? [employer] : undefined,
    query: {
      enabled: !!employer && !!STREAM_ENGINE_ADDRESS,
      refetchInterval: 30_000,
    },
  });
}

export function useWithdrawStream() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (streamId: bigint, amount: bigint) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'withdraw',
      args: [streamId, amount],
    });
  };

  return { withdraw, hash, isPending, isConfirming, isSuccess, error };
}

export function useWithdrawAll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdrawAll = () => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'withdrawAll',
    });
  };

  return { withdrawAll, hash, isPending, isConfirming, isSuccess, error };
}

export function useCreateStream() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createStream = (worker: `0x${string}`, ratePerSecond: bigint, durationSeconds: bigint) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'createStream',
      args: [worker, ratePerSecond, durationSeconds],
    });
  };

  return { createStream, hash, isPending, isConfirming, isSuccess, error };
}

export function useBatchCreateStreams() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const batchCreate = (
    workers: `0x${string}`[],
    rates: bigint[],
    durationSeconds: bigint
  ) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'batchCreateStreams',
      args: [workers, rates, durationSeconds],
    });
  };

  return { batchCreate, hash, isPending, isConfirming, isSuccess, error };
}

export function usePauseStream() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pause = (streamId: bigint) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'pauseStream',
      args: [streamId],
    });
  };

  return { pause, hash, isPending, isConfirming, isSuccess };
}

export function useResumeStream() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resume = (streamId: bigint) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'resumeStream',
      args: [streamId],
    });
  };

  return { resume, hash, isPending, isConfirming, isSuccess };
}

export function useCancelStream() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancel = (streamId: bigint) => {
    writeContract({
      address: STREAM_ENGINE_ADDRESS,
      abi: STREAM_ENGINE_ABI,
      functionName: 'cancelStream',
      args: [streamId],
    });
  };

  return { cancel, hash, isPending, isConfirming, isSuccess };
}
