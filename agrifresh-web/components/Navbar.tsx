'use client';
import React from 'react';
import { Wallet, ShieldCheck, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  account: {
    name: string;
    role: string;
    address: string;
    balance: string;
  };
  onOpenWalletModal: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  account,
  onOpenWalletModal
}: NavbarProps) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'consignments', label: 'Consignments' },
    { id: 'map', label: 'Live GPS Map' },
    { id: 'ai-vision', label: 'AI Quality Vision' },
    { id: 'iot-gateway', label: 'IoT Gateway' },
    { id: 'insurance', label: 'Insurance Pool' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      {/* Brand Logo - Styled exactly like Agrovia in the reference image */}
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
          <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2Z" />
            <path d="M7 12c3-4 7-4 10 0" />
            <path d="M12 8v8" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-sans drop-shadow-md">
          Agrovia
        </span>
      </div>

      {/* Center Floating Pill Menu - Frosted Glass from reference image */}
      <nav className="hidden md:flex items-center p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl shadow-black/20">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-slate-950 shadow-md font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right Action - Connect Wallet / Role Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenWalletModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition shadow-lg shadow-black/10 active:scale-95"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline font-mono">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
          <span className="text-slate-500 font-normal">({account.role})</span>
          <Wallet className="w-3.5 h-3.5 text-slate-700" />
        </button>
      </div>
    </header>
  );
}

