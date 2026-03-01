import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building, MapPin, Send, Check, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWithdrawAll } from '@/hooks/useStreamEngine';

type Step = 'method' | 'agent' | 'amount' | 'confirm';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const methods = [
  { id: 'bank', icon: Building, label: 'Send to Bank', desc: 'Via CoinMe fiat rails', comingSoon: true },
  { id: 'agent', icon: MapPin, label: 'Get Cash at Agent', desc: 'Find a nearby PULSE agent', comingSoon: false },
  { id: 'send', icon: Send, label: 'Send to PULSE User', desc: 'Transfer to another wallet', comingSoon: false },
];



function NumPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

  const handleKey = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (key === '.' && value.includes('.')) {
      return;
    } else {
      onChange(value + key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => handleKey(key)}
          className="h-14 rounded-xl bg-slate-800 border border-slate-700 text-white text-lg font-semibold hover:bg-slate-700 active:scale-95 transition-all"
        >
          {key === 'del' ? (
            <ArrowLeft size={20} className="mx-auto text-slate-400" />
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
}

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [step, setStep] = useState<Step>('method');
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const { withdrawAll, isPending, isConfirming, isSuccess, hash } = useWithdrawAll();

  const fee = parseFloat(amount || '0') * 0.005;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => (step === 'method' ? navigate(-1) : setStep('method'))}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-display font-semibold text-white">Withdraw</h1>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Method selection */}
          {step === 'method' && (
            <motion.div key="method" {...fadeUp} className="space-y-3">
              <Card className="p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Available Balance</p>
                <p className="text-2xl font-display font-bold text-white">Connect wallet to view</p>
              </Card>

              <h2 className="text-sm font-semibold text-slate-300 mt-6 mb-3">Withdrawal Method</h2>
              {methods.map((m) => (
                <Card
                  key={m.id}
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  hover
                  onClick={() => !m.comingSoon && setStep(m.id === 'agent' ? 'agent' : 'amount')}
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center">
                    <m.icon size={22} className={m.comingSoon ? 'text-slate-500' : 'text-blue-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{m.label}</h3>
                      {m.comingSoon && <Badge>Coming Soon</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Step 2: Agent selection */}
          {step === 'agent' && (
            <motion.div key="agent" {...fadeUp} className="space-y-3">
              {/* Map placeholder */}
              <Card className="h-40 flex items-center justify-center bg-grid-pattern bg-grid">
                <div className="text-center">
                  <MapPin size={24} className="mx-auto text-slate-500 mb-2" />
                  <p className="text-xs text-slate-500">Map loading...</p>
                </div>
              </Card>

              <h2 className="text-sm font-semibold text-slate-300 mt-4 mb-3">Nearby Agents</h2>
              <Card className="text-center py-8">
                <p className="text-slate-400 text-sm">No agents found nearby</p>
                <p className="text-slate-500 text-xs mt-1">Agents will appear once registered on-chain</p>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Amount input */}
          {step === 'amount' && (
            <motion.div key="amount" {...fadeUp} className="space-y-6">
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Enter Amount</p>
                <p className="text-5xl font-display font-bold text-white">
                  ${amount || '0'}
                </p>
                {fee > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    Platform fee: ${fee.toFixed(3)}
                  </p>
                )}
              </div>

              <NumPad value={amount} onChange={setAmount} />

              <Button
                variant="success"
                size="lg"
                className="w-full mt-4"
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setStep('confirm')}
              >
                Withdraw ${amount || '0'}
              </Button>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <motion.div key="confirm" {...fadeUp} className="text-center py-8 space-y-6">
              {isSuccess ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="h-20 w-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Check size={36} className="text-emerald-400" />
                  </motion.div>
                  <h2 className="text-xl font-display font-bold text-white">Withdrawal Confirmed!</h2>
                  <p className="text-sm text-slate-400">Your USDC has been sent</p>
                </>
              ) : (
                <>
                  <Card className="p-6">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                      Your Cashout Code
                    </p>
                    <div className="flex justify-center gap-2 mb-4">
                      {'------'.split('').map((char, i) => (
                        <div
                          key={i}
                          className="w-10 h-12 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-xl font-mono font-bold text-white">{char}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <Clock size={14} />
                      <span className="text-sm font-mono">Code generated on-chain</span>
                    </div>
                  </Card>
                  <p className="text-sm text-slate-400">
                    Show this code to the agent to receive cash
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isPending || isConfirming}
                    onClick={() => withdrawAll()}
                  >
                    {isPending ? 'Approve in Wallet...' : isConfirming ? 'Confirming...' : 'Confirm Withdrawal'}
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
