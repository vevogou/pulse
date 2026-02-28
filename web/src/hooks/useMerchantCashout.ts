import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MERCHANT_CASHOUT_ADDRESS, MERCHANT_CASHOUT_ABI } from '@/config/contracts';

export function useMerchantsNear(lat: bigint, lng: bigint, deltaLat: bigint, deltaLng: bigint) {
  return useReadContract({
    address: MERCHANT_CASHOUT_ADDRESS,
    abi: MERCHANT_CASHOUT_ABI,
    functionName: 'getMerchantsNear',
    args: [lat, lng, deltaLat, deltaLng],
    query: {
      enabled: !!MERCHANT_CASHOUT_ADDRESS,
      refetchInterval: 30_000,
    },
  });
}

export function useMerchantInfo(merchantId: bigint | undefined) {
  return useReadContract({
    address: MERCHANT_CASHOUT_ADDRESS,
    abi: MERCHANT_CASHOUT_ABI,
    functionName: 'merchants',
    args: merchantId !== undefined ? [merchantId] : undefined,
    query: {
      enabled: merchantId !== undefined && !!MERCHANT_CASHOUT_ADDRESS,
    },
  });
}

export function useMerchantIdByWallet(wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: MERCHANT_CASHOUT_ADDRESS,
    abi: MERCHANT_CASHOUT_ABI,
    functionName: 'merchantIdByWallet',
    args: wallet ? [wallet] : undefined,
    query: {
      enabled: !!wallet && !!MERCHANT_CASHOUT_ADDRESS,
    },
  });
}

export function useRequestCashout() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestCashout = (merchantId: bigint, amount: bigint) => {
    writeContract({
      address: MERCHANT_CASHOUT_ADDRESS,
      abi: MERCHANT_CASHOUT_ABI,
      functionName: 'requestCashout',
      args: [merchantId, amount],
    });
  };

  return { requestCashout, hash, isPending, isConfirming, isSuccess, error };
}

export function useConfirmCashout() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const confirmCashout = (requestId: bigint, code: `0x${string}`) => {
    writeContract({
      address: MERCHANT_CASHOUT_ADDRESS,
      abi: MERCHANT_CASHOUT_ABI,
      functionName: 'confirmCashout',
      args: [requestId, code],
    });
  };

  return { confirmCashout, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelCashout() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelCashout = (requestId: bigint) => {
    writeContract({
      address: MERCHANT_CASHOUT_ADDRESS,
      abi: MERCHANT_CASHOUT_ABI,
      functionName: 'cancelCashout',
      args: [requestId],
    });
  };

  return { cancelCashout, hash, isPending, isConfirming, isSuccess, error };
}

export function useRegisterMerchant() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (
    name: string,
    lat: bigint,
    lng: bigint,
    countryCode: string,
    initialCash: bigint
  ) => {
    writeContract({
      address: MERCHANT_CASHOUT_ADDRESS,
      abi: MERCHANT_CASHOUT_ABI,
      functionName: 'registerMerchant',
      args: [name, lat, lng, countryCode, initialCash],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}
