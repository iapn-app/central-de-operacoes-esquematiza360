import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldAlert, 
  Users, 
  Car, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Zap,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { cn } from '../lib/utils';
import { RiskScoreBadge } from '../components/RiskScoreBadge';

// Mock Data for Clients
const MOCK_CLIENTS = [
  {
    id: 'C-001',
    nome: 'Condomínio Barra Premium',
    tipo: 'Residencial',
    receita: 85000,
    base: {
      vigilantes: 4,
      viaturas: 1,
      rondasMinutos: 60,
      escala: '12x36',
      supervisor: 'Dedicado',
      coberturaNoturna: 100
    },
    metricas: {
      risco: 35,
      custo: 62000,
      margem: 27,
      sla: 98,
      conformidade: 95,
      protecao: 90
    }
  },
  {
    id: 'C-002',
    nome: 'Indústria Metalúrgica Sul',
    tipo: 'Industrial',
    receita: 150000,
    base: {
      vigilantes: 8,
      viaturas: 2,
      rondasMinutos: 30,
      escala: '5x2',
      supervisor: 'Compartilhado',
      coberturaNoturna: 80
    },
    metricas: {
      risco: 65,
      custo: 125000,
      margem: 16,
      sla: 88,
      conformidade: 85,
      protecao: 75
    }
  }
];

const ESCALAS = ['12x36', '5x2', '6x1', '24x48'];
const SUPERVISORES = ['Dedicado', 'Compartilhado', 'Remoto'];

