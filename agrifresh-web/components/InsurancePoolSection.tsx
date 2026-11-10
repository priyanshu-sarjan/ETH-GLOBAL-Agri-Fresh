'use client';
import React, { useState } from 'react';
import { ShieldCheck, Coins, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function InsurancePoolSection() {
  const [poolBalance, setPoolBalance] = useState(150000);
  const [activeCoverage, setActiveCoverage] = useState(12500);
  const [userDeposit, setUserDeposit] = useState(5000);
  const [claimedPayouts, setClaimedPayouts] = useState<Array<{
    batchId: number;
    amount: number;
    reason: string;
    timestamp: string;
  }>>([
    {
      batchId: 1,
      amount: 1500,
      reason: 'Critical Cold-Chain Thermal Spike (>14°C)',
      timestamp: 'Today at 02:46 PM'
    }
  ]);

  const [depositInput, setDepositInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDeposit = () => {
    const val = parseFloat(depositInput);
    if (!val || val <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setPoolBalance(prev => prev + val);
      setUserDeposit(prev => prev + val);
      setDepositInput('');
      setIsProcessing(false);
      setFeedback(`Successfully deposited ${val} USDC into the parametric liquidity pool.`);
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  const handleTriggerEmergencyClaim = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const claimAmount = 1500;
      setPoolBalance(prev => Math.max(0, prev - claimAmount));
      setClaimedPayouts(prev => [
        {
          batchId: 1,
          amount: claimAmount,
          reason: 'Autonomous Parametric Trigger: Compressor Power Loss',
          timestamp: 'Just now'
        },
        ...prev
      ]);
      setIsProcessing(false);
      setFeedback(`Parametric Payout Triggered! 1,500 USDC instantly disbursed to farmer wallet.`);
      setTimeout(() => setFeedback(null), 5000);
    }, 800);
  };

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      {feedback && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Coins className="w-3.5 h-3.5" /> Parametric Liquidity Underwriting
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AgriInsurance Parametric Liquidity Pool
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Autonomous crop loss insurance funded by DeFi liquidity providers. Instant oracle-triggered payouts guarantee immediate farmer distress relief without bureaucracy.
          </p>
        </div>

        <button
          onClick={handleTriggerEmergencyClaim}
          disabled={isProcessing}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Trigger Emergency Payout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Total Pool Liquidity</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            ${poolBalance.toLocaleString()} <span className="text-sm font-normal text-slate-400">USDC</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 14.2% Underwriter APY
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Active Policy Underwriting</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            ${activeCoverage.toLocaleString()} <span className="text-sm font-normal text-slate-400">USDC</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-2">
            Coverage across 14 Active Transit Batches
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Your LP Stake</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            ${userDeposit.toLocaleString()} <span className="text-sm font-normal text-slate-400">USDC</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-2">
            Earned Yield: +$178.50 USDC
          </div>
        </div>
      </div>

      {/* Interactive LP Deposit Form & Claim Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" /> Provide Underwriting Liquidity
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">
                Deposit Amount (USDC)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositInput}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold font-mono transition active:scale-95 cursor-pointer disabled:opacity-40"
                >
                  Deposit
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Deposits are locked in <code className="text-slate-300">AgriInsurancePool.sol</code> on Base Sepolia. LPs earn continuous 14.2% yield from premium payments and protocol settlement fees.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Recent Autonomous Claim Payouts
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {claimedPayouts.map((claim, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span className="text-amber-400 font-bold">Consignment #{claim.batchId} Emergency Claim</span>
                    <span className="text-slate-500">{claim.timestamp}</span>
                  </div>
                  <div className="text-white text-xs">{claim.reason}</div>
                  <div className="mt-1.5 text-emerald-400 font-bold text-xs flex items-center justify-between">
                    <span>Parametric Payout: +{claim.amount} USDC</span>
                    <span className="text-[10px] text-slate-500">Autonomous Instant Settlement</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

