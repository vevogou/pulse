import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Banknote, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/employer' },
  { icon: Users, label: 'Workers', path: '/employer' },
  { icon: Banknote, label: 'Payroll', path: '/employer' },
  { icon: TrendingUp, label: 'Yield', path: '/employer' },
  { icon: Settings, label: 'Settings', path: '/employer' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 px-3">
        <img src="/logo.png" alt="PULSE" className="h-7 w-auto" />
      </Link>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">PULSE v1.0 — Polygon Mainnet</p>
      </div>
    </aside>
  );
}
