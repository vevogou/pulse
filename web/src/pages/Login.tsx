import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, UserPlus, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletButton } from '@/components/ui/WalletButton';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Login() {
  const { isConnected } = useAccount();
  const { role, isRegisteredWorker, isEmployer, isLoading, setRole } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if role already set
  useEffect(() => {
    if (!isConnected || isLoading) return;

    if (role === 'worker') {
      navigate('/worker', { replace: true });
    } else if (role === 'employer') {
      navigate('/employer', { replace: true });
    } else if (role === 'merchant') {
      navigate('/merchant', { replace: true });
    }
  }, [role, isConnected, isLoading, navigate]);

  // Step 1: Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-sm w-full">
            <motion.div variants={fadeUp}>
              <Card className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet size={28} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-400 mb-8">
                  Connect your wallet to access your PULSE account
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
                <p className="text-xs text-slate-500 mt-6">
                  New here?{' '}
                  <Link to="/" className="text-blue-400 hover:text-blue-300">
                    Get started
                  </Link>
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Step 2: Connected but loading on-chain data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-sm w-full text-center py-12 px-6">
            <Loader2 size={32} className="text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-white mb-2">Checking your account...</h2>
            <p className="text-sm text-slate-400">Looking you up on-chain</p>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Connected, no role detected — show role picker
  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-md w-full">
            <motion.div variants={fadeUp} className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                {isRegisteredWorker || isEmployer ? 'Choose Your Dashboard' : 'Get Started'}
              </h2>
              <p className="text-sm text-slate-400">
                {isRegisteredWorker || isEmployer
                  ? 'We found your account. Where would you like to go?'
                  : "It looks like you're new. Choose how you'd like to use PULSE."}
              </p>
            </motion.div>

            <div className="space-y-4">
              {/* Worker option */}
              <motion.div variants={fadeUp}>
                {isRegisteredWorker ? (
                  <button
                    onClick={() => {
                      setRole('worker');
                      navigate('/worker', { replace: true });
                    }}
                    className="w-full text-left"
                  >
                    <Card className="p-5 hover:border-blue-500/40 transition-all group cursor-pointer" hover>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <UserPlus size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white">Worker Dashboard</h3>
                          <p className="text-xs text-slate-400 mt-0.5">View your streams, balance & profile</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-400">Registered</span>
                      </div>
                    </Card>
                  </button>
                ) : (
                  <Link to="/onboard/worker">
                    <Card className="p-5 hover:border-blue-500/40 transition-all group cursor-pointer" hover>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <UserPlus size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white">I'm a Worker</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Register to receive real-time salary streams</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>

              {/* Employer option */}
              <motion.div variants={fadeUp}>
                {isEmployer ? (
                  <button
                    onClick={() => {
                      setRole('employer');
                      navigate('/employer', { replace: true });
                    }}
                    className="w-full text-left"
                  >
                    <Card className="p-5 hover:border-emerald-500/40 transition-all group cursor-pointer" hover>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={24} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white">Employer Dashboard</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Manage payroll, workers & yield</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-400">Active employer</span>
                      </div>
                    </Card>
                  </button>
                ) : (
                  <Link to="/onboard/employer">
                    <Card className="p-5 hover:border-emerald-500/40 transition-all group cursor-pointer" hover>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={24} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white">I'm an Employer</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Set up payroll and stream salaries</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>
            </div>

            <motion.p variants={fadeUp} className="text-center text-xs text-slate-500 mt-6">
              Connected as {isConnected ? 'wallet' : '—'}
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // If role is set, the useEffect will redirect — show loader while waiting
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 size={32} className="text-blue-400 animate-spin" />
    </div>
  );
}
