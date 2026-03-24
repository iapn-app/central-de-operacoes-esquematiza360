import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Activity,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  Star,
  FileText,
  Download,
  MessageSquare,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { cn } from '../lib/utils';

export function PortalCliente() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    // In a real implementation, this would fetch from Supabase/API
    // For now, we show an empty state or loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <Building2 size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Portal do Cliente</h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase tracking-widest">Premium Access</span>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Transparência, Controle e Excelência Operacional em Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalysis}
            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-slate-900 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-all">
            <PlusCircle className="w-4 h-4" />
            Abrir Chamado
          </button>
        </div>
      </div>

      {/* KPIs de Valor Percebido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Cobertura Operacional', val: analysis?.kpis?.cobertura || '0%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Conformidade de Rondas', val: analysis?.kpis?.conformidade || '0%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'SLA Médio de Resposta', val: analysis?.kpis?.sla || '0m', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Ocorrências Ativas', val: analysis?.kpis?.ocorrencias || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-slate-200 transition-all"
          >
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <kpi.icon size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{kpi.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Score e Tendência */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Score & Trend Chart */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            
            <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black mb-2 uppercase italic tracking-tight">Qualidade Operacional do Contrato</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Score consolidado baseado em SLA, conformidade, assiduidade e feedback operacional.
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path className="text-white/5" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-500" strokeDasharray={`${analysis?.serviceScore?.valor || 0}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tracking-tighter">{analysis?.serviceScore?.valor || 0}</span>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Score</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span className="text-sm font-bold">Tendência {analysis?.serviceScore?.tendencia || '--'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Atualizado em tempo real</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[200px]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Evolução Semanal de Performance</h4>
                {analysis?.tendenciaSemanal ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.tendenciaSemanal}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="dia" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
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
                ) : (
                  <div className="h-full flex items-center justify-center border border-white/5 rounded-2xl bg-white/5">
                    <p className="text-xs text-slate-500">Aguardando dados operacionais...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo Operacional Diário */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Zap size={18} className="text-brand-green" />
                Status Operacional Hoje
              </h3>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Postos</p>
                  <p className="text-sm font-black text-slate-800">{analysis?.resumoOperacional?.postos || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vigilantes</p>
                  <p className="text-sm font-black text-slate-800">{analysis?.resumoOperacional?.vigilantes || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rondas</p>
                  <p className="text-sm font-black text-slate-800">{analysis?.resumoOperacional?.rondas || 0}</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="text-center py-10">
                <MapPin size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum posto com atividade recente registrada.</p>
              </div>
            </div>
          </div>

          {/* Ocorrências Recentes */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" />
                Resumo de Ocorrências Recentes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Tipo</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data / Hora</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Resposta</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analysis?.ocorrenciasRecentes?.length > 0 ? (
                    analysis.ocorrenciasRecentes.map((oc: any, i: number) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <p className="text-xs font-bold text-slate-800">{oc.tipo}</p>
                          <p className="text-[9px] text-slate-400 font-mono uppercase">{oc.id}</p>
                        </td>
                        <td className="px-8 py-4 text-xs text-slate-600 font-medium">{oc.data}</td>
                        <td className="px-8 py-4">
                          <span className={cn(
                            "px-2 py-0.5 text-[9px] font-black rounded uppercase",
                            oc.status === 'Concluído' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {oc.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs font-bold text-slate-800">{oc.sla}</td>
                        <td className="px-8 py-4 text-right">
                          <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-xs">
                        Nenhuma ocorrência registrada no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Relatórios e Percepção de Valor */}
        <div className="space-y-8">
          {/* Percepção de Valor (IA) */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Star size={24} />
            </div>
            <h3 className="text-lg font-black mb-2 italic tracking-tight">{analysis?.percepcaoValor?.titulo || 'Valor Gerado'}</h3>
            <p className="text-xs text-emerald-50/80 leading-relaxed mb-6">
              {analysis?.percepcaoValor?.descricao || 'Aguardando análise de dados para gerar insights de valor.'}
            </p>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
              <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">Impacto Estimado</p>
              <p className="text-xl font-black">{analysis?.percepcaoValor?.impactoFinanceiro || 'R$ 0,00'}</p>
            </div>
          </div>

          {/* Relatórios Automáticos */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              Relatórios Executivos
            </h3>
            <div className="space-y-4">
              {analysis?.relatoriosDisponiveis?.length > 0 ? (
                analysis.relatoriosDisponiveis.map((rel: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                        <FileText size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rel.titulo}</h4>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">{rel.data}</p>
                      </div>
                    </div>
                    <Download size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum relatório disponível.</p>
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">
              Ver Histórico Completo
            </button>
          </div>

          {/* Chamados Recentes */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              Suporte & Chamados
            </h3>
            <div className="space-y-4 mb-6">
              <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum chamado em aberto.</p>
            </div>
            <button className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
              Novo Chamado de Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
