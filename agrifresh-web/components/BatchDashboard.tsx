'use client';
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  Thermometer, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  ExternalLink,
  Flame,
  FileCode2,
  Lock
} from 'lucide-react';

export interface BatchItem {
  id: number;
  produceName: string;
  origin: string;
  destination: string;
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  ethylenePpm: number;
  paymentAmount: number;
  transporterStake: number;
  hoursLeft: number;
  status: 'InTransit' | 'Slashed' | 'Delivered';
  anomalyFlagged: boolean;
  anomalyReason?: string;
  contractAddress: string;
  txHash?: string;
  settlementDetails?: {
    buyerRefund: number;
    farmerPayout: number;
    transporterReturn: number;
    timestamp: string;
  };
}

export default function BatchDashboard({
  initialBatchId = 1,
  onNavigateToVision,
  onNavigateToMap
}: {
  initialBatchId?: number;
  onNavigateToVision?: () => void;
  onNavigateToMap?: () => void;
}) {
  const [batches, setBatches] = useState<Record<number, BatchItem>>({
    1: {
      id: 1,
      produceName: 'Alphonso Mangoes (Ratnagiri GI Tag)',
      origin: 'Ratnagiri Orchards, MH',
      destination: 'Cold-Hub Distribution Terminal, Mumbai',
      currentTemp: 4.8,
      maxTemp: 8.0,
      minTemp: 2.0,
      humidity: 82.1,
      ethylenePpm: 14.2,
      paymentAmount: 2500,
      transporterStake: 500,
      hoursLeft: 18,
      status: 'InTransit',
      anomalyFlagged: false,
      contractAddress: '0xaB1C2d3E4f5A6B7c8D9E0f1A2B3C4D5E6F7A8B9C'
    },
    2: {
      id: 2,
      produceName: 'Organic Hass Avocados',
      origin: 'Salinas Valley Farm, CA',
      destination: 'Port of Oakland Terminal',
      currentTemp: 5.2,
      maxTemp: 7.5,
      minTemp: 3.0,
      humidity: 78.5,
      ethylenePpm: 8.1,
      paymentAmount: 4200,
      transporterStake: 850,
      hoursLeft: 26,
      status: 'InTransit',
      anomalyFlagged: false,
      contractAddress: '0xaB1C2d3E4f5A6B7c8D9E0f1A2B3C4D5E6F7A8B9C'
    },
    3: {
      id: 3,
      produceName: 'Dutch Hydroponic Strawberries',
      origin: 'Westland Greenhouses, NL',
      destination: 'Rotterdam Export Hub',
      currentTemp: 3.1,
      maxTemp: 5.0,
      minTemp: 1.0,
      humidity: 88.0,
      ethylenePpm: 6.4,
      paymentAmount: 1800,
      transporterStake: 400,
      hoursLeft: 11,
      status: 'InTransit',
      anomalyFlagged: false,
      contractAddress: '0xaB1C2d3E4f5A6B7c8D9E0f1A2B3C4D5E6F7A8B9C'
    }
  });

  const [selectedBatchId, setSelectedBatchId] = useState<number>(initialBatchId);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeBatch = batches[selectedBatchId] || batches[1];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSimulateColdChainFailure = async () => {
    setIsSimulating(true);
    try {
      // Post to backend agent if available
      try {
        await fetch('http://127.0.0.1:8000/api/agent/trigger-anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: selectedBatchId,
            observedTemp: 14.8,
            reason: 'Refrigeration Compressor Power Loss'
          })
        });
      } catch {
        // graceful offline simulation fallback
      }

      setBatches(prev => ({
        ...prev,
        [selectedBatchId]: {
          ...prev[selectedBatchId],
          currentTemp: 14.8,
          anomalyFlagged: true,
          anomalyReason: 'Compressor Power Loss (14.8°C > 8.0°C)',
          status: 'Slashed',
          txHash: '0x8f2a93c7b18921df348e91024bd729910a34b21908ef1234a9b8c7e6d5f4a3b2',
          settlementDetails: {
            buyerRefund: prev[selectedBatchId].paymentAmount,
            farmerPayout: prev[selectedBatchId].transporterStake, // Distressed compensation
            transporterReturn: 0, // Slashed 100%
            timestamp: new Date().toLocaleTimeString()
          }
        }
      }));

      showToast(`⚠️ SLA Breached! Transporter collateral (${activeBatch.transporterStake} USDC) slashed to farmer. Buyer refunded 100%!`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateNormalDelivery = async () => {
    setIsSimulating(true);
    try {
      setBatches(prev => ({
        ...prev,
        [selectedBatchId]: {
          ...prev[selectedBatchId],
          status: 'Delivered',
          txHash: '0x3c99a812ef0981b24765dca981023910928b9d816a120489bcf78120e3a98710',
          settlementDetails: {
            buyerRefund: 0,
            farmerPayout: prev[selectedBatchId].paymentAmount,
            transporterReturn: prev[selectedBatchId].transporterStake,
            timestamp: new Date().toLocaleTimeString()
          }
        }
      }));

      showToast(`✅ Consignment Verified! Farmer received ${activeBatch.paymentAmount} USDC. Transporter stake returned.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetBatch = () => {
    setBatches(prev => ({
      ...prev,
      [selectedBatchId]: {
        ...prev[selectedBatchId],
        currentTemp: selectedBatchId === 1 ? 4.8 : selectedBatchId === 2 ? 5.2 : 3.1,
        status: 'InTransit',
        anomalyFlagged: false,
        anomalyReason: undefined,
        txHash: undefined,
        settlementDetails: undefined
      }
    }));
    showToast('Consignment reset to active In-Transit state.');
  };

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and Consignment Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" /> Autonomous Onchain Escrow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Active Consignments & Escrow Vaults
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Live cold-chain SLA enforcement powered by verified hardware telemetry and autonomous AI settlement on Base L2.
          </p>
        </div>

        {/* Consignment Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
          {Object.values(batches).map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBatchId(b.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedBatchId === b.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Batch #{b.id}: {b.produceName.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dashboard Card matching the prompt specifications */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
              <span>Active Consignment</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Escrow Contract: {activeBatch.contractAddress.slice(0, 10)}...</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1">
              Consignment #{activeBatch.id} &mdash; {activeBatch.produceName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Route: <span className="text-slate-300 font-medium">{activeBatch.origin}</span> → <span className="text-slate-300 font-medium">{activeBatch.destination}</span>
            </p>
          </div>

          {/* Status Badge */}
          <div>
            {activeBatch.status === 'InTransit' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-semibold">
                <Truck className="w-4 h-4 animate-pulse" /> IN_TRANSIT
              </div>
            )}
            {activeBatch.status === 'Slashed' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-full text-xs font-mono font-semibold animate-pulse">
                <AlertTriangle className="w-4 h-4" /> SLA_BREACHED (Slashed)
              </div>
            )}
            {activeBatch.status === 'Delivered' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full text-xs font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4" /> DELIVERED & SETTLED
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Cards from Prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 1. Current Temp */}
          <div className={`p-5 rounded-xl border transition-all ${
            activeBatch.currentTemp > activeBatch.maxTemp
              ? 'bg-rose-950/40 border-rose-600/60 shadow-lg shadow-rose-950/50'
              : 'bg-slate-800/60 border-slate-700/50'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-2">
                <Thermometer className={`w-4 h-4 ${activeBatch.currentTemp > activeBatch.maxTemp ? 'text-rose-400' : 'text-emerald-400'}`} /> Current Temp
              </span>
              <span className="text-[10px] font-mono text-slate-500">DHT22</span>
            </div>
            <div className="text-2xl font-mono font-bold flex items-baseline gap-2">
              <span className={activeBatch.currentTemp > activeBatch.maxTemp ? 'text-rose-300' : 'text-white'}>
                {activeBatch.currentTemp}°C
              </span>
              <span className="text-xs text-slate-400 font-normal">
                (Max {activeBatch.maxTemp}°C)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Humidity: {activeBatch.humidity}%</span>
              <span>Gas: {activeBatch.ethylenePpm} ppm</span>
            </div>
          </div>

          {/* 2. Transporter Collateral */}
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Transporter Collateral
              </span>
              <span className="text-[10px] font-mono text-slate-500">Staked</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {activeBatch.transporterStake} USDC
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Buyer Escrow:</span>
              <span className="font-semibold text-slate-300">{activeBatch.paymentAmount} USDC</span>
            </div>
          </div>

          {/* 3. Max SLA Window */}
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Max SLA Window
              </span>
              <span className="text-[10px] font-mono text-slate-500">Countdown</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {activeBatch.hoursLeft} hrs left
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Deadline: <span className="font-mono text-slate-300">Within 24h Transit</span>
            </div>
          </div>

          {/* 4. Anomaly Status */}
          <div className={`p-5 rounded-xl border transition-all ${
            activeBatch.anomalyFlagged
              ? 'bg-rose-950/40 border-rose-600/60'
              : 'bg-slate-800/60 border-slate-700/50'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${activeBatch.anomalyFlagged ? 'text-rose-400' : 'text-emerald-400'}`} /> Anomaly Status
              </span>
              <span className="text-[10px] font-mono text-slate-500">Oracle</span>
            </div>
            <div className="text-2xl font-mono font-bold">
              {activeBatch.anomalyFlagged ? (
                <span className="text-rose-400">BREACHED</span>
              ) : (
                <span className="text-emerald-400">Normal</span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 truncate">
              {activeBatch.anomalyReason || 'All sensors within threshold bounds'}
            </div>
          </div>
        </div>

        {/* Settlement Ledger If Slashed or Delivered */}
        {activeBatch.settlementDetails && (
          <div className="mb-8 p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3 border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 font-semibold text-emerald-400">
                <FileCode2 className="w-4 h-4" /> Cryptographic Settlement Receipt & Onchain Payouts
              </span>
              <span>Executed at {activeBatch.settlementDetails.timestamp}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Buyer Refund (100%)</div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  +{activeBatch.settlementDetails.buyerRefund} USDC
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">To: Buyer Wallet</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Farmer Compensation</div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  +{activeBatch.settlementDetails.farmerPayout} USDC
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {activeBatch.status === 'Slashed' ? 'Slashed Collateral Distress Relief' : 'Full Consignment Proceeds'}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Transporter Stake Return</div>
                <div className="text-base font-bold mt-1">
                  {activeBatch.settlementDetails.transporterReturn === 0 ? (
                    <span className="text-rose-400">0 USDC (100% Slashed)</span>
                  ) : (
                    <span className="text-emerald-400">+{activeBatch.settlementDetails.transporterReturn} USDC</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Penalized for SLA breach</div>
              </div>
            </div>

            {activeBatch.txHash && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Base Sepolia Tx: {activeBatch.txHash.slice(0, 24)}...</span>
                <span className="text-emerald-400 flex items-center gap-1 cursor-pointer hover:underline">
                  View on BaseScan <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Simulate Spoilage Breach (IoT Spike) from Prompt */}
            <button
              onClick={handleSimulateColdChainFailure}
              disabled={isSimulating || activeBatch.status !== 'InTransit'}
              className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950/40 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Simulate Spoilage Breach (IoT Spike)</span>
            </button>

            {/* 2. Simulate Normal Delivery */}
            <button
              onClick={handleSimulateNormalDelivery}
              disabled={isSimulating || activeBatch.status !== 'InTransit'}
              className="px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulate Verified Delivery</span>
            </button>

            {/* Reset */}
            {activeBatch.status !== 'InTransit' && (
              <button
                onClick={handleResetBatch}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            {onNavigateToMap && (
              <button 
                onClick={onNavigateToMap}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                Inspect GPS Trail <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onNavigateToVision && (
              <button 
                onClick={onNavigateToVision}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                AI Produce Scanner <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

