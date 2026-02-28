import { useReadContract } from 'wagmi';
import { PULSE_SCORE_ADDRESS, PULSE_SCORE_ABI } from '@/config/contracts';
import type { ScoreData, ScoreResult } from '@/types';

export function useScore(worker: `0x${string}` | undefined) {
  const result = useReadContract({
    address: PULSE_SCORE_ADDRESS,
    abi: PULSE_SCORE_ABI,
    functionName: 'getScore',
    args: worker ? [worker] : undefined,
    query: {
      enabled: !!worker && !!PULSE_SCORE_ADDRESS,
      refetchInterval: 30_000,
    },
  });

  const raw = result.data as [bigint, string] | undefined;
  const score: ScoreResult | undefined = raw
    ? { score: raw[0], tier: raw[1] }
    : undefined;

  return { ...result, score };
}

export function useFullScore(worker: `0x${string}` | undefined) {
  const result = useReadContract({
    address: PULSE_SCORE_ADDRESS,
    abi: PULSE_SCORE_ABI,
    functionName: 'getFullScore',
    args: worker ? [worker] : undefined,
    query: {
      enabled: !!worker && !!PULSE_SCORE_ADDRESS,
      refetchInterval: 30_000,
    },
  });

  const scoreData = result.data as ScoreData | undefined;
  return { ...result, scoreData };
}
