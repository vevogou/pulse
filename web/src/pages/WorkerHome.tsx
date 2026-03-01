import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Banknote, TrendingUp, Bell, Copy, Store } from 'lucide-react';
import { useAccount } from 'wagmi';
import { LiveBalanceCard } from '@/components/ui/LiveBalanceCard';
import { StreamCard } from '@/components/ui/StreamCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { BottomNav } from '@/components/layout/BottomNav';
import { WalletButton } from '@/components/ui/WalletButton';
import { useWorkerStreams, useStreamData } from '@/hooks/useStreamEngine';
import { useRealTimeBalance } from '@/hooks/useRealTimeBalance';
import { useWorkerInfo } from '@/hooks/useWorkerRegistry';
import { truncateAddress } from '@/lib/utils';
import type { Stream } from '@/types';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const actionButtons = [
  { icon: ArrowUpRight, label: 'Send Money', color: 'text-blue-400', path: '/withdraw' },
  { icon: ArrowDownLeft, label: 'Cash In', color: 'text-emerald-400', path: '/worker' },
  { icon: Banknote, label: 'Cash Out', color: 'text-amber-400', path: '/withdraw' },
  { icon: TrendingUp, label: 'Save & Earn', color: 'text-blue-300', path: '/worker' },
];

function StreamsList({ streamIds }: { streamIds: bigint[] }) {
  return (
    <div className="space-y-3">
      {streamIds.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-slate-400 text-sm">No active streams yet</p>
          <p className="text-slate-500 text-xs mt-1">Ask your employer to start streaming your salary</p>
        </Card>
      )}
      {streamIds.map((id) => (
        <StreamItem key={id.toString()} streamId={id} />
      ))}
    </div>
  );
}

function StreamItem({ streamId }: { streamId: bigint }) {
  const { stream } = useStreamData(streamId);
  if (!stream) return <Skeleton className="h-24 w-full" />;
  return (
    <Link to={`/stream/${streamId.toString()}`}>
      <StreamCard stream={stream} />
    </Link>
  );
}

export default function WorkerHome() {
  const { address, isConnected } = useAccount();
  const { worker } = useWorkerInfo(address);
  const { data: streamIds } = useWorkerStreams(address);
  const ids = (streamIds as bigint[]) || [];

  // For real-time balance, we need stream data
  // We'll pass empty arrays if no data yet
  const streamInfos = useMemo(() => {
    return ids.map((id) => ({
      id,
      ratePerSecond: 0n,
      startTime: 0n,
      endTime: 0n,
      isActive: true,
      isCancelled: false,
    }));
  }, [ids]);

  const { displayBalance, totalRatePerSecond } = useRealTimeBalance(ids, streamInfos);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center py-12">
          <img src="/logo.png" alt="PULSE" className="h-8 mx-auto mb-6" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-sm text-slate-400 mb-6">Connect to access your worker dashboard</p>
          <div className="flex justify-center">
            <WalletButton />
          </div>
        </Card>
      </div>
    );
  }

  const greeting = worker?.displayName
    ? `Good morning, ${worker.displayName}`
    : 'Welcome back';

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="min-h-screen bg-slate-900 pb-20"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-white">{greeting}</h1>
            {address && (
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors"
              >
                <span className="font-mono">{truncateAddress(address)}</span>
                <Copy size={10} />
              </button>
            )}
          </div>
          <button className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </motion.div>

      {/* Live Balance */}
      <motion.div variants={fadeUp} className="px-4 mb-6">
        <LiveBalanceCard
          balance={displayBalance}
          ratePerSecond={totalRatePerSecond}
          isStreaming={ids.length > 0}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={fadeUp} className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {actionButtons.map((btn) => (
            <Link key={btn.label} to={btn.path}>
              <Card className="flex flex-col items-center justify-center py-4 px-2 h-20" hover>
                <btn.icon size={20} className={btn.color} />
                <span className="text-[10px] text-slate-400 mt-1.5 text-center leading-tight">
                  {btn.label}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Active Streams */}
      <motion.div variants={fadeUp} className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Active Streams</h2>
        <StreamsList streamIds={ids} />
      </motion.div>

      {/* Nearby Merchants */}
      <motion.div variants={fadeUp} className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Nearby Merchants</h2>
        <Card className="text-center py-8">
          <Store size={24} className="mx-auto text-slate-500 mb-2" />
          <p className="text-slate-400 text-sm">No merchants nearby yet</p>
          <p className="text-slate-500 text-xs mt-1">Merchants will appear here once registered</p>
        </Card>
      </motion.div>

      <BottomNav />
    </motion.div>
  );
}
