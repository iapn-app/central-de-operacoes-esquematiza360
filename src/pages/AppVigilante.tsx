import React, { useState } from 'react';
import { Shield, Siren, MapPin, AlertTriangle, ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function AppVigilante() {
  const [isShiftStarted, setIsShiftStarted] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-sm h-[700px] bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-800 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="bg-soft-black text-white p-6 rounded-b-[2rem] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold tracking-tight">Vigilante App</h1>
            <div className={cn("w-3 h-3 rounded-full", isShiftStarted ? "bg-brand-green" : "bg-gray-500")}></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold">CV</div>
            <div>
              <p className="font-bold">Carlos Vigilante</p>
              <p className="text-xs text-gray-400">Posto: Cond. Barra Premium</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Panic Button */}
          <button 
            onClick={() => setIsPanicActive(!isPanicActive)}
            className={cn(
              "w-full py-6 rounded-2xl flex flex-col items-center gap-2 font-black text-white transition-all shadow-lg",
              isPanicActive ? "bg-red-700 animate-pulse" : "bg-red-600 hover:bg-red-700"
            )}
          >
            <Siren className="w-12 h-12" />
            <span className="text-lg uppercase tracking-widest">Botão de Pânico</span>
          </button>

          {/* Shift Control */}
          <button 
            onClick={() => setIsShiftStarted(!isShiftStarted)}
            className={cn(
              "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all",
              isShiftStarted ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" : "bg-brand-green text-white"
            )}
          >
            <Clock className="w-5 h-5" />
            {isShiftStarted ? "Encerrar Turno" : "Iniciar Turno"}
          </button>

          {/* Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Registrar Ronda', icon: MapPin, color: 'bg-blue-500' },
              { label: 'Registrar Ocorrência', icon: AlertTriangle, color: 'bg-amber-500' },
              { label: 'Checklist', icon: ClipboardList, color: 'bg-indigo-500' },
              { label: 'Status', icon: CheckCircle2, color: 'bg-emerald-500' },
            ].map((action, i) => (
              <button 
                key={i}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 flex flex-col items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <div className={cn("p-3 rounded-xl text-white", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-soft-black dark:text-white text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
