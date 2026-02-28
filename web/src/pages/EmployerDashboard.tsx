import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pause, Play, XCircle, Upload, Download, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { WalletButton } from '@/components/ui/WalletButton';
import { useEmployerBalance, useYieldEarned, useDepositPayroll } from '@/hooks/usePulseVault';
import { useEmployerStreams, useStreamData, useCreateStream, usePauseStream, useResumeStream, useCancelStream } from '@/hooks/useStreamEngine';
import { useApproveUSDC } from '@/hooks/useUSDCApproval';
import { PULSE_VAULT_ADDRESS } from '@/config/contracts';
import { formatDollar, parseUSDC } from '@/lib/formatting';
import { Skeleton } from '@/components/ui/Skeleton';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Mini sparkline data
const sparkData = Array.from({ length: 20 }, (_, i) => ({ v: Math.random() * 100 + 50 }));

function StatCard({ label, value, color, sparkColor }: { label: string; value: string; color: string; sparkColor: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
      <div className="h-8 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <Area type="monotone" dataKey="v" stroke={sparkColor} fill={sparkColor} fillOpacity={0.1} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StreamRow({ streamId }: { streamId: bigint }) {
  const { stream } = useStreamData(streamId);
  const { pause, isPending: pausePending } = usePauseStream();
  const { resume, isPending: resumePending } = useResumeStream();
  const { cancel, isPending: cancelPending } = useCancelStream();

  if (!stream) return <Skeleton className="h-12 w-full" />;

  const workerMasked = `${stream.worker.slice(0, 6)}...${stream.worker.slice(-4)}`;
  const rate = (Number(stream.ratePerSecond) / 1e6 * 3600).toFixed(2);
  const streamed = Number(stream.withdrawnAmount) / 1e6;
  const total = Number(stream.totalAmount) / 1e6;

  return (
    <tr className="border-b border-slate-800">
      <td className="py-3 text-sm font-mono text-slate-300">{workerMasked}</td>
      <td className="py-3 text-sm text-emerald-400">${rate}/hr</td>
      <td className="py-3 text-sm text-slate-300">${streamed.toFixed(2)}</td>
      <td className="py-3 text-sm text-slate-300">${total.toFixed(2)}</td>
      <td className="py-3">
        {stream.isCancelled ? (
          <Badge variant="danger">Cancelled</Badge>
        ) : !stream.isActive ? (
          <Badge variant="warning">Paused</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        )}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-1">
          {stream.isActive && !stream.isCancelled && (
            <button
              onClick={() => pause(stream.id)}
              disabled={pausePending}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Pause size={14} />
            </button>
          )}
          {!stream.isActive && !stream.isCancelled && (
            <button
              onClick={() => resume(stream.id)}
              disabled={resumePending}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Play size={14} />
            </button>
          )}
          {!stream.isCancelled && (
            <button
              onClick={() => cancel(stream.id)}
              disabled={cancelPending}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function EmployerDashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useEmployerBalance(address);
  const { data: yieldEarned } = useYieldEarned(address);
  const { data: streamIds } = useEmployerStreams(address);
  const ids = (streamIds as bigint[]) || [];

  const [showAddWorker, setShowAddWorker] = useState(false);
  const [workerAddress, setWorkerAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [depositAmount, setDepositAmount] = useState('');

  const { createStream, isPending: createPending, isConfirming: createConfirming } = useCreateStream();
  const { deposit, isPending: depositPending, isConfirming: depositConfirming } = useDepositPayroll();
  const { approve, isPending: approvePending } = useApproveUSDC();

  const balanceNum = balance ? Number(balance as bigint) / 1e6 : 0;
  const yieldNum = yieldEarned ? Number(yieldEarned as bigint) / 1e6 : 0;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-sm w-full text-center py-12">
          <img src="/logo.png" alt="PULSE" className="h-8 mx-auto mb-6" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Employer Dashboard</h2>
          <p className="text-sm text-slate-400 mb-6">Connect your wallet to manage payroll</p>
          <div className="flex justify-center"><WalletButton /></div>
        </Card>
      </div>
    );
  }

  const handleCreateStream = () => {
    if (!workerAddress || !hourlyRate || !durationDays) return;
    const ratePerSecond = parseUSDC((parseFloat(hourlyRate) / 3600).toFixed(6));
    const duration = BigInt(parseInt(durationDays) * 86400);
    createStream(workerAddress as `0x${string}`, ratePerSecond, duration);
  };

  const handleDeposit = () => {
    if (!depositAmount) return;
    const amt = parseUSDC(depositAmount);
    approve(PULSE_VAULT_ADDRESS, amt);
    setTimeout(() => deposit(amt), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <motion.div initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-white">Employer Dashboard</h1>
            <WalletButton />
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Vault Balance" value={`$${balanceNum.toFixed(2)}`} color="text-blue-400" sparkColor="#3B82F6" />
            <StatCard label="Active Streams" value={ids.length.toString()} color="text-white" sparkColor="#94A3B8" />
            <StatCard label="Yield Earned (Aave)" value={`$${yieldNum.toFixed(4)}`} color="text-emerald-400" sparkColor="#10B981" />
            <StatCard label="Total Paid Out" value="$0.00" color="text-amber-400" sparkColor="#F59E0B" />
          </motion.div>

          {/* Vault Card */}
          <motion.div variants={fadeUp}>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Vault Balance</p>
                  <p className="text-3xl font-display font-bold text-white mt-1">
                    <AnimatedNumber value={balanceNum} decimals={2} prefix="$" />
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-emerald-400">Earning ~4.1% APY</span>
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-white font-medium">AAVE</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="USDC amount"
                      className="h-9 px-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 w-32"
                    />
                    <Button variant="primary" size="sm" loading={depositPending || depositConfirming} onClick={handleDeposit}>
                      <Download size={14} className="mr-1" /> Deposit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Streams Table */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-white">Active Streams</h2>
              <Button variant="primary" size="sm" onClick={() => setShowAddWorker(true)}>
                <Plus size={14} className="mr-1" /> Add Worker
              </Button>
            </div>

            <Card className="overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Worker</th>
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Rate</th>
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Withdrawn</th>
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Total</th>
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Status</th>
                    <th className="text-left text-xs text-slate-400 font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="px-4">
                  {ids.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No streams yet. Add a worker to start streaming payroll.
                      </td>
                    </tr>
                  ) : (
                    ids.map((id) => <StreamRow key={id.toString()} streamId={id} />)
                  )}
                </tbody>
              </table>
            </Card>
          </motion.div>

          {/* Batch Upload */}
          <motion.div variants={fadeUp}>
            <Card className="p-6 border-dashed border-2 border-slate-700 bg-transparent text-center">
              <Upload size={32} className="mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400">Drag & drop CSV to batch upload workers</p>
              <p className="text-xs text-slate-500 mt-1">Format: wallet_address, hourly_rate_usd, duration_days</p>
              <Button variant="ghost" size="sm" className="mt-3">Download Template</Button>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* Add Worker Modal */}
      <Modal isOpen={showAddWorker} onClose={() => setShowAddWorker(false)} title="Add Worker Stream">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Worker Wallet Address</label>
            <input
              type="text"
              value={workerAddress}
              onChange={(e) => setWorkerAddress(e.target.value)}
              placeholder="0x..."
              className="w-full h-10 px-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hourly Rate (USDC)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="8.50"
                className="w-full h-10 pl-7 pr-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Duration: {durationDays} days</label>
            <input
              type="range"
              min="1"
              max="365"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full accent-blue-500"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={createPending || createConfirming}
            onClick={handleCreateStream}
          >
            Start Streaming
          </Button>
        </div>
      </Modal>
    </div>
  );
}
