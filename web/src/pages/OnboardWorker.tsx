import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Phone, Globe, Shield, ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletButton } from '@/components/ui/WalletButton';
import { Navbar } from '@/components/layout/Navbar';
import { useRegisterWorker } from '@/hooks/useWorkerRegistry';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
];

export default function OnboardWorker() {
  const { address, isConnected } = useAccount();
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const { register, isPending, isConfirming, isSuccess } = useRegisterWorker();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('NG');
  const [phone, setPhone] = useState('');

  const handleRegister = () => {
    if (!phone) return;
    const phoneHash = keccak256(toBytes(phone));
    register(phoneHash, address!, displayName, country);
  };

  React.useEffect(() => {
    if (isSuccess) {
      setRole('worker');
      setTimeout(() => navigate('/worker'), 1500);
    }
  }, [isSuccess, navigate, setRole]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-sm w-full text-center py-12 px-6">
          <UserPlus size={40} className="mx-auto text-blue-400 mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Join PULSE</h2>
          <p className="text-sm text-slate-400 mb-6">Connect your wallet to register as a worker</p>
          <div className="flex justify-center"><WalletButton /></div>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-sm w-full text-center py-12 px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield size={32} className="text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Welcome to PULSE!</h2>
            <p className="text-sm text-slate-400">Your worker registration is complete. Redirecting...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-20 pb-24">
        <motion.div initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="text-2xl font-display font-bold text-white">Worker Registration</h1>
            <p className="text-sm text-slate-400 mt-2">Set up your PULSE account to start earning</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > s ? '✓' : s + 1}
                </div>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </motion.div>

          {/* Step Content */}
          {step === 0 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Globe size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Your Details</h3>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Amina"
                    className="w-full h-10 px-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Country</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => setCountry(c.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          country === c.code
                            ? 'bg-blue-500/20 border border-blue-500/40 text-white'
                            : 'bg-slate-700 border border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="primary" className="w-full" onClick={() => setStep(1)}>
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Phone size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Phone Verification</h3>
                <p className="text-sm text-slate-400">
                  Your phone number is hashed on-chain for identity verification. We never store your raw number.
                </p>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="w-full h-10 px-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                  <Button variant="primary" className="flex-1" onClick={() => phone && setStep(2)}>
                    Continue <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Confirm Registration</h3>

                <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Wallet</span>
                    <span className="text-white font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                  {displayName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white">{displayName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Country</span>
                    <span className="text-white">{COUNTRIES.find((c) => c.code === country)?.flag} {COUNTRIES.find((c) => c.code === country)?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Phone</span>
                    <span className="text-white">••••{phone.slice(-4)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  This will mint a soulbound NFT to your wallet and register you on-chain.
                </p>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    loading={isPending || isConfirming}
                    onClick={handleRegister}
                  >
                    Register On-Chain
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
