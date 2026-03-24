import React from 'react';
import { useTimestamp } from '../hooks/useTimestamp';
import { cn } from '../lib/utils';

export interface CameraFeedCardProps {
  id: number;
  name: string;
  src: string;
  status?: 'LIVE' | 'ONLINE' | 'OFFLINE';
}

export function CameraFeedCard({ name, src, status = 'LIVE' }: CameraFeedCardProps) {
  const timestamp = useTimestamp();

  return (
    <div className="relative aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group">
      {/* Video Element */}
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.8] contrast-125"
      />
      
      {/* CCTV Visual Overlay (Scanlines/Noise simulation) */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDEgME0wIDFMMiAxTTAgMkwzIDJNMCAzTDQgMyIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-30 mix-blend-overlay"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>

      {/* Top Left: Status & Name */}
      <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === 'LIVE' ? "bg-red-500 animate-pulse" : "bg-emerald-500"
          )}></span>
          <span className="text-[8px] font-mono text-white font-bold tracking-widest">{status}</span>
        </div>
        <span className="text-[9px] font-mono text-white/90 font-bold drop-shadow-md bg-black/30 px-1 rounded">{name}</span>
      </div>

      {/* Bottom Right: Timestamp */}
      <div className="absolute bottom-2 right-2 z-10">
        <span className="text-[9px] font-mono text-white/90 font-bold drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded border border-white/10 tracking-wider">
          {timestamp}
        </span>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center z-20">
        <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Expandir</span>
      </div>
    </div>
  );
}
