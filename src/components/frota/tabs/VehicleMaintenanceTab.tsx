import React from 'react';
import { Wrench, Calendar, Gauge, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function VehicleMaintenanceTab({ vehicle }: { vehicle: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status Atual</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">Em Dia</h3>
          <p className="text-xs text-gray-500 mt-1">Nenhuma manutenção atrasada</p>
        </div>
        
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Próxima Revisão</p>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">50.000 km</h3>
          <p className="text-xs text-gray-500 mt-1">Faltam 1.500 km</p>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Custo YTD</p>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">R$ 2.450,00</h3>
          <p className="text-xs text-gray-500 mt-1">Manutenções no ano</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand-green" />
            Histórico de Manutenções
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {vehicle.manutencoes.map((manutencao: any) => (
            <div key={manutencao.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-brand-green/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-soft-black dark:text-white">{manutencao.tipo}</h4>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5">{manutencao.data}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md"><Gauge className="w-3 h-3" /> {manutencao.km.toLocaleString()} km</span>
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md"><Clock className="w-3 h-3" /> Próxima: {manutencao.proxima}</span>
                </div>
              </div>
            </div>
          ))}
          {vehicle.manutencoes.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Wrench className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhuma manutenção registrada.</p>
              <p className="text-xs mt-1 opacity-60">O histórico de serviços aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
