import { useState, useEffect, useCallback, useRef } from 'react';
import { useReadContracts } from 'wagmi';
import { STREAM_ENGINE_ADDRESS, STREAM_ENGINE_ABI } from '@/config/contracts';

interface StreamInfo {
  id: bigint;
  ratePerSecond: bigint;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
  isCancelled: boolean;
}

export function useRealTimeBalance(streamIds: bigint[], streams: StreamInfo[]) {
  const [displayBalance, setDisplayBalance] = useState(0);
  const lastContractReadRef = useRef(0);
  const baseBalanceRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  // Read accumulated from contract for all streams every 10s
  const contracts = streamIds.map((id) => ({
    address: STREAM_ENGINE_ADDRESS as `0x${string}`,
    abi: STREAM_ENGINE_ABI,
    functionName: 'getAccumulated' as const,
    args: [id] as const,
  }));

  const { data: accumulatedData } = useReadContracts({
    contracts: contracts.length > 0 ? contracts : undefined,
    query: {
      enabled: contracts.length > 0 && !!STREAM_ENGINE_ADDRESS,
      refetchInterval: 10_000,
    },
  });

  // When contract data arrives, set as the base
  useEffect(() => {
    if (!accumulatedData) return;
    let total = 0;
    for (const result of accumulatedData) {
      if (result.status === 'success') {
        total += Number(result.result as bigint) / 1e6;
      }
    }
    baseBalanceRef.current = total;
    lastContractReadRef.current = Date.now();
    setDisplayBalance(total);
  }, [accumulatedData]);

  // Smooth interpolation at 50ms intervals
  useEffect(() => {
    if (streams.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const dtSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Sum up all active stream rates
      let totalRatePerSecond = 0;
      const currentTimestamp = Math.floor(now / 1000);

      for (const s of streams) {
        if (!s.isActive || s.isCancelled) continue;
        if (currentTimestamp >= Number(s.endTime)) continue;
        if (currentTimestamp < Number(s.startTime)) continue;
        totalRatePerSecond += Number(s.ratePerSecond) / 1e6;
      }

      setDisplayBalance((prev) => prev + totalRatePerSecond * dtSeconds);
    }, 50);

    return () => clearInterval(interval);
  }, [streams]);

  // Calculate total rate per second for display
  const totalRatePerSecond = streams.reduce((sum, s) => {
    if (!s.isActive || s.isCancelled) return sum;
    const now = Math.floor(Date.now() / 1000);
    if (now >= Number(s.endTime) || now < Number(s.startTime)) return sum;
    return sum + Number(s.ratePerSecond) / 1e6;
  }, 0);

  const resetBalance = useCallback(() => {
    setDisplayBalance(0);
    baseBalanceRef.current = 0;
  }, []);

  return { displayBalance, totalRatePerSecond, resetBalance };
}
