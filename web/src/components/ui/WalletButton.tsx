import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { truncateAddress, explorerAddressUrl } from '@/lib/utils';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none' as const, userSelect: 'none' as const },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Wallet size={16} />
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Chain indicator */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-1.5 h-10 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm transition-colors"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-slate-300 text-xs">{chain.name}</span>
                  </button>

                  {/* Account */}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 h-10 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm transition-colors"
                  >
                    <span className="text-white font-mono text-xs">
                      {truncateAddress(account.address)}
                    </span>
                    {account.displayBalance && (
                      <span className="text-slate-400 text-xs">
                        {account.displayBalance}
                      </span>
                    )}
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
