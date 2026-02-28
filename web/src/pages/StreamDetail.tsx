import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, TrendingUp, Pause, Play, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { HeartbeatLine } from '@/components/ui/HeartbeatLine';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useStreamData, useAccumulated, usePauseStream, useResumeStream, useCancelStream } from '@/hooks/useStreamEngine';
import { formatDuration } from '@/lib/formatting';
import { Skeleton } from '@/components/ui/Skeleton';
import { truncateAddress, explorerAddressUrl } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function StreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const streamId = id ? BigInt(id) : BigInt(0);
  const { stream } = useStreamData(streamId);
  const { data: accumulatedRaw } = useAccumulated(streamId);
  const liveBalance = accumulatedRaw ? Number(accumulatedRaw as bigint) / 1e6 : 0;
  const { pause, isPending: pausePending } = usePauseStream();
  const { resume, isPending: resumePending } = useResumeStream();
  const { cancel, isPending: cancelPending } = useCancelStream();

  if (!stream) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  const rpsRaw = stream.ratePerSecond;
  const rps = Number(rpsRaw) / 1e6;
  const total = Number(stream.totalAmount) / 1e6;
  const withdrawn = Number(stream.withdrawnAmount) / 1e6;
  const available = liveBalance;
  const progress = total > 0 ? Math.min(((withdrawn + available) / total) * 100, 100) : 0;
  const remaining = total - withdrawn - available;
  const rateHour = (rps * 3600);
  const rateDay = (rps * 86400);
  const rateMonth = (rps * 86400 * 30);
  const elapsed = stream.endTime > stream.startTime
    ? Number(BigInt(Math.floor(Date.now() / 1000)) - stream.startTime)
    : 0;
  const totalDuration = Number(stream.endTime - stream.startTime);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 space-y-6">
        <motion.div initial="initial" animate="animate" className="space-y-6">
          {/* Back Button */}
          <motion.div variants={fadeUp}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          </motion.div>

          {/* Stream Header */}
          <motion.div variants={fadeUp}>
            <Card className="bg-gradient-to-br from-blue-900/30 to-slate-800 border-blue-500/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <HeartbeatLine />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Stream #{stream.id.toString()}</p>
                  {stream.isCancelled ? (
                    <Badge variant="danger">Cancelled</Badge>
                  ) : !stream.isActive ? (
                    <Badge variant="warning">Paused</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>

                <p className="text-4xl font-display font-bold text-white">
                  <AnimatedNumber value={withdrawn + available} decimals={6} prefix="$" />
                </p>
                <p className="text-sm text-emerald-400 mt-1">earned so far</p>
              </div>
            </Card>
          </motion.div>

          {/* Progress Timeline */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <p className="text-sm font-semibold text-white mb-3">Stream Progress</p>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>{progress.toFixed(1)}% complete</span>
                <span>{formatDuration(totalDuration - elapsed)} remaining</span>
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-400">Per Hour</span>
              </div>
              <p className="text-lg font-bold text-white">${rateHour.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-blue-400" />
                <span className="text-xs text-slate-400">Per Day</span>
              </div>
              <p className="text-lg font-bold text-white">${rateDay.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-amber-400" />
                <span className="text-xs text-slate-400">Per Month</span>
              </div>
              <p className="text-lg font-bold text-white">${rateMonth.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-purple-400" />
                <span className="text-xs text-slate-400">Duration</span>
              </div>
              <p className="text-lg font-bold text-white">{formatDuration(totalDuration)}</p>
            </Card>
          </motion.div>

          {/* Earnings Breakdown */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <p className="text-sm font-semibold text-white mb-4">Earnings Breakdown</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Earned</span>
                  <span className="text-sm font-bold text-white">${(withdrawn + available).toFixed(6)}</span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Already Withdrawn</span>
                  <span className="text-sm font-bold text-emerald-400">${withdrawn.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Available to Withdraw</span>
                  <span className="text-sm font-bold text-blue-400">${available.toFixed(6)}</span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Remaining in Stream</span>
                  <span className="text-sm font-bold text-slate-300">${remaining.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <p className="text-sm font-semibold text-white mb-4">Stream Details</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Employer</span>
                  <a
                    href={explorerAddressUrl(stream.employer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline font-mono"
                  >
                    {truncateAddress(stream.employer)}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Worker</span>
                  <a
                    href={explorerAddressUrl(stream.worker)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline font-mono"
                  >
                    {truncateAddress(stream.worker)}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Rate per Second</span>
                  <span className="text-sm text-white font-mono">{rps.toFixed(6)} USDC</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          {!stream.isCancelled && (
            <motion.div variants={fadeUp} className="flex gap-3">
              {stream.isActive ? (
                <Button
                  variant="secondary"
                  className="flex-1"
                  loading={pausePending}
                  onClick={() => pause(stream.id)}
                >
                  <Pause size={16} className="mr-2" /> Pause
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={resumePending}
                  onClick={() => resume(stream.id)}
                >
                  <Play size={16} className="mr-2" /> Resume
                </Button>
              )}
              <Button
                variant="danger"
                className="flex-1"
                loading={cancelPending}
                onClick={() => cancel(stream.id)}
              >
                <XCircle size={16} className="mr-2" /> Cancel
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
