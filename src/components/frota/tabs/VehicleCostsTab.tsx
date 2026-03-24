import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Activity, Car, Wrench, Fuel, ShieldAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function VehicleCostsTab({ vehicle }: { vehicle: any }) {
  const costBreakdown = [
    { label: 'Combustível', value: 1250.00, percentage: 65, icon: Fuel, color: 'bg-blue-500' },
    { label: 'Manutenção', value: 450.00, percentage: 23, icon: Wrench, color: 'bg-amber-500' },
    { label: 'Seguro/Taxas', value: 150.00, percentage: 8, icon: ShieldAlert, color: 'bg-indigo-500' },
    { label: 'Lavagem/Outros', value: 70.00, percentage: 4, icon: Car, color: 'bg-emerald-500' },
  ];

  const totalCost = costBreakdown.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Custo Total (Mês)</p>
            <DollarSign className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">R$ {totalCost.toFixed(2)}</h3>
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5% vs mês anterior</p>
        </div>
        
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Custo por KM</p>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">R$ {vehicle.custoPorKm.toFixed(2)}</h3>
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> -2% vs média da frota</p>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Projeção Anual</p>
            <PieChart className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">R$ {(totalCost * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs text-gray-500 mt-1">Baseado no consumo atual</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden p-6">
        <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2 mb-6">
          <PieChart className="w-4 h-4 text-brand-green" />
          Distribuição de Custos
        </h3>
        
        <div className="space-y-6">
          {/* Bar Chart Visualization */}
          <div className="h-4 w-full flex rounded-full overflow-hidden">
            {costBreakdown.map((item, i) => (
              <div 
                key={i} 
                className={cn("h-full", item.color)} 
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Legend and Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {costBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", item.color)}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-soft-black dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}% do total</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-soft-black dark:text-white">R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
