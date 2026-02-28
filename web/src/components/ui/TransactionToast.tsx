import React, { useEffect } from 'react';
import toast, { type Toast } from 'react-hot-toast';
import { ExternalLink, Check, Loader2, AlertCircle } from 'lucide-react';
import { explorerTxUrl } from '@/lib/utils';

interface TxToastProps {
  t: Toast;
  status: 'pending' | 'confirming' | 'confirmed' | 'error';
  hash?: string;
  message?: string;
}

function TxToastContent({ t, status, hash, message }: TxToastProps) {
  const icon =
    status === 'confirmed' ? (
      <Check size={18} className="text-emerald-400" />
    ) : status === 'error' ? (
      <AlertCircle size={18} className="text-red-400" />
    ) : (
      <Loader2 size={18} className="text-blue-400 animate-spin" />
    );

  const label =
    status === 'pending'
      ? 'Waiting for approval...'
      : status === 'confirming'
        ? 'Confirming on Polygon...'
        : status === 'confirmed'
          ? message || 'Transaction confirmed!'
          : message || 'Transaction failed';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-sm ${
        t.visible ? 'animate-slide-up' : 'opacity-0'
      }`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{label}</p>
        {hash && (
          <a
            href={explorerTxUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5"
          >
            View on Polygonscan
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

export function showTxToast(
  status: 'pending' | 'confirming' | 'confirmed' | 'error',
  hash?: string,
  message?: string
) {
  return toast.custom(
    (t) => <TxToastContent t={t} status={status} hash={hash} message={message} />,
    {
      duration: status === 'confirmed' ? 5000 : status === 'error' ? 6000 : Infinity,
      position: 'top-right',
    }
  );
}
