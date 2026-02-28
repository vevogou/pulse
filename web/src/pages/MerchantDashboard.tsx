import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, XCircle, MapPin, Settings } from 'lucide-react';
import { useAccount } from 'wagmi';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { WalletButton } from '@/components/ui/WalletButton';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useMerchantIdByWallet, useMerchantInfo, useConfirmCashout } from '@/hooks/useMerchantCashout';
import { Skeleton } from '@/components/ui/Skeleton';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function MerchantDashboard() {
  const { address, isConnected } = useAccount();
  const { data: merchantId } = useMerchantIdByWallet(address);
  const mid = merchantId ? Number(merchantId) : 0;
  const { data: merchantInfo } = useMerchantInfo(mid > 0 ? BigInt(mid) : undefined);
  const { confirmCashout, isPending: confirmPending } = useConfirmCashout();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [cashLevel, setCashLevel] = useState(80);

  const merchant = merchantInfo as { name: string; isVerified: boolean; lat: bigint; lng: bigint } | undefined;
  const qrValue = address ? `pulse:merchant:${address}` : '';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-sm w-full text-center py-12">
          <img src="/logo.png" alt="PULSE" className="h-8 mx-auto mb-6" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Merchant Portal</h2>
          <p className="text-sm text-slate-400 mb-6">Connect your wallet to manage cashouts</p>
          <div className="flex justify-center"><WalletButton /></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24 space-y-6">
        <motion.div initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                {merchant?.name || 'Merchant Dashboard'}
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                <MapPin size={12} /> Agent Location
              </p>
            </div>
            <Badge variant={merchant?.isVerified ? 'success' : 'danger'}>
              {merchant?.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </motion.div>

          {/* Earnings Card */}
          <motion.div variants={fadeUp}>
            <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800 border-emerald-500/20 p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Earnings</p>
              <p className="text-3xl font-display font-bold text-white mt-1">
                <AnimatedNumber value={0} decimals={2} prefix="$" />
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-slate-400">Today</p>
                  <p className="text-sm font-bold text-emerald-400">$0.00</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">This Week</p>
                  <p className="text-sm font-bold text-blue-400">$0.00</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Cashouts</p>
                  <p className="text-sm font-bold text-white">0</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              History
            </button>
          </motion.div>

          {activeTab === 'dashboard' ? (
            <>
              {/* QR Code */}
              <motion.div variants={fadeUp}>
                <Card className="p-6 text-center">
                  <p className="text-sm font-semibold text-white mb-4">Your Merchant QR Code</p>
                  <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
                    <QRCodeSVG value={qrValue} size={180} level="M" />
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Workers scan this to start a cashout</p>
                </Card>
              </motion.div>

              {/* Cash Level */}
              <motion.div variants={fadeUp}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white">Cash Available</p>
                    <span className="text-lg font-bold text-emerald-400">{cashLevel}%</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${cashLevel}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cashLevel}
                    onChange={(e) => setCashLevel(Number(e.target.value))}
                    className="w-full mt-3 accent-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Adjust your available cash level to manage demand</p>
                </Card>
              </motion.div>

              {/* Pending Cashouts */}
              <motion.div variants={fadeUp}>
                <h3 className="text-sm font-semibold text-white mb-3">Pending Cashouts</h3>
                <Card className="p-8 text-center">
                  <Clock size={32} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500">No pending cashout requests</p>
                  <p className="text-xs text-slate-600 mt-1">When workers request cash, they'll appear here</p>
                </Card>
              </motion.div>

              {/* Settings */}
              <motion.div variants={fadeUp}>
                <Card className="p-4">
                  <button className="w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                        <Settings size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Merchant Settings</p>
                        <p className="text-xs text-slate-400">Update name, location, availability</p>
                      </div>
                    </div>
                    <span className="text-slate-500">→</span>
                  </button>
                </Card>
              </motion.div>
            </>
          ) : (
            /* History Tab */
            <motion.div variants={fadeUp}>
              <Card className="p-8 text-center">
                <DollarSign size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">No transactions yet</p>
                <p className="text-xs text-slate-600 mt-1">Completed cashouts will show here</p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
