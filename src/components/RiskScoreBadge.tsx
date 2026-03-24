import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getRiskBand, getRiskColor } from '../utils/riskScore';
import { cn } from '../lib/utils';

interface RiskScoreBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function RiskScoreBadge({ score, className, showLabel = true }: RiskScoreBadgeProps) {
  const band = getRiskBand(score);
  const colorClasses = getRiskColor(band);
  
  const Icon = band === 'Baixo' ? ShieldCheck :
               band === 'Médio' ? Shield :
               band === 'Alto' ? AlertTriangle : ShieldAlert;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold text-xs", colorClasses, className)}>
      <Icon size={14} className={band === 'Crítico' ? 'animate-pulse' : ''} />
      <span>{score}</span>
      {showLabel && <span className="uppercase tracking-wider ml-1 opacity-80">{band}</span>}
    </div>
  );
}
