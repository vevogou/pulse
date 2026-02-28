import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  AlertTriangle,
  Zap,
  Building2,
  TrendingUp,
  Smartphone,
  ArrowDownCircle,
  ArrowRight,
  Github,
  Twitter,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { HeartbeatLine } from '@/components/ui/HeartbeatLine';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function PolygonBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8247E5]/10 border border-[#8247E5]/20 rounded-full">
      <svg width="16" height="14" viewBox="0 0 38 33" fill="none">
        <path
          d="M28.3 5.6L20.1 0.9C19.4 0.5 18.6 0.5 17.9 0.9L9.7 5.6C9 6 8.6 6.7 8.6 7.5V16.9C8.6 17.7 9 18.4 9.7 18.8L17.9 23.5C18.6 23.9 19.4 23.9 20.1 23.5L28.3 18.8C29 18.4 29.4 17.7 29.4 16.9V7.5C29.4 6.7 29 6 28.3 5.6Z"
          fill="#8247E5"
        />
      </svg>
      <span className="text-xs font-medium text-[#8247E5]">Powered by Polygon</span>
    </div>
  );
}

function StatsBar() {
  const stats = [
    { label: 'Streamed Today', value: '$4.2M', color: 'text-emerald-400' },
    { label: 'Active Workers', value: '12,847', color: 'text-blue-400' },
    { label: 'Per Withdrawal', value: '$0.003', color: 'text-amber-400' },
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="w-full border-y border-slate-800 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProblemCards() {
  const cards = [
    {
      icon: Calendar,
      iconColor: 'text-slate-500',
      title: 'Payday is once a month.',
      desc: 'But rent, food, and emergencies happen every day.',
      bg: 'bg-slate-800',
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      title: 'Loan sharks charge 30%.',
      desc: 'High-interest predatory lending traps workers in debt cycles.',
      bg: 'bg-slate-800',
    },
    {
      icon: Zap,
      iconColor: 'text-blue-500',
      title: 'Your money, unlocked instantly.',
      desc: 'PULSE streams your salary in real-time. Withdraw whenever you need.',
      bg: 'bg-blue-600/10 border-blue-500/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {cards.map((card, i) => (
          <React.Fragment key={card.title}>
            <motion.div variants={fadeUp}>
              <Card className={`h-full ${card.bg}`}>
                <card.icon size={28} className={`${card.iconColor} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400">{card.desc}</p>
              </Card>
            </motion.div>
            {i < 2 && (
              <div className="hidden md:flex items-center justify-center -mx-3 col-span-0">
                {/* Arrow rendered between grid items via CSS */}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', icon: Building2, title: 'Employer sets up PULSE', desc: 'Deposit payroll USDC into the vault. Start earning Aave yield immediately.' },
    { num: '02', icon: TrendingUp, title: 'Salary streams second-by-second', desc: 'Workers earn their wages continuously, tracked on-chain in real-time.' },
    { num: '03', icon: Smartphone, title: 'Check balance on the app', desc: 'Open the PULSE app and watch your balance tick up every second.' },
    { num: '04', icon: ArrowDownCircle, title: 'Withdraw whenever needed', desc: 'Tap withdraw to receive USDC instantly. No waiting, no approval needed.' },
  ];

  return (
    <div id="how-it-works" className="max-w-7xl mx-auto px-4 py-20">
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-16"
      >
        How It Works
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Dashed line connector (desktop only) */}
        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-slate-700" />

        {steps.map((step) => (
          <motion.div
            key={step.num}
            variants={fadeUp}
            className="relative text-center"
          >
            <span className="text-6xl font-display font-bold text-slate-800 absolute -top-4 left-1/2 -translate-x-1/2">
              {step.num}
            </span>
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <step.icon size={24} className="text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EmployerSection() {
  return (
    <div id="employers" className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-slate-800 border border-blue-500/20"
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #1E293B 100%)',
        }}
      >
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Attract better talent.{' '}
            <span className="text-gradient">Pay nothing extra.</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Offer real-time salary access as a benefit. Your payroll float earns yield on Aave V3
            while workers get paid by the second.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {['Earn yield on payroll float', 'Happier workforce', 'Zero integration cost'].map(
              (pill) => (
                <span
                  key={pill}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400"
                >
                  {pill}
                </span>
              )
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/onboard/employer">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              <span className="text-xs text-slate-400">Yield by</span>
              <span className="text-sm font-semibold text-white">AAVE</span>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}

function Footer() {
  const countries = ['🇪🇬', '🇳🇬', '🇰🇪', '🇲🇽', '🇮🇳'];

  return (
    <footer className="border-t border-slate-800 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-2xl">
            {countries.map((flag, i) => (
              <span key={i} className="opacity-60 hover:opacity-100 transition-opacity">
                {flag}
              </span>
            ))}
          </div>

          <img src="/logo.png" alt="PULSE" className="h-6 w-auto opacity-60" />

          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="text-center mt-8">
          <PolygonBadge />
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { role, isConnected } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in with a role, show "Go to Dashboard" instead of onboarding buttons
  const heroButtons = isConnected && role ? (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-8">
      <Button
        variant="primary"
        size="lg"
        onClick={() => {
          if (role === 'worker') navigate('/worker');
          else if (role === 'employer') navigate('/employer');
          else if (role === 'merchant') navigate('/merchant');
        }}
      >
        Go to Dashboard <ArrowRight size={16} className="ml-2" />
      </Button>
    </motion.div>
  ) : (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-8">
      <Link to="/onboard/worker">
        <Button variant="primary" size="lg">
          I'm a Worker
        </Button>
      </Link>
      <Link to="/onboard/employer">
        <Button variant="secondary" size="lg">
          I'm an Employer
        </Button>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-slate-900 relative"
    >
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
        }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <motion.section
          variants={stagger}
          className="min-h-screen flex items-center pt-16"
        >
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div variants={stagger}>
              <motion.div variants={fadeUp}>
                <PolygonBadge />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight"
              >
                Get Paid Every{' '}
                <span className="text-gradient">Second You Work.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-slate-400 max-w-lg"
              >
                Stop waiting for payday. PULSE streams your salary in real-time — withdraw any
                amount, any time.
              </motion.p>

              {heroButtons}
            </motion.div>

            {/* Right — Phone mockup */}
            <motion.div variants={fadeUp} className="flex justify-center lg:justify-end">
              <div className="relative w-[300px] h-[580px]">
                {/* Phone frame */}
                <div className="absolute inset-0 rounded-[40px] bg-slate-800 border-2 border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* Status bar */}
                  <div className="h-12 bg-slate-900/80 flex items-center justify-center">
                    <div className="w-20 h-5 bg-slate-800 rounded-full" />
                  </div>

                  {/* Screen content */}
                  <div
                    className="p-6 h-full"
                    style={{
                      backgroundImage: 'url(/bg.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 1,
                    }}
                  >
                    <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-5 mt-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                        Your balance
                      </p>
                      <p className="text-4xl font-display font-bold text-white">$12.49</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs text-emerald-400">Live Streaming</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <HeartbeatLine height={40} color="#60A5FA" />
                    </div>

                    <button className="w-full mt-6 h-12 bg-blue-600 rounded-xl text-white font-semibold text-sm">
                      Withdraw Now
                    </button>
                  </div>
                </div>

                {/* Floating glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        <StatsBar />
        <ProblemCards />
        <HowItWorks />
        <EmployerSection />
        <Footer />
      </div>
    </motion.div>
  );
}