export function SimuladorRiscoCliente() {
  const [selectedClientId, setSelectedClientId] = useState(MOCK_CLIENTS[0].id);
  
  const client = useMemo(() => MOCK_CLIENTS.find(c => c.id === selectedClientId) || MOCK_CLIENTS[0], [selectedClientId]);

  // Simulation State
  const [simVigilantes, setSimVigilantes] = useState(client.base.vigilantes);
  const [simViaturas, setSimViaturas] = useState(client.base.viaturas);
  const [simRondas, setSimRondas] = useState(client.base.rondasMinutos);
  const [simEscala, setSimEscala] = useState(client.base.escala);
  const [simSupervisor, setSimSupervisor] = useState(client.base.supervisor);
  const [simCobertura, setSimCobertura] = useState(client.base.coberturaNoturna);

  // Reset simulation when client changes
  React.useEffect(() => {
    setSimVigilantes(client.base.vigilantes);
    setSimViaturas(client.base.viaturas);
    setSimRondas(client.base.rondasMinutos);
    setSimEscala(client.base.escala);
    setSimSupervisor(client.base.supervisor);
    setSimCobertura(client.base.coberturaNoturna);
  }, [client]);

  // Calculate Projected Metrics based on deltas
  const projection = useMemo(() => {
    const deltaVig = simVigilantes - client.base.vigilantes;
    const deltaViat = simViaturas - client.base.viaturas;
    const deltaRondas = client.base.rondasMinutos - simRondas; // Negative if rounds are less frequent (higher minutes)
    const deltaCobertura = simCobertura - client.base.coberturaNoturna;
    
    // Escala penalty/bonus (simplified)
    const escalaPenalty = simEscala !== client.base.escala ? (simEscala === '5x2' ? -5 : 5) : 0;
    const supPenalty = simSupervisor !== client.base.supervisor ? (simSupervisor === 'Remoto' ? 10 : -5) : 0;

    // Projected Risk (Higher is worse)
    let pRisco = client.metricas.risco - (deltaVig * 8) - (deltaViat * 12) - (deltaRondas * 0.2) - (deltaCobertura * 0.3) + escalaPenalty + supPenalty;
    pRisco = Math.max(0, Math.min(100, pRisco));

    // Projected Cost
    const pCusto = client.metricas.custo + (deltaVig * 6500) + (deltaViat * 3500) + (simSupervisor === 'Dedicado' ? 4000 : simSupervisor === 'Compartilhado' ? 1500 : 0) - (client.base.supervisor === 'Dedicado' ? 4000 : client.base.supervisor === 'Compartilhado' ? 1500 : 0);
    
    // Projected Margin
    const pMargem = ((client.receita - pCusto) / client.receita) * 100;

    // Projected SLA & Compliance & Protection
    let pSla = client.metricas.sla + (deltaVig * 2) + (deltaViat * 3) + (deltaRondas * 0.1);
    pSla = Math.max(0, Math.min(100, pSla));

    let pConf = client.metricas.conformidade + (deltaVig * 1.5) - supPenalty;
    pConf = Math.max(0, Math.min(100, pConf));

    let pProt = client.metricas.protecao + (deltaVig * 4) + (deltaViat * 5) + (deltaCobertura * 0.2);
    pProt = Math.max(0, Math.min(100, pProt));

    return {
      risco: Math.round(pRisco),
      custo: Math.round(pCusto),
      margem: pMargem.toFixed(1),
      sla: Math.round(pSla),
      conformidade: Math.round(pConf),
      protecao: Math.round(pProt)
    };
  }, [client, simVigilantes, simViaturas, simRondas, simEscala, simSupervisor, simCobertura]);

  const radarData = [
    { subject: 'Proteção', current: client.metricas.protecao, projected: projection.protecao, fullMark: 100 },
    { subject: 'SLA', current: client.metricas.sla, projected: projection.sla, fullMark: 100 },
    { subject: 'Conformidade', current: client.metricas.conformidade, projected: projection.conformidade, fullMark: 100 },
    { subject: 'Margem', current: client.metricas.margem, projected: parseFloat(projection.margem), fullMark: 100 },
    { subject: 'Eficiência Custo', current: 100 - (client.metricas.custo / client.receita * 100), projected: 100 - (projection.custo / client.receita * 100), fullMark: 100 },
    { subject: 'Controle Risco', current: 100 - client.metricas.risco, projected: 100 - projection.risco, fullMark: 100 },
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getImpactColor = (current: number, projected: number, inverse: boolean = false) => {
    const diff = projected - current;
    if (diff === 0) return 'text-slate-500';
    if (inverse) {
      return diff < 0 ? 'text-emerald-500' : 'text-red-500';
    }
    return diff > 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const getImpactIcon = (current: number, projected: number, inverse: boolean = false) => {
    const diff = projected - current;
    if (diff === 0) return <Activity size={16} className="text-slate-400" />;
    
    const isPositive = inverse ? diff < 0 : diff > 0;
    return isPositive ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Zap size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Simulador de Risco</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            Simule cenários operacionais, reduções de escopo ou trocas de escala e preveja o impacto no risco, SLA e margem financeira do contrato.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none shadow-sm"
            >
              {MOCK_CLIENTS.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Parâmetros Operacionais
            </h2>

            <div className="space-y-6">
              {/* Vigilantes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    Efetivo (Vigilantes)
                  </label>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{simVigilantes}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="20" step="1"
                  value={simVigilantes}
                  onChange={(e) => setSimVigilantes(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>Atual: {client.base.vigilantes}</span>
                  <span className={simVigilantes < client.base.vigilantes ? 'text-red-500' : 'text-emerald-500'}>
                    Delta: {simVigilantes - client.base.vigilantes > 0 ? '+' : ''}{simVigilantes - client.base.vigilantes}
                  </span>
                </div>
              </div>

              {/* Viaturas */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Car size={16} className="text-slate-400" />
                    Viaturas
                  </label>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{simViaturas}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="5" step="1"
                  value={simViaturas}
                  onChange={(e) => setSimViaturas(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Rondas */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Intervalo de Rondas
                  </label>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{simRondas} min</span>
                </div>
                <input 
                  type="range" 
                  min="15" max="240" step="15"
                  value={simRondas}
                  onChange={(e) => setSimRondas(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Cobertura Noturna */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-slate-400" />
                    Cobertura Noturna
                  </label>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{simCobertura}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" step="10"
                  value={simCobertura}
                  onChange={(e) => setSimCobertura(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Escala & Supervisor */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Escala</label>
                  <select 
                    value={simEscala}
                    onChange={(e) => setSimEscala(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 outline-none"
                  >
                    {ESCALAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Supervisor</label>
                  <select 
                    value={simSupervisor}
                    onChange={(e) => setSimSupervisor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 outline-none"
                  >
                    {SUPERVISORES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSimVigilantes(client.base.vigilantes);
                  setSimViaturas(client.base.viaturas);
                  setSimRondas(client.base.rondasMinutos);
                  setSimEscala(client.base.escala);
                  setSimSupervisor(client.base.supervisor);
                  setSimCobertura(client.base.coberturaNoturna);
                }}
                className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Restaurar Cenário Original
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Risco */}
            <motion.div 
              key={`risco-${projection.risco}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score de Risco</span>
                {getImpactIcon(client.metricas.risco, projection.risco, true)}
              </div>
              <div className="flex items-end gap-3">
                <RiskScoreBadge score={projection.risco} className="text-xl" />
                <div className="flex flex-col pb-1">
                  <span className="text-[10px] text-slate-400 line-through">Atual: {client.metricas.risco}</span>
                  <span className={cn("text-xs font-bold", getImpactColor(client.metricas.risco, projection.risco, true))}>
                    {projection.risco - client.metricas.risco > 0 ? '+' : ''}{projection.risco - client.metricas.risco} pts
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Custo */}
            <motion.div 
              key={`custo-${projection.custo}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custo Operacional</span>
                {getImpactIcon(client.metricas.custo, projection.custo, true)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                {formatCurrency(projection.custo)}
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 line-through">{formatCurrency(client.metricas.custo)}</span>
                <span className={cn("font-bold", getImpactColor(client.metricas.custo, projection.custo, true))}>
                  {projection.custo - client.metricas.custo > 0 ? '+' : ''}{formatCurrency(projection.custo - client.metricas.custo)}
                </span>
              </div>
            </motion.div>

            {/* Margem */}
            <motion.div 
              key={`margem-${projection.margem}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Bruta</span>
                {getImpactIcon(client.metricas.margem, parseFloat(projection.margem))}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                {projection.margem}%
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 line-through">{client.metricas.margem}%</span>
                <span className={cn("font-bold", getImpactColor(client.metricas.margem, parseFloat(projection.margem)))}>
                  {parseFloat(projection.margem) - client.metricas.margem > 0 ? '+' : ''}{(parseFloat(projection.margem) - client.metricas.margem).toFixed(1)}%
                </span>
              </div>
            </motion.div>

            {/* SLA */}
            <motion.div 
              key={`sla-${projection.sla}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Projetado</span>
                {getImpactIcon(client.metricas.sla, projection.sla)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                {projection.sla}%
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 line-through">{client.metricas.sla}%</span>
                <span className={cn("font-bold", getImpactColor(client.metricas.sla, projection.sla))}>
                  {projection.sla - client.metricas.sla > 0 ? '+' : ''}{projection.sla - client.metricas.sla}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Charts & AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Radar Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                Pegada Operacional (Footprint)
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Atual" dataKey="current" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} />
                    <Radar name="Projetado" dataKey="projected" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-300"></div>
                  <span className="text-xs font-bold text-slate-500">Cenário Atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cenário Projetado</span>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                  <Sparkles size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Análise Preditiva IA</h3>
              </div>

              <div className="flex-1 space-y-4 relative z-10">
                {projection.risco > client.metricas.risco + 15 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-400 mb-1">Risco Crítico de Quebra de Contrato</h4>
                        <p className="text-xs text-red-200/70 leading-relaxed">
                          A redução drástica de efetivo combinada com o aumento do intervalo de rondas eleva a vulnerabilidade noturna para níveis inaceitáveis. Alta probabilidade de invasão e multas contratuais.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {parseFloat(projection.margem) > client.metricas.margem && projection.risco <= client.metricas.risco + 5 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <TrendingUp size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400 mb-1">Otimização Altamente Viável</h4>
                        <p className="text-xs text-emerald-200/70 leading-relaxed">
                          Este cenário aumenta a margem bruta em {(parseFloat(projection.margem) - client.metricas.margem).toFixed(1)}% sem comprometer severamente o SLA. O risco permanece dentro da faixa aceitável. Recomendado para negociação de renovação.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {projection.sla < 90 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Activity size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-400 mb-1">Alerta de Conformidade (SLA)</h4>
                        <p className="text-xs text-amber-200/70 leading-relaxed">
                          O SLA projetado cai para {projection.sla}%. Isso viola a cláusula 4.2 do contrato padrão. Considere manter o supervisor dedicado para compensar a redução de efetivo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default Insight if no extreme changes */}
                {Math.abs(projection.risco - client.metricas.risco) <= 5 && Math.abs(parseFloat(projection.margem) - client.metricas.margem) <= 2 && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-indigo-300 mb-1">Cenário Estável</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          As alterações propostas mantêm o equilíbrio operacional. O impacto no custo e no risco é marginal. Operação continua dentro dos parâmetros de normalidade.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                Aplicar Cenário ao Contrato
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
