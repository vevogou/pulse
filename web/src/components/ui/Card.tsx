import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: 'emerald' | 'blue' | null;
}

export function Card({ children, className, hover = false, glow, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transition: { duration: 0.2 } }
          : undefined
      }
      className={cn(
        'bg-slate-800 rounded-2xl border border-slate-700 shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-6',
        glow === 'emerald' && 'glow-emerald',
        glow === 'blue' && 'glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
