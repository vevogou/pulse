import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { USDC_ADDRESS, USDC_ABI } from '@/config/contracts';

export function useUSDCBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 15_000,
    },
  });
}

export function useAllowance(owner: `0x${string}` | undefined, spender: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner,
      refetchInterval: 10_000,
    },
  });
}

export function useNeedsApproval(
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
  amount: bigint
) {
  const { data: allowance } = useAllowance(owner, spender);
  if (!allowance) return true;
  return (allowance as bigint) < amount;
}

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}
