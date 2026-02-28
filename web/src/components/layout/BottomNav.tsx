import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowUpRight, MapPin, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { icon: Home, label: 'Home', path: '/worker' },
  { icon: ArrowUpRight, label: 'Send', path: '/worker/withdraw' },
  { icon: MapPin, label: 'Agents', path: '/worker/withdraw' },
  { icon: Clock, label: 'History', path: '/worker' },
  { icon: User, label: 'Profile', path: '/worker/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors',
                isActive ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
