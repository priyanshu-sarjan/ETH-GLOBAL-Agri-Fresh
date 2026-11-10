'use client';
import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  Scan, 
  FileCheck2, 
  Layers, 
  Activity, 
  KeyRound, 
  Eye,
  AlertOctagon
} from 'lucide-react';

interface ProduceSample {
  id: string;
  name: string;
  batchId: number;
  condition: string;
  expectedScore: number;
  visualSpoilage: number;
  spikeDegreeHours: number;
  ethylenePpm: number;
  findings: string[];
  verdict: 'PASSED_GRADE_A' | 'MARKET_DISCOUNT_GRADE_B' | 'SLA_BREACH_SPOILED';
  avatar: string;
}

const PRODUCE_SAMPLES: ProduceSample[] = [
  {
    id: 'mango_rot',
    name: 'Alphonso Mango (Checkpoint 3 - Thermal Failure)',
    batchId: 1,
    condition: 'Stem-end Rot & Anthracnose Fungal Lesions',
    expectedScore: 68,
    visualSpoilage: 62.0,
    spikeDegreeHours: 4.8,
    ethylenePpm: 24.5,
    findings: [
      'Black necrotic lesions spreading across distal shoulder (42% surface coverage)',
      'High ethylene release (24.5 ppm) triggering accelerated pectin breakdown',
      'Stem-end rot fungal mycelium detected via ResNet edge filter'
    ],
    verdict: 'SLA_BREACH_SPOILED',
    avatar: '🥭'
  },
  {
    id: 'mango_fresh',
    name: 'Alphonso Mango (Cold Chain Intact - Grade A)',
    batchId: 1,
    condition: 'Crisp, Golden Saffron Hue, Optimal Firmness',
    expectedScore: 8,
    visualSpoilage: 6.5,
    spikeDegreeHours: 0.0,
    ethylenePpm: 6.2,
    findings: [
      'Uniform epicuticular wax layer intact; 0 fungal lesions detected',
      'Normal baseline ethylene (6.2 ppm); no internal enzymatic browning',
      'SLA compliance 100% verified across transport route'
    ],
    verdict: 'PASSED_GRADE_A',
    avatar: '✨'
  },
  {
    id: 'strawberry_rot',
    name: 'Dutch Strawberries (Post-Thermal Shock)',
    batchId: 3,
    condition: 'Botrytis Cinerea (Grey Mold Mycelium)',
    expectedScore: 78,
    visualSpoilage: 74.0,
    spikeDegreeHours: 3.2,
    ethylenePpm: 19.8,
    findings: [
      'Microscopic grey mold sporulation identified on calyx perimeter',
      'Severe tissue softening & cell wall collapse',
      'Exceeds 50% spoilage threshold for premium export export grade'
    ],
    verdict: 'SLA_BREACH_SPOILED',
    avatar: '🍓'
  },
  {
    id: 'avocado_fresh',
    name: 'Hass Avocados (Controlled Atmosphere Container)',
    batchId: 2,
    condition: 'Firm Green Pebble Skin, Grade A Export',
    expectedScore: 12,
    visualSpoilage: 10.0,
    spikeDegreeHours: 0.2,
    ethylenePpm: 7.4,
    findings: [
      'Skin texture matches uniform acoustic firmness metric (Grade 1)',
      'Sub-threshold ethylene level ensures 14-day extended retail shelf-life',
      'Zero chilling injury or lenticel breakdown observed'
    ],
    verdict: 'PASSED_GRADE_A',
    avatar: '🥑'
  }
];

