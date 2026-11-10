'use client';
import React from 'react';

export default function PartnerBanner() {
  const partners = [
    { name: 'CHASE', icon: '🏛️' },
    { name: 'JOHN DEERE', icon: '🚜' },
    { name: 'GREEN', icon: '🌱' },
    { name: 'Ohms', icon: '⚡' },
    { name: 'NBOK', icon: '🛡️' },
    { name: 'LOGIX', icon: '📦' },
  ];

  return (
    <div className="bg-white text-slate-800 py-6 px-6 sm:px-12 border-y border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xs text-slate-500 font-sans tracking-wide shrink-0">
          Trusted by <span className="text-slate-900 font-bold">1,000+</span> agricultural leaders worldwide
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-8 sm:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
          {partners.map((partner) => (
            <div key={partner.name} className="flex items-center gap-2 font-mono font-bold tracking-tighter text-slate-800 text-sm sm:text-base">
              <span>{partner.icon}</span>
              <span>{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

