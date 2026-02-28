import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { AnimatedNumber } from './AnimatedNumber';
import { HeartbeatLine } from './HeartbeatLine';
import { formatDollarNumber } from '@/lib/formatting';

interface LiveBalanceCardProps {
  balance: number;
  ratePerSecond: number;
  isStreaming: boolean;
}

export function LiveBalanceCard({ balance, ratePerSecond, isStreaming }: LiveBalanceCardProps) {
  const rateDisplay = ratePerSecond > 0 ? `+$${ratePerSecond.toFixed(6)}/sec` : '$0.00/sec';

  return (
    <Card
      className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900"
      glow={isStreaming ? 'emerald' : null}
    >
      {/* Subtle background heartbeat */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <HeartbeatLine height={160} color="#10B981" />
      </div>

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
          Your earnings right now
        </p>

        <div className="flex items-baseline gap-1">
          <AnimatedNumber
            value={balance}
            decimals={4}
            prefix="$"
            className="text-5xl font-display font-bold text-white"
            duration={100}
          />
        </div>

        <div className="flex items-center gap-3 mt-3">
          {isStreaming && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs text-emerald-400 font-medium">Streaming live</span>
            </motion.div>
          )}

          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp size={14} />
            <span className="text-xs font-mono">{rateDisplay}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
