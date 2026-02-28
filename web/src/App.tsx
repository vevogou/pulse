import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { config } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

// Lazy load pages
const Landing = lazy(() => import('@/pages/Landing'));
const WorkerHome = lazy(() => import('@/pages/WorkerHome'));
const WithdrawPage = lazy(() => import('@/pages/WithdrawPage'));
const EmployerDashboard = lazy(() => import('@/pages/EmployerDashboard'));
const MerchantDashboard = lazy(() => import('@/pages/MerchantDashboard'));
const StreamDetail = lazy(() => import('@/pages/StreamDetail'));
const Profile = lazy(() => import('@/pages/Profile'));
const OnboardWorker = lazy(() => import('@/pages/OnboardWorker'));
const OnboardEmployer = lazy(() => import('@/pages/OnboardEmployer'));
const Login = lazy(() => import('@/pages/Login'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

/** Route guard — redirects to landing if not authenticated with the required role */
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { role, isConnected, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isConnected) return <Navigate to="/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { role, isConnected } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboard/worker" element={<OnboardWorker />} />
          <Route path="/onboard/employer" element={<OnboardEmployer />} />

          {/* Worker */}
          <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerHome /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute allowedRoles={['worker']}><WithdrawPage /></ProtectedRoute>} />
          <Route path="/stream/:id" element={<ProtectedRoute allowedRoles={['worker']}><StreamDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['worker']}><Profile /></ProtectedRoute>} />

          {/* Employer */}
          <Route path="/employer" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/:section" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />

          {/* Merchant */}
          <Route path="/merchant" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#3B82F6',
            accentColorForeground: '#FFFFFF',
            borderRadius: 'large',
            overlayBlur: 'small',
          })}
        >
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#1E293B',
                  color: '#F1F5F9',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                },
              }}
            />
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
