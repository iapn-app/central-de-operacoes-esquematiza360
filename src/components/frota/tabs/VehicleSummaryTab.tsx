import React from 'react';
import { 
  Car, 
  AlertTriangle, 
  Activity, 
  Wrench, 
  Fuel, 
  DollarSign, 
  Gauge, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function VehicleSummaryTab() {
  // Dados mockados para a fase de frontend
  const vehicleData = {
    name: "Viatura Alpha 01",
    model: "Toyota Corolla XEi",
    plate: "RIO-2A24",
    type: "Combustão",
    status: "Em Operação",
    km: "48.500 km",
    kpis: {
      costPerKm: "R$ 0,78/km",
      totalCost: "R$ 12.430",
      kmDriven: "15.200 km",
      score: "92 / 100"
    },
    score: {
      value: 92,
      label: "Excelente"
    },
    alerts: [
      "Revisão preventiva em 500 km",
      "Consumo acima da média histórica"
    ],
    events: [
      { id: 1, type: "Abastecimento", value: "R$ 320", date: "08/03", icon: Fuel, color: "text-amber-500", bg: "bg-amber-500/10" },
      { id: 2, type: "Manutenção", value: "R$ 850", date: "20/02", icon: Wrench, color: "text-blue-500", bg: "bg-blue-500/10" },
      { id: 3, type: "Lavagem", value: "R$ 80", date: "15/02", icon: Car, color: "text-emerald-500", bg: "bg-emerald-500/10" }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Card Principal do Veículo */}
      <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner">
            <Car className="w-8 h-8 text-brand-green" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-soft-black dark:text-white tracking-tight">{vehicleData.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {vehicleData.model} <span className="mx-2 text-gray-300 dark:text-gray-700">•</span> {vehicleData.plate}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tipo</p>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
              {vehicleData.type}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Status</p>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {vehicleData.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">KM Atual</p>
            <p className="text-lg font-black text-soft-black dark:text-white">{vehicleData.km}</p>
          </div>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Custo por KM</p>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">{vehicleData.kpis.costPerKm}</h3>
        </div>
        
        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Custo Total</p>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">{vehicleData.kpis.totalCost}</h3>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">KM Rodados</p>
            <Gauge className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">{vehicleData.kpis.kmDriven}</h3>
        </div>

        <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Score</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{vehicleData.kpis.score}</h3>
        </div>
      </div>

      {/* 3, 4, 5. Blocos Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Score do Veículo */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Score do Veículo
          </h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-black text-soft-black dark:text-white tracking-tighter">{vehicleData.score.value}</span>
            <span className="text-xl text-gray-400 dark:text-gray-500 font-medium">/100</span>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 uppercase tracking-widest text-xs">{vehicleData.score.label}</p>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200 dark:border-white/5">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${vehicleData.score.value}%` }}
            ></div>
          </div>
        </div>

        {/* 4. Alertas */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <h3 className="text-sm font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alertas Ativos
          </h3>
          <div className="space-y-3">
            {vehicleData.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200/90 font-medium leading-snug">{alert}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Últimos Eventos */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <h3 className="text-sm font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Últimos Eventos
          </h3>
          <div className="space-y-4">
            {vehicleData.events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", event.bg)}>
                    <event.icon className={cn("w-4 h-4", event.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-soft-black dark:text-white">{event.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-soft-black dark:text-white">{event.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
