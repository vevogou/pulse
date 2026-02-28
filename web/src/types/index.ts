export type UserRole = 'worker' | 'employer' | 'merchant' | null;

export interface Stream {
  id: bigint;
  employer: `0x${string}`;
  worker: `0x${string}`;
  ratePerSecond: bigint;
  startTime: bigint;
  endTime: bigint;
  totalAmount: bigint;
  withdrawnAmount: bigint;
  isActive: boolean;
  isCancelled: boolean;
}

export interface WorkerInfo {
  wallet: `0x${string}`;
  phoneHash: `0x${string}`;
  displayName: string;
  country: string;
  tier: number;
  kycLevel: bigint;
  streamCount: bigint;
  totalEarned: bigint;
  joinedAt: bigint;
  lastActive: bigint;
  exists: boolean;
}

export interface Merchant {
  wallet: `0x${string}`;
  name: string;
  lat: bigint;
  lng: bigint;
  countryCode: string;
  cashAvailable: bigint;
  totalFeesEarned: bigint;
  isVerified: boolean;
  exists: boolean;
}

export interface CashoutRequest {
  worker: `0x${string}`;
  merchant: `0x${string}`;
  amount: bigint;
  code: `0x${string}`;
  expiresAt: bigint;
  completed: boolean;
  cancelled: boolean;
}

export interface ScoreData {
  score: bigint;
  withdrawalCount: bigint;
  completedStreams: bigint;
  totalEarned: bigint;
  joinedAt: bigint;
  lastUpdated: bigint;
}

export interface ScoreResult {
  score: bigint;
  tier: string;
}