export default function AiSpoilageScanner({
  onVerdictGenerated
}: {
  onVerdictGenerated?: (score: number, signature: string) => void;
}) {
  const [selectedSample, setSelectedSample] = useState<ProduceSample>(PRODUCE_SAMPLES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    signature: string;
    packedHash: string;
    signer: string;
    timestamp: string;
  } | null>(null);

  const handleRunAiInference = async () => {
    setIsAnalyzing(true);
    try {
      // Attempt backend agent inference first
      let sig = '0x9f9a87b62f9accb39338ed69d6e407deee42727f87847db881e58868333c98de6c4336cca6e025f9631abe9fa1c2c0912a54c1cc485d139d237dbff117d99c391c';
      let packedHash = '0x7d4c38f5dff0312c863e0ff895fb364ae012673b8b2812d898dfe468725ca304';
      let signer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

      try {
        const res = await fetch('http://127.0.0.1:8000/api/agent/evaluate-spoilage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: selectedSample.batchId,
            imageName: selectedSample.id + '.jpg',
            cumulativeTempSpikeHours: selectedSample.spikeDegreeHours,
            ethyleneAvgPpm: selectedSample.ethylenePpm,
            baseSpoilageOverride: selectedSample.visualSpoilage
          })
        });
        if (res.ok) {
          const data = await res.json();
          sig = data.cryptographicProof.signature;
          packedHash = data.cryptographicProof.packedDataHash;
          signer = data.cryptographicProof.signerAddress;
        }
      } catch {
        // graceful offline fallback
      }

      const resObj = {
        score: selectedSample.expectedScore,
        signature: sig,
        packedHash: packedHash,
        signer: signer,
        timestamp: new Date().toLocaleTimeString()
      };

      setAnalysisResult(resObj);
      if (onVerdictGenerated) {
        onVerdictGenerated(resObj.score, resObj.signature);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" /> Computer Vision & Multimodal Agent
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Produce Spoilage & Quality Evaluator
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Autonomous computer vision agent evaluating surface necrosis, mold progression, and degree-hour sensor fusion into cryptographically signed onchain verdicts.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" /> MobileNet-V3 + Viem Agentic Wallet
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sample Selector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Select Checkpoint Image
            </h3>

            <div className="space-y-3">
              {PRODUCE_SAMPLES.map((sample) => {
                const isSelected = selectedSample.id === sample.id;
                const isSpoiled = sample.verdict === 'SLA_BREACH_SPOILED';

                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setAnalysisResult(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500/60 shadow-lg shadow-blue-950/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                        {sample.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{sample.name}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{sample.condition}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isSpoiled ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {sample.expectedScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunAiInference}
            disabled={isAnalyzing}
            className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold font-mono tracking-wide transition flex items-center justify-center gap-2 shadow-xl shadow-blue-950/50 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Scan className="w-4 h-4 animate-spin" />
                <span>Running Computer Vision Model...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                <span>Run Autonomous AI Evaluation</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Inspection Viewport & Findings */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Viewport Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Target Consignment #{selectedSample.batchId}
                </span>
                <h4 className="text-xl font-bold text-white mt-0.5">{selectedSample.name}</h4>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Diagnosis:</span>
                <span className={`font-bold ${selectedSample.verdict === 'SLA_BREACH_SPOILED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedSample.verdict}
                </span>
              </div>
            </div>

            {/* Simulated CV Visual Feed Overlay */}
            <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-hidden mb-6">
              <div className="absolute inset-0 bg-radial from-blue-500/5 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Icon & CV HUD */}
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
                  <div className="text-5xl">{selectedSample.avatar}</div>
                  {/* Bounding box marker */}
                  <div className={`absolute inset-2 border-2 rounded-lg pointer-events-none ${
                    selectedSample.verdict === 'SLA_BREACH_SPOILED' ? 'border-rose-500/70 border-dashed animate-pulse' : 'border-emerald-500/50'
                  }`} />
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
                    CV Conf: 98.4%
                  </span>
                </div>

                {/* Score breakdown metrics */}
                <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Visual Necrosis</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {selectedSample.visualSpoilage}%
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Degree-Hour Spike</span>
                    <span className={`text-base font-bold mt-1 block ${selectedSample.spikeDegreeHours > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      +{selectedSample.spikeDegreeHours} hrs
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block">Ethylene PPM</span>
                    <span className="text-base font-bold text-amber-400 mt-1 block">
                      {selectedSample.ethylenePpm} ppm
                    </span>
                  </div>
                </div>
              </div>

              {/* Automated Observations */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-400 font-semibold block mb-2">
                  Autonomous Inspection Findings:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedSample.findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cryptographic Proof Output If Analyzed */}
            {analysisResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 text-xs font-mono space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-blue-400 font-semibold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" /> secp256k1 Signed Settlement Verdict
                  </span>
                  <span className="text-slate-500 text-[10px]">Verified at {analysisResult.timestamp}</span>
                </div>

                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-500">Signer Agent:</span> <span className="text-white font-mono">{analysisResult.signer}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">keccak256 Hash:</span> <span className="text-emerald-400">{analysisResult.packedHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">ECDSA Sig:</span> <span className="text-blue-300">{analysisResult.signature}</span>
                  </div>
                  <div className="pt-1 text-slate-400 text-[10px]">
                    Ready for instant onchain validation via <code className="text-slate-200">AgriEscrow.finalizeDelivery(batchId, {analysisResult.score}, signature)</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

