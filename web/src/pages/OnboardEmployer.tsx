import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, DollarSign, ArrowRight, Check, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletButton } from '@/components/ui/WalletButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Navbar } from '@/components/layout/Navbar';
import { useApproveUSDC, useUSDCBalance, useAllowance } from '@/hooks/useUSDCApproval';
import { useDepositPayroll } from '@/hooks/usePulseVault';
import { PULSE_VAULT_ADDRESS } from '@/config/contracts';
import { parseUSDC } from '@/lib/formatting';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function OnboardEmployer() {
  const { address, isConnected } = useAccount();
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const { data: usdcBalance } = useUSDCBalance(address);
  const { data: allowance } = useAllowance(address, PULSE_VAULT_ADDRESS);
  const { approve, isPending: approvePending, isConfirming: approveConfirming, isSuccess: approveSuccess } = useApproveUSDC();
  const { deposit, isPending: depositPending, isConfirming: depositConfirming, isSuccess: depositSuccess } = useDepositPayroll();

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');

  const balance = usdcBalance ? Number(usdcBalance as bigint) / 1e6 : 0;
  const allow = allowance ? Number(allowance as bigint) / 1e6 : 0;
  const amountNum = parseFloat(amount) || 0;
  const hasAllowance = allow >= amountNum;

  const handleApprove = () => {
    if (!amount) return;
    const amt = parseUSDC(amount);
    approve(PULSE_VAULT_ADDRESS, amt);
  };

  const handleDeposit = () => {
    if (!amount) return;
    const amt = parseUSDC(amount);
    deposit(amt);
  };

  const handleSkipToFundLater = () => {
    setRole('employer');
    navigate('/employer');
  };

  React.useEffect(() => {
    if (depositSuccess) {
      setRole('employer');
      setTimeout(() => navigate('/employer'), 1500);
    }
  }, [depositSuccess, navigate, setRole]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="max-w-sm w-full text-center py-12 px-6">
          <Building2 size={40} className="mx-auto text-blue-400 mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Employer Setup</h2>
          <p className="text-sm text-slate-400 mb-6">Connect your wallet to set up payroll</p>
          <div className="flex justify-center"><WalletButton /></div>
        </Card>
      </div>
    );
  }

  if (depositSuccess) {
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
              <Check size={32} className="text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Vault Funded!</h2>
            <p className="text-sm text-slate-400 mb-2">Your payroll vault is ready.</p>
            <p className="text-xs text-emerald-400 mb-6">Earning yield on Aave V3</p>
            <Button variant="primary" className="w-full" onClick={() => navigate('/employer')}>
              Go to Dashboard <ArrowRight size={16} className="ml-2" />
            </Button>
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
            <h1 className="text-2xl font-display font-bold text-white">Employer Onboarding</h1>
            <p className="text-sm text-slate-400 mt-2">Deposit USDC to start streaming payroll</p>
          </motion.div>

          {/* Steps Indicator */}
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

          {/* Step 0: Amount */}
          {step === 0 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deposit Amount</h3>
                <p className="text-sm text-slate-400">
                  How much USDC would you like to deposit into the payroll vault? This earns Aave yield while unstreamed.
                </p>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Your USDC Balance</span>
                    <span className="text-sm text-white">${balance.toFixed(2)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-14 pl-8 pr-3 bg-slate-700 border border-slate-600 rounded-xl text-2xl font-display font-bold text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[100, 500, 1000, 5000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v.toString())}
                        className="flex-1 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs font-medium text-white transition-colors"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-xl p-3 flex items-start gap-2">
                  <Shield size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400">
                    Your deposit is secured in the PulseVault smart contract and auto-supplied to Aave V3 to earn ~4.1% APY while idle.
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => amountNum > 0 && setStep(1)}
                  disabled={amountNum <= 0}
                >
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>

                <button
                  onClick={handleSkipToFundLater}
                  className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors py-2"
                >
                  Skip — I'll fund later →
                </button>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Approve */}
          {step === 1 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Approve USDC</h3>
                <p className="text-sm text-slate-400">
                  Allow the PulseVault contract to transfer ${amountNum.toFixed(2)} USDC from your wallet.
                </p>

                <div className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-400">Approve Amount</span>
                  <span className="text-lg font-bold text-white">${amountNum.toFixed(2)}</span>
                </div>

                {hasAllowance || approveSuccess ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Check size={20} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-semibold">Approved!</span>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                  {hasAllowance || approveSuccess ? (
                    <Button variant="primary" className="flex-1" onClick={() => setStep(2)}>
                      Next <ArrowRight size={16} className="ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="flex-1"
                      loading={approvePending || approveConfirming}
                      onClick={handleApprove}
                    >
                      Approve USDC
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Deposit */}
          {step === 2 && (
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Deposit to Vault</h3>

                <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deposit</span>
                    <span className="text-white font-bold">${amountNum.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Network</span>
                    <span className="text-white">Polygon Mainnet</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Vault</span>
                    <span className="text-white font-mono text-xs">PulseVault</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Yield</span>
                    <span className="text-emerald-400">~4.1% APY (Aave)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    loading={depositPending || depositConfirming}
                    onClick={handleDeposit}
                  >
                    Deposit Now
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
