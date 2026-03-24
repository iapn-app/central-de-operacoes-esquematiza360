import React from 'react';
import { Fuel, Activity, DollarSign, Gauge, TrendingDown, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function VehicleFuelTab({ vehicle }: { vehicle: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Consumo Médio</p>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">{vehicle.consumoMedio} km/l</h3>
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> 2% melhor que a meta</p>
        </div>
        
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Gasto Mensal</p>
            <DollarSign className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">R$ {vehicle.gastoMensal.toFixed(2)}</h3>
          <p className="text-xs text-gray-500 mt-1">Mês atual</p>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Litros</p>
            <Fuel className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">245 L</h3>
          <p className="text-xs text-gray-500 mt-1">Mês atual</p>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Preço Médio</p>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-soft-black dark:text-white">R$ 5,85</h3>
          <p className="text-xs text-gray-500 mt-1">Por litro</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
            <Fuel className="w-4 h-4 text-brand-green" />
            Histórico de Abastecimentos
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {vehicle.abastecimentos.map((abastecimento: any) => (
            <div key={abastecimento.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-brand-green/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Fuel className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-soft-black dark:text-white">{abastecimento.posto}</h4>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5">{abastecimento.data}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md"><Gauge className="w-3 h-3" /> {abastecimento.km.toLocaleString()} km</span>
                  <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md"><Activity className="w-3 h-3" /> {abastecimento.litros} L</span>
                  <span className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-md font-bold"><DollarSign className="w-3 h-3" /> R$ {abastecimento.valor.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          {vehicle.abastecimentos.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Fuel className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhum abastecimento registrado.</p>
              <p className="text-xs mt-1 opacity-60">O histórico de abastecimentos aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
