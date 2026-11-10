'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Truck, MapPin, AlertCircle, Navigation, Radio, Compass } from 'lucide-react';

interface Checkpoint {
  name: string;
  lat: number;
  lng: number;
  time: string;
  temp: number;
  humidity: number;
  status: 'Safe' | 'Breached' | 'Pending';
}

const CHECKPOINTS: Checkpoint[] = [
  { name: 'Ratnagiri Alphonso Farm Gate', lat: 16.9902, lng: 73.3120, time: '06:30 AM', temp: 4.2, humidity: 82.0, status: 'Safe' },
  { name: 'Kashedi Ghat Cold Relay Station', lat: 17.8821, lng: 73.4912, time: '10:15 AM', temp: 4.6, humidity: 83.5, status: 'Safe' },
  { name: 'Panvel Expressway Tollway (IoT Anomaly Site)', lat: 18.9894, lng: 73.1175, time: '02:45 PM', temp: 14.8, humidity: 92.1, status: 'Breached' },
  { name: 'JNPT Cold Logistics Terminal Hub', lat: 18.9486, lng: 72.9525, time: 'Est. 05:30 PM', temp: 4.8, humidity: 81.0, status: 'Pending' },
];

export default function GpsRouteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint>(CHECKPOINTS[2]);
  const [isLiveTracking, setIsLiveTracking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet so SSR doesn't break
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize Map focused on Maharashtra cold-chain corridor
      const map = L.map(mapContainerRef.current).setView([18.1, 73.2], 8);
      mapInstanceRef.current = map;

      // Dark style tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 18,
      }).addTo(map);

      // Route coordinates
      const latlngs: [number, number][] = CHECKPOINTS.map(c => [c.lat, c.lng]);

      // Safe route polyline (first segment)
      L.polyline(latlngs.slice(0, 2), {
        color: '#10b981',
        weight: 5,
        opacity: 0.85
      }).addTo(map);

      // Breach segment (second to third)
      L.polyline(latlngs.slice(1, 3), {
        color: '#f43f5e',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8'
      }).addTo(map);

      // Final segment
      L.polyline(latlngs.slice(2, 4), {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.6,
        dashArray: '4, 4'
      }).addTo(map);

      // Add Checkpoint Markers
      CHECKPOINTS.forEach((cp, idx) => {
        const isAnomaly = cp.status === 'Breached';
        const color = isAnomaly ? '#f43f5e' : cp.status === 'Safe' ? '#10b981' : '#3b82f6';

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.5); color: white; font-weight: bold; font-size: 11px;">
              ${idx + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([cp.lat, cp.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 160px;">
            <strong style="color: ${color}; font-size: 13px;">${cp.name}</strong><br/>
            <span>Time: <b>${cp.time}</b></span><br/>
            <span>Temp: <b style="color:${isAnomaly ? '#e11d48' : '#059669'}; font-size: 13px;">${cp.temp}°C</b></span><br/>
            <span>Humidity: <b>${cp.humidity}%</b></span><br/>
            <span>Status: <b style="color:${color};">${cp.status}</b></span>
          </div>
        `);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Real-time Satellite Telemetry
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live GPS Transit & Geofence Corridor
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            High-precision ESP32 GPS Neo-6M breadcrumb tracking with cryptographic checkpoint attestations along the cold chain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>GPS Feed: 12 Satellites Locked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[460px] flex flex-col">
          <div className="bg-slate-950/80 backdrop-blur px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Transit Route: Ratnagiri to Mumbai JNPT
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe (&lt;8°C)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Breach Spike (&gt;8°C)</span>
            </div>
          </div>

          {/* Leaflet Map element */}
          <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-[400px]" />
        </div>

        {/* Checkpoint Timeline Sidebar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" /> Checkpoint Audit Trail
            </h3>

            <div className="space-y-4">
              {CHECKPOINTS.map((cp, idx) => {
                const isSelected = selectedCheckpoint.name === cp.name;
                const isBreach = cp.status === 'Breached';

                return (
                  <div
                    key={cp.name}
                    onClick={() => setSelectedCheckpoint(cp)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                        : isBreach
                        ? 'bg-rose-950/20 border-rose-900/50 hover:bg-rose-950/40'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isBreach ? 'bg-rose-500 text-white' : cp.status === 'Safe' ? 'bg-emerald-500 text-slate-950' : 'bg-blue-500 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white leading-tight">{cp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cp.time}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <div className={`text-xs font-bold ${isBreach ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {cp.temp}°C
                        </div>
                        <div className="text-[10px] text-slate-500">{cp.humidity}% RH</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Node Detail */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[11px] mb-1">Active Inspect Point:</div>
            <div className="text-white font-bold">{selectedCheckpoint.name}</div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mt-2">
              <span>Coordinates:</span>
              <span className="text-slate-300">{selectedCheckpoint.lat.toFixed(4)}° N, {selectedCheckpoint.lng.toFixed(4)}° E</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] mt-1">
              <span>SLA Status:</span>
              <span className={`font-bold ${selectedCheckpoint.status === 'Breached' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedCheckpoint.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

