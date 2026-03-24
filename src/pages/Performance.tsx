import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Filter, 
  ChevronRight, 
  Award, 
  Target, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MOCK_POSTOS, MOCK_VIGILANTES, MOCK_OCORRENCIAS } from '../constants/mockData';
import { geminiService } from '../services/geminiService';

const Performance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'vigilantes' | 'postos' | 'supervisores' | 'equipes'>('vigilantes');
  const [filterPeriod, setFilterPeriod] = useState('Este Mês');

  const fetchData = async () => {
    setLoading(true);
    const analysis = await geminiService.generatePerformanceAnalysis({
      vigilantes: MOCK_VIGILANTES.slice(0, 20),
      postos: MOCK_POSTOS.slice(0, 15),
      ocorrencias: MOCK_OCORRENCIAS
    });
    setPerformanceData(analysis);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBadgeColor = (badge: string) => {
    if (badge.includes('Ouro') || badge.includes('Destaque')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (badge.includes('Tático')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (badge.includes('Conformidade')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const renderRankingContent = () => {
    if (!performanceData) return null;

    switch (activeTab) {
      case 'vigilantes':
        return (
          <div className="space-y-4">
            {performanceData.rankingVigilantes.map((v: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-600/20 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{v.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      {v.badges.map((b: string, i: number) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getBadgeColor(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Pontualidade</p>
                    <p className="text-xs font-bold text-slate-700">{v.metricas.pontualidade}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Rondas</p>
                    <p className="text-xs font-bold text-slate-700">{v.metricas.rondas}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</p>
                    <p className="text-lg font-black text-emerald-600">{v.score}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'postos':
        return (
          <div className="space-y-4">
            {performanceData.rankingPostos.map((p: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{p.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      {p.badges.map((b: string, i: number) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getBadgeColor(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SLA Resposta</p>
                    <p className="text-xs font-bold text-slate-700">{p.metricas.sla}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Ocorrências</p>
                    <p className="text-xs font-bold text-red-500">{p.metricas.ocorrencias}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</p>
                    <p className="text-lg font-black text-emerald-600">{p.score}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'supervisores':
        return (
          <div className="space-y-4">
            {performanceData.rankingSupervisores.map((s: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{s.nome}</h4>
                    <div className="flex gap-2 mt-1">
                      {s.badges.map((b: string, i: number) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getBadgeColor(b)}`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tempo Reação</p>
                    <p className="text-xs font-bold text-slate-700">{s.metricas.reacao}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Visitas</p>
                    <p className="text-xs font-bold text-slate-700">{s.metricas.visitas}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</p>
                    <p className="text-lg font-black text-emerald-600">{s.score}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'equipes':
        return (
          <div className="space-y-4">
            {performanceData.rankingEquipes.map((e: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{e.nome}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Equipe de Alta Conformidade</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Aderência</p>
                    <p className="text-xs font-bold text-emerald-600">{e.aderencia}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</p>
                    <p className="text-lg font-black text-emerald-600">{e.score}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
            <Trophy size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Excelência Operacional</h1>
            <p className="text-sm text-slate-500 font-medium">Ranking de Performance e Meritocracia Central</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['Este Mês', 'Último Trimestre', 'Anual'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterPeriod === p ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={80} />
          </div>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Score Geral</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-5xl font-black">{performanceData?.scoreGeral?.valor || '--'}</h2>
            <div className={`flex items-center gap-1 text-sm font-bold mb-1 ${performanceData?.scoreGeral?.variacao.includes('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {performanceData?.scoreGeral?.variacao.includes('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {performanceData?.scoreGeral?.variacao}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Média ponderada de conformidade, pontualidade e resposta operacional.
          </p>
        </motion.div>

        {[
          { label: 'SLA de Resposta', val: '98.2%', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Conformidade Checklist', val: '94.5%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Aderência Operacional', val: '91.8%', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.val}</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-2">
              <TrendingUp size={12} />
              <span>+2.4% vs anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Ranking Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'vigilantes', label: 'Vigilantes', icon: UserCheck },
                  { id: 'postos', label: 'Postos', icon: Building2 },
                  { id: 'supervisores', label: 'Supervisores', icon: Users },
                  { id: 'equipes', label: 'Equipes', icon: Zap }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>
            </div>
            <div className="p-8">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-400 animate-pulse">Calculando Rankings de Performance...</p>
                </div>
              ) : (
                renderRankingContent()
              )}
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Evolution Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Evolução do Score
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData?.evolucaoMensal || []}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-2">
                <Medal className="text-emerald-600" size={20} />
                <span className="text-xs font-bold text-emerald-800">Melhor Evolução do Mês</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Equipe Turno B - Barra Prime</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">+15.4% de crescimento</p>
            </div>
          </div>

          {/* AI Insights Performance */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Zap size={18} className="text-emerald-400" />
              Insights de Excelência
            </h3>
            <div className="space-y-4">
              {performanceData?.insightsPerformance?.map((insight: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${insight.impacto === 'Alto' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      Impacto {insight.impacto}
                    </span>
                    <ArrowUpRight size={14} className="text-white/30" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{insight.titulo}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{insight.descricao}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20">
              GERAR RELATÓRIO DE MERITOCRACIA
            </button>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-8 text-center">Sistema de Reconhecimento e Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: 'Posto Ouro', icon: Building2, color: 'text-amber-500', bg: 'bg-amber-50', desc: '100% de conformidade' },
            { label: 'Vigilante Destaque', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Zero atrasos no mês' },
            { label: 'Supervisor Tático', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Resposta em < 3min' },
            { label: 'Alta Conformidade', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Checklist perfeito' },
            { label: 'Melhor Evolução', icon: TrendingUp, color: 'text-pink-500', bg: 'bg-pink-50', desc: 'Maior salto de score' }
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center group cursor-help">
              <div className={`w-16 h-16 ${badge.bg} ${badge.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <badge.icon size={32} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">{badge.label}</h4>
              <p className="text-[9px] text-slate-400 font-medium">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Performance;
