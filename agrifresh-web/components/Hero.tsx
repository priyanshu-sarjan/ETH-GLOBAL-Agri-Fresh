'use client';
import React from 'react';
import { ArrowUpRight, Star } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onMeetFarmers: () => void;
}

export default function Hero({ onExplore, onMeetFarmers }: HeroProps) {
  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between pt-32 pb-8 px-6 md:px-12 overflow-hidden">
      {/* Background Image with soft gradient overlay matching reference photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10 brightness-95"
        style={{
          backgroundImage: `url('/agrovia-hero.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/90" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/30" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl pt-12 md:pt-16">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-md">
          Smart Farming for <br />
          <span className="font-serif italic font-normal text-white/95 tracking-normal">
            Future Generations
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-white/85 max-w-xl font-normal leading-relaxed drop-shadow">
          Send, receive, and track your agricultural finances in one secure protocol built for speed, clarity, and automated cryptographic cold-chain SLA enforcement.
        </p>

        {/* CTA Buttons - Matching reference design exactly */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onExplore}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#a3e635] hover:bg-[#bef264] text-slate-950 text-sm font-semibold transition-all duration-200 shadow-xl shadow-lime-500/20 active:scale-95 cursor-pointer"
          >
            <span>Start Tracking</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onMeetFarmers}
            className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium border border-white/25 backdrop-blur-md transition-all duration-200 shadow-lg active:scale-95 cursor-pointer"
          >
            Meet the Farmers
          </button>
        </div>
      </div>

      {/* Bottom Bar - Scroll Indicator & Community Rating from screenshot */}
      <div className="pt-12 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        {/* Left: SCROLL indicator */}
        <div className="flex items-center gap-3 text-white/80 tracking-wider">
          <span className="uppercase font-semibold tracking-widest text-[11px]">SCROLL</span>
          <span className="text-white/60">↓</span>
        </div>

        {/* Right: Rating & Overlapping Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-sans font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-white text-xs">4.9</span>
          </div>

          {/* Overlapping Avatars */}
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow">
              🌾
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow">
              🥭
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow">
              🚛
            </div>
          </div>

          <span className="text-white/80 font-sans font-medium text-xs">
            10k+ Farmers & Transporters
          </span>
        </div>
      </div>
    </div>
  );
}

