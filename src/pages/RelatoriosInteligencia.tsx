import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Map, 
  Zap, 
  Download,
  Filter,
  ChevronRight,
  Activity,
  Target,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, LineChart, Line
} from 'recharts';

const MOCK_INDICATORS = [
  { label: 'Posto Crítico', value: 'Cond. Barra Premium', sub: '12 Ocorrências', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Horário de Risco', value: '02:00 - 04:00', sub: 'Pico de invasões', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Cliente c/ Chamados', value: 'Shopping Américas', sub: '8 Chamados abertos', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Top Conformidade', value: 'Vig. Carlos Silva', sub: '99.8% SLA', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const MOCK_TREND_DATA = [
  { month: 'Jan', ocorrencias: 45, resolvidas: 40 },
  { month: 'Fev', ocorrencias: 52, resolvidas: 48 },
  { month: 'Mar', ocorrencias: 38, resolvidas: 35 },
  { month: 'Abr', ocorrencias: 65, resolvidas: 60 },
  { month: 'Mai', ocorrencias: 48, resolvidas: 45 },
  { month: 'Jun', ocorrencias: 30, resolvidas: 29 },
];

const MOCK_SEVERITY_DATA = [
  { name: 'Barra Premium', alta: 4, media: 8, baixa: 12 },
  { name: 'Shopping Américas', alta: 2, media: 5, baixa: 15 },
  { name: 'Centro Empresarial', alta: 1, media: 3, baixa: 8 },
  { name: 'Residencial Recreio', alta: 5, media: 10, baixa: 5 },
];

const MOCK_INSIGHTS = [
  { id: 1, type: 'alert', text: 'Aumento de 25% em ocorrências noturnas no setor Oeste (Recreio) nas últimas 48h. Recomendada alocação de VTR extra.' },
  { id: 2, type: 'success', text: 'Tempo médio de resposta a pânicos reduziu de 4.2 min para 3.8 min este mês.' },
  { id: 3, type: 'warning', text: 'Turno 12x36 N do Cond. Barra Premium apresenta 15% de atraso no início das rondas perimetrais.' },
];

const MOCK_RANKING = [
  { id: 1, name: 'Cond. Barra Premium', score: 98, trend: 'up' },
  { id: 2, name: 'Centro Empresarial', score: 95, trend: 'up' },
  { id: 3, name: 'Shopping Américas', score: 88, trend: 'down' },
  { id: 4, name: 'Residencial Recreio', score: 82, trend: 'down' },
];

export function RelatoriosInteligencia() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-soft-black dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            Inteligência e Estratégia
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Análise preditiva e indicadores de performance operacional.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Strategic Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_INDICATORS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4 group hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 dark:bg-opacity-10 dark:text-opacity-90", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-sm font-bold text-soft-black dark:text-white leading-tight mb-1">{stat.value}</h3>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Block */}
      <div className="bg-gradient-to-br from-soft-black to-gray-900 dark:from-[#141414] dark:to-black rounded-2xl p-6 shadow-xl relative overflow-hidden border border-transparent dark:border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <Zap className="w-5 h-5 text-brand-green" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Insights Automáticos (IA)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {MOCK_INSIGHTS.map((insight) => (
            <div key={insight.id} className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/5 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                {insight.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                {insight.type === 'success' && <TrendingUp className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />}
                {insight.type === 'warning' && <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                <p className="text-xs text-gray-300 dark:text-gray-400 leading-relaxed">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tendência Mensal Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-green" />
              Tendência de Ocorrências (6 Meses)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcorrencias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolvidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:opacity-10" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-color, #1f2937)' }}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" name="Ocorrências" dataKey="ocorrencias" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOcorrencias)" />
                <Area type="monotone" name="Resolvidas" dataKey="resolvidas" stroke="#00E676" strokeWidth={3} fillOpacity={1} fill="url(#colorResolvidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Operacional */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-green" />
              Ranking de Performance
            </h3>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {MOCK_RANKING.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <p className="text-xs font-bold text-soft-black dark:text-white">{item.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-soft-black dark:text-white">{item.score}</span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-brand-green" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  )}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5">
              <button className="w-full py-2 text-[10px] font-bold text-brand-green uppercase tracking-widest hover:underline">
                Ver Ranking Completo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Severidade por Cliente */}
      <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-brand-green" />
            Severidade de Ocorrências por Cliente
          </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_SEVERITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" className="dark:opacity-10" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 'bold' }} width={120} className="dark:text-gray-400" />
              <Tooltip 
                cursor={{ fill: 'var(--tooltip-cursor, #f9fafb)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-color, #1f2937)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="alta" name="Alta Severidade" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={24} />
              <Bar dataKey="media" name="Média Severidade" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="baixa" name="Baixa Severidade" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
