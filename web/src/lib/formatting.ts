import { formatDistanceToNow } from 'date-fns';

const USDC_DECIMALS = 6;

/** Convert USDC raw (6 decimals) to human-readable string */
export function formatUSDC(raw: bigint, decimals = 2): string {
  const num = Number(raw) / 10 ** USDC_DECIMALS;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format as dollar string */
export function formatDollar(raw: bigint, decimals = 2): string {
  return `$${formatUSDC(raw, decimals)}`;
}

/** Format number as dollar string */
export function formatDollarNumber(num: number, decimals = 2): string {
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Convert rate per second (6 decimals) to per hour */
export function ratePerHour(ratePerSecond: bigint): number {
  return (Number(ratePerSecond) / 1e6) * 3600;
}

/** Convert rate per second (6 decimals) to per day */
export function ratePerDay(ratePerSecond: bigint): number {
  return (Number(ratePerSecond) / 1e6) * 86400;
}

/** Convert rate per second (6 decimals) to per month (30 days) */
export function ratePerMonth(ratePerSecond: bigint): number {
  return (Number(ratePerSecond) / 1e6) * 86400 * 30;
}

/** Format rate per second as readable string */
export function formatRate(ratePerSecond: bigint): string {
  const perHour = ratePerHour(ratePerSecond);
  if (perHour >= 1) return `$${perHour.toFixed(2)}/hr`;
  const perDay = ratePerDay(ratePerSecond);
  return `$${perDay.toFixed(2)}/day`;
}

/** Format a timestamp as relative time */
export function timeAgo(timestamp: bigint): string {
  return formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });
}

/** Format seconds into human readable duration */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Progress percentage of a stream */
export function streamProgress(startTime: bigint, endTime: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= endTime) return 100;
  if (now <= startTime) return 0;
  return Number(((now - startTime) * 100n) / (endTime - startTime));
}

/** Parse USDC amount string to raw bigint */
export function parseUSDC(amount: string): bigint {
  const num = parseFloat(amount);
  if (isNaN(num) || num < 0) return 0n;
  return BigInt(Math.floor(num * 10 ** USDC_DECIMALS));
}
