'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PartnerBanner from '@/components/PartnerBanner';
import BatchDashboard from '@/components/BatchDashboard';
import GpsRouteMap from '@/components/GpsRouteMap';
import AiSpoilageScanner from '@/components/AiSpoilageScanner';
import IotMerkleGateway from '@/components/IotMerkleGateway';
import InsurancePoolSection from '@/components/InsurancePoolSection';
import WalletModal, { DEMO_ACCOUNTS, DemoAccount } from '@/components/WalletModal';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Coins, 
  Truck, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Layers,
  Leaf
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar matching Agrovia Reference */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        account={currentAccount}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* View Switching */}
      {activeTab === 'home' && (
        <>
          {/* Hero Section matching the user's uploaded reference image */}
          <Hero
            onExplore={() => {
              const el = document.getElementById('dashboard-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onMeetFarmers={() => {
              const el = document.getElementById('ai-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Partner Ribbon from reference image */}
          <PartnerBanner />

          {/* Quick Metrics Bar */}
          <div className="bg-slate-900/60 border-b border-slate-800 py-6 px-6 sm:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">$4.8M+</div>
                <div className="text-xs text-slate-400 mt-1">Escrow Volume Protected</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0.00%</div>
                <div className="text-xs text-slate-400 mt-1">Unsettled Spoilage Disputes</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-400 mt-1">Hardware ECDSA Verified</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">&lt;2.4s</div>
                <div className="text-xs text-slate-400 mt-1">Autonomous Slashing Speed</div>
              </div>
            </div>
          </div>

          {/* Section 1: Escrow & Consignment Operations */}
          <div id="dashboard-section">
            <BatchDashboard
              initialBatchId={1}
              onNavigateToVision={() => setActiveTab('ai-vision')}
              onNavigateToMap={() => setActiveTab('map')}
            />
          </div>

          {/* Section 2: Realtime GPS Map */}
          <div className="border-t border-slate-900 bg-slate-950/40">
            <GpsRouteMap />
          </div>

          {/* Section 3: AI Produce Vision */}
          <div id="ai-section" className="border-t border-slate-900 bg-slate-900/20">
            <AiSpoilageScanner />
          </div>

          {/* Section 4: Hardware IoT & Merkle Explorer */}
          <div className="border-t border-slate-900 bg-slate-950/60">
            <IotMerkleGateway />
          </div>

          {/* Section 5: Parametric Insurance Pool */}
          <div className="border-t border-slate-900 bg-slate-900/30">
            <InsurancePoolSection />
          </div>
        </>
      )}

      {activeTab === 'consignments' && (
        <div className="pt-28 pb-12 flex-1">
          <BatchDashboard
            initialBatchId={1}
            onNavigateToVision={() => setActiveTab('ai-vision')}
            onNavigateToMap={() => setActiveTab('map')}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="pt-28 pb-12 flex-1">
          <GpsRouteMap />
        </div>
      )}

      {activeTab === 'ai-vision' && (
        <div className="pt-28 pb-12 flex-1">
          <AiSpoilageScanner />
        </div>
      )}

      {activeTab === 'iot-gateway' && (
        <div className="pt-28 pb-12 flex-1">
          <IotMerkleGateway />
        </div>
      )}

      {activeTab === 'insurance' && (
        <div className="pt-28 pb-12 flex-1">
          <InsurancePoolSection />
        </div>
      )}

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 px-6 sm:px-12 text-slate-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
              🌱
            </div>
            <div>
              <span className="font-bold text-white text-sm">Agrovia</span> &mdash; AgriFresh Protocol
              <div className="text-[10px] text-slate-500">Autonomous Cold-Chain Escrow & Parametric Insurance</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <span>Base Sepolia L2</span>
            <span>•</span>
            <span>ERC-4337 Account Abstraction</span>
            <span>•</span>
            <span>IPFS / Filecoin Merkle Proofs</span>
            <span>•</span>
            <span>secp256k1 Hardware Signatures</span>
          </div>

          <div className="text-[10px] text-slate-500">
            Smart Contracts: 0xaB1C2d...F7A8B9C (Verified)
          </div>
        </div>
      </footer>

      {/* Persona / Web3 Wallet Switcher Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        currentAccount={currentAccount}
        onSelectAccount={setCurrentAccount}
      />
    </main>
  );
}
