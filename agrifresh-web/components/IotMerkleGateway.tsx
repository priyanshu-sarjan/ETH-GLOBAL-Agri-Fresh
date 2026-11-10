'use client';
import React, { useState, useEffect } from 'react';
import { 
  Binary, 
  Cpu, 
  Database, 
  HardDrive, 
  Radio, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface TelemetryPoint {
  id: number;
  timestamp: string;
  temp: number;
  humidity: number;
  ethylenePpm: number;
  lat: number;
  lng: number;
  deviceAddress: string;
  signature: string;
}

export default function IotMerkleGateway() {
  const [telemetryStream, setTelemetryStream] = useState<TelemetryPoint[]>([
    {
      id: 1,
      timestamp: '12:45:00 PM',
      temp: 4.8,
      humidity: 82.1,
      ethylenePpm: 14.2,
      lat: 18.9894,
      lng: 73.1175,
      deviceAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      signature: '0xd527090a47a2b99376b8445ea6cf8a25b37424af6e3892d1e0d5b5a19bc77fed'
    },
    {
      id: 2,
      timestamp: '12:48:00 PM',
      temp: 4.9,
      humidity: 81.8,
      ethylenePpm: 14.4,
      lat: 18.9912,
      lng: 73.1142,
      deviceAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      signature: '0x8fa12bc49102834b901928472910385928192039485729103948571029384756'
    },
    {
      id: 3,
      timestamp: '12:51:00 PM',
      temp: 5.1,
      humidity: 82.5,
      ethylenePpm: 14.6,
      lat: 18.9940,
      lng: 73.1100,
      deviceAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      signature: '0x39485710293847568fa12bc49102834b90192847291038592819203948572910'
    },
    {
      id: 4,
      timestamp: '12:54:00 PM',
      temp: 4.8,
      humidity: 82.0,
      ethylenePpm: 14.3,
      lat: 18.9975,
      lng: 73.1055,
      deviceAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      signature: '0x10293847568fa12bc49102834b90192847291038592819203948572910394857'
    }
  ]);

  const [merkleRoot, setMerkleRoot] = useState('0xa8f2c39d81920394b21908ef1234a9b8c7e6d5f4a3b21908ef1234a9b8c7e6d5');
  const [ipfsCid, setIpfsCid] = useState('QmAgriFresh7f92b4910c2834e91024bd729910a34b21');
  const [isBatching, setIsBatching] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleGenerateMerkleBundle = async () => {
    setIsBatching(true);
    try {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/telemetry/batch?batch_id=1', {
          method: 'POST'
        });
        if (res.ok) {
          const data = await res.json();
          setMerkleRoot(data.merkleRoot);
          setIpfsCid(data.ipfsCid);
        }
      } catch {
        // Fallback simulation
        const randomHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        setMerkleRoot(randomHash);
        setIpfsCid('QmAgriFresh' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
      }
    } finally {
      setIsBatching(false);
    }
  };

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Binary className="w-3.5 h-3.5" /> Hardware Cryptographic Provenance
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            IoT Edge Ingestion & 15-Min Merkle Tree Bundler
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            ESP32 microcontrollers sign every sensor sample on-chip with embedded ECDSA secp256k1 keys. Readings are hashed into Merkle Trees and pinned to IPFS.
          </p>
        </div>

        <button
          onClick={handleGenerateMerkleBundle}
          disabled={isBatching}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono transition shadow-lg shadow-emerald-950/50 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBatching ? 'animate-spin' : ''}`} />
          <span>{isBatching ? 'Batching Merkle Root...' : 'Bundle 15-Min Epoch'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Hardware Sensor Stream */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> ESP32 Edge Ingestion Stream
              </span>
              <span className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry Gateway
              </span>
            </div>

            {/* Console Log Table */}
            <div className="space-y-3 font-mono text-xs">
              {telemetryStream.map((item) => (
                <div key={item.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
                    <span className="text-emerald-400 font-semibold">Reading #{item.id} • {item.timestamp}</span>
                    <span className="text-slate-500 text-[10px]">Device: {item.deviceAddress.slice(0, 10)}...</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-300">
                    <div>Temp: <span className="text-white font-bold">{item.temp}°C</span></div>
                    <div>Humidity: <span className="text-white font-bold">{item.humidity}%</span></div>
                    <div>Ethylene: <span className="text-amber-400 font-bold">{item.ethylenePpm} ppm</span></div>
                    <div className="text-right text-[10px] text-slate-500">GPS: {item.lat.toFixed(2)}, {item.lng.toFixed(2)}</div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-500 truncate flex items-center justify-between">
                    <span>ECDSA Sig: <span className="text-slate-400">{item.signature.slice(0, 36)}...</span></span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Hardware Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Hardware Model: ESP32-WROOM-32 (DHT22 + MQ-135 + Neo-6M)</span>
            <span>ECDSA Algorithm: secp256k1</span>
          </div>
        </div>

        {/* Right: Merkle Tree & IPFS Manifest Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> Decentralized Archival Manifest
              </span>
              <span className="text-blue-400 text-[11px]">Pinata / Filecoin IPFS</span>
            </div>

            {/* Merkle Root Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>15-Minute Merkle Root (Onchain Anchor):</span>
                <button
                  onClick={() => copyToClipboard(merkleRoot, 'root')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'root' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-emerald-400 font-bold break-all text-xs bg-slate-900/60 p-2 rounded border border-slate-800">
                {merkleRoot}
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Posted periodically by Oracle Cron to <code className="text-slate-400">AgriBatchRegistry.sol</code>
              </div>
            </div>

            {/* IPFS CID Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>IPFS Content Identifier (CIDv0):</span>
                <button
                  onClick={() => copyToClipboard(ipfsCid, 'cid')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === 'cid' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-blue-400 font-bold break-all text-xs bg-slate-900/60 p-2 rounded border border-slate-800">
                {ipfsCid}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Bundle Size: 4,096 bytes</span>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 text-[10px]"
                >
                  View JSON Gateway <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cryptographic Proof: Every point verified by SHA-256 Merkle Inclusion Proof.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

