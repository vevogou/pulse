import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Award, Copy, ExternalLink, LogOut, Check } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useScore } from '@/hooks/usePulseScore';
import { useWorkerInfo } from '@/hooks/useWorkerRegistry';
import { truncateAddress, explorerAddressUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const TIERS = [
  { name: 'Starter', min: 0, max: 249, color: 'text-slate-400', bg: 'from-slate-700 to-slate-800', ring: '#94A3B8', limit: '$50/day' },
  { name: 'Rising', min: 250, max: 499, color: 'text-blue-400', bg: 'from-blue-900/30 to-slate-800', ring: '#3B82F6', limit: '$200/day' },
  { name: 'Trusted', min: 500, max: 749, color: 'text-emerald-400', bg: 'from-emerald-900/30 to-slate-800', ring: '#10B981', limit: '$500/day' },
  { name: 'Elite', min: 750, max: 1000, color: 'text-amber-400', bg: 'from-amber-900/30 to-slate-800', ring: '#F59E0B', limit: '$1000/day' },
];

function ScoreGauge({ score }: { score: number }) {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
  const pct = score / 1000;
  const r = 80;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct * 0.75); // 270 degree arc

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1E293B" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} />
        <motion.circle
          cx="100" cy="100" r={r} fill="none" stroke={tier.ring} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          initial={{ strokeDashoffset: circ * 0.75 }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-4xl font-display font-bold ${tier.color}`}>{score}</p>
        <p className="text-xs text-slate-400">/ 1000</p>
      </div>
    </div>
  );
}

function TierCard({ tier, current }: { tier: typeof TIERS[0]; current: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${
      current
        ? `bg-gradient-to-br ${tier.bg} border-current`
        : 'bg-slate-800/50 border-slate-700/50'
    } transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold ${current ? tier.color : 'text-slate-500'}`}>{tier.name}</span>
        {current && <Check size={14} className={tier.color} />}
      </div>
      <p className="text-xs text-slate-400">{tier.min} — {tier.max} pts</p>
      <p className="text-xs text-slate-500 mt-1">Limit: {tier.limit}</p>
    </div>
  );
}

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { role, setRole } = useAuth();
  const { score: scoreResult } = useScore(address);
  const { data: workerInfo } = useWorkerInfo(address);
  const [copied, setCopied] = React.useState(false);

  const scoreNum = scoreResult ? Number(scoreResult.score) : 0;
  const currentTier = TIERS.find((t) => scoreNum >= t.min && scoreNum <= t.max) || TIERS[0];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const referralLink = address ? `https://pulse.africa/r/${address.slice(0, 8)}` : '';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-sm w-full text-center py-12">
          <img src="/logo.png" alt="PULSE" className="h-8 mx-auto mb-6" />
          <p className="text-sm text-slate-400">Connect your wallet to view profile</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 space-y-6">
        <motion.div initial="initial" animate="animate" className="space-y-6">
          {/* Profile Header */}
          <motion.div variants={fadeUp} className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <p className="font-mono text-sm text-slate-300">{truncateAddress(address!)}</p>
              <button onClick={copyAddress} className="text-slate-500 hover:text-white transition-colors">
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <a href={explorerAddressUrl(address!)} target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-white transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
            <Badge className="mt-2" variant={
              role === 'worker' ? 'success' : role === 'employer' ? 'info' : role === 'merchant' ? 'warning' : 'default'
            }>
              {role || 'No Role'}
            </Badge>
          </motion.div>

          {/* Score Gauge */}
          <motion.div variants={fadeUp}>
            <Card className={`bg-gradient-to-br ${currentTier.bg} border-${currentTier.ring} p-6`}>
              <p className="text-sm font-semibold text-white text-center mb-4">PULSE Score</p>
              <ScoreGauge score={scoreNum} />
              <div className="text-center mt-4">
                <Badge variant={scoreNum >= 750 ? 'success' : scoreNum >= 500 ? 'info' : scoreNum >= 250 ? 'warning' : 'default'}>
                  {currentTier.name} Tier
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Tier Cards */}
          <motion.div variants={fadeUp}>
            <p className="text-sm font-semibold text-white mb-3">Verification Tiers</p>
            <div className="grid grid-cols-2 gap-3">
              {TIERS.map((t) => (
                <TierCard key={t.name} tier={t} current={t.name === currentTier.name} />
              ))}
            </div>
          </motion.div>

          {/* Referral */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <p className="text-sm font-semibold text-white mb-2">Refer & Earn</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 h-9 px-3 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 font-mono"
                />
                <Button variant="primary" size="sm" onClick={() => navigator.clipboard.writeText(referralLink)}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Share with workers to grow the network</p>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-sm font-semibold text-white">Settings</p>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-slate-400" />
                  <span className="text-sm text-white">Switch Role</span>
                </div>
                <select
                  value={role || ''}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white"
                >
                  <option value="worker">Worker</option>
                  <option value="employer">Employer</option>
                  <option value="merchant">Merchant</option>
                </select>
              </div>
            </Card>

            <Button variant="danger" className="w-full" onClick={() => disconnect()}>
              <LogOut size={16} className="mr-2" /> Disconnect Wallet
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
