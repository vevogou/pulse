import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function explorerTxUrl(hash: string): string {
  const base = import.meta.env.VITE_EXPLORER_URL || 'https://polygonscan.com';
  return `${base}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  const base = import.meta.env.VITE_EXPLORER_URL || 'https://polygonscan.com';
  return `${base}/address/${address}`;
}
