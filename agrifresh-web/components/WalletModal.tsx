'use client';
import React from 'react';
import { X, Check, Wallet, ShieldCheck, UserCheck, Bot } from 'lucide-react';

export interface DemoAccount {
  name: string;
  role: string;
  address: string;
  balance: string;
  avatar: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Bob Buyer (Wholesale Dist.)',
    role: 'Buyer',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balance: '25,000 USDC',
    avatar: '🛒'
  },
  {
    name: 'Alice Farmer (Ratnagiri Orchards)',
    role: 'Farmer',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    balance: '8,420 USDC',
    avatar: '🌾'
  },
  {
    name: 'ColdRoute Express Logistics',
    role: 'Transporter',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    balance: '14,800 USDC',
    avatar: '🚛'
  },
  {
    name: 'Autonomous AI Quality Agent',
    role: 'AI Oracle',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    balance: '2.5 ETH (Gas)',
    avatar: '🤖'
  }
];

export default function WalletModal({
  isOpen,
  onClose,
  currentAccount,
  onSelectAccount
}: {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: DemoAccount;
  onSelectAccount: (acc: DemoAccount) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg">Select Web3 / Account Abstraction Persona</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Switch between verified ERC-4337 participant roles to test multi-party escrow deposits, IoT staking, and AI settlement permissions on Base Sepolia.
        </p>

        <div className="space-y-3 mb-6">
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelected = currentAccount.address === acc.address;
            return (
              <div
                key={acc.address}
                onClick={() => {
                  onSelectAccount(acc);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-normal">({acc.role})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {acc.address.slice(0, 10)}...{acc.address.slice(-6)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-slate-200">{acc.balance}</div>
                  {isSelected && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Active
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Network: Base Sepolia (Chain 84532)
          </span>
          <span className="text-slate-500">RPC: sepolia.base.org</span>
        </div>
      </div>
    </div>
  );
}

