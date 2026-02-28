import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { formatRate, streamProgress } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import type { Stream } from '@/types';

interface StreamCardProps {
  stream: Stream;
  onClick?: () => void;
}

export function StreamCard({ stream, onClick }: StreamCardProps) {
  const progress = streamProgress(stream.startTime, stream.endTime);
  const rateStr = formatRate(stream.ratePerSecond);
  const initial = stream.employer.slice(2, 4).toUpperCase();

  const statusBadge = stream.isCancelled ? (
    <Badge variant="danger">Cancelled</Badge>
  ) : !stream.isActive ? (
    <Badge variant="warning">Paused</Badge>
  ) : progress >= 100 ? (
    <Badge variant="default">Completed</Badge>
  ) : (
    <Badge variant="success">Streaming</Badge>
  );

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className="cursor-pointer p-4" onClick={onClick} hover>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
            <span className="text-blue-400 font-mono text-sm font-bold">{initial}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-slate-500" />
                <span className="text-sm text-white font-medium truncate">
                  {stream.employer.slice(0, 8)}...
                </span>
              </div>
              {statusBadge}
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-emerald-400 font-mono">{rateStr}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                stream.isActive && !stream.isCancelled ? 'bg-emerald-500' : 'bg-slate-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-500">{progress.toFixed(1)}% complete</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
