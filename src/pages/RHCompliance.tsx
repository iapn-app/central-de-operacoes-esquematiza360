import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileCheck, 
  GraduationCap, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  UserPlus, 
  Download,
  MoreVertical,
  Award,
  Calendar,
  Building2,
  Activity,
  Heart,
  Zap,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileWarning,
  UserX,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';
import { MOCK_VIGILANTES, MOCK_POSTOS } from '../constants/mockData';

export function RHCompliance() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const result = await geminiService.generateRHComplianceAnalysis({
        vigilantes: MOCK_VIGILANTES,
        postos: MOCK_POSTOS
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Error fetching RH compliance analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'apto':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" /> APTO
        </span>;
      case 'alerta':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-100">
          <AlertCircle className="w-3 h-3" /> ALERTA
        </span>;
      case 'bloqueado':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase border border-red-100">
          <XCircle className="w-3 h-3" /> BLOQUEADO
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Inteligência de RH & Compliance</h1>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Gestão de Aptidão, Regularidade Documental e Risco Operacional</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-all">
            <UserPlus className="w-4 h-4" />
            Novo Profissional
          </button>
        </div>
      </div>

      {/* KPIs de Risco e Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Profissionais Ativos', val: analysis?.kpis?.ativos || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Bloqueados/Impedidos', val: analysis?.kpis?.bloqueados || 0, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'CNVs Vencendo', val: analysis?.kpis?.cnvVencendo || 0, icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Reciclagens Pendentes', val: analysis?.kpis?.reciclagemPendente || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Treinamentos Vencidos', val: analysis?.kpis?.treinamentosVencidos || 0, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-3`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-xl font-black text-slate-800">{kpi.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Alertas e Quadro */}
        <div className="lg:col-span-2 space-y-8">
          {/* Score de Compliance & Alertas Prioritários */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-white/10" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray={`${analysis?.scoreCompliance?.valor || 0}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{analysis?.scoreCompliance?.valor || 0}</span>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black mb-1">Score Geral de Compliance</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Nível de conformidade legal e operacional baseado em documentação e treinamentos.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-bold text-emerald-400">{analysis?.scoreCompliance?.variacao || '+0%'}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">vs mês anterior</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Alertas Prioritários (IA)</h4>
                {analysis?.alertasPrioritarios?.slice(0, 3).map((alerta: any, i: number) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                    <AlertTriangle size={14} className={alerta.tipo === 'Crítico' ? 'text-red-500' : 'text-amber-500'} />
                    <div>
                      <p className="text-[11px] font-bold leading-tight">{alerta.mensagem}</p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Impacto: {alerta.impacto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quadro de Profissionais Críticos */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Users size={18} className="text-brand-green" />
                Profissionais com Pendências Críticas
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {['Todos', 'Aptos', 'Alertas', 'Bloqueados'].map((tab) => (
                    <button 
                      key={tab}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all",
                        tab === 'Todos' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar profissional..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profissional</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posto / Cliente</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendência</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prazo</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analysis?.profissionaisCriticos?.map((prof: any, i: number) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {prof.nome.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <p className="text-xs font-bold text-slate-800">{prof.nome}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs font-medium text-slate-600">{prof.posto}</p>
                      </td>
                      <td className="px-8 py-4">
                        {getComplianceBadge(prof.diasRestantes <= 0 ? 'bloqueado' : prof.diasRestantes < 15 ? 'alerta' : 'apto')}
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">{prof.pendencia}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs text-slate-500 font-medium">{prof.diasRestantes} dias</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Ações, Postos e Insights */}
        <div className="space-y-8">
          {/* Ações Obrigatórias (IA) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Ações Obrigatórias
            </h3>
            <div className="space-y-4">
              {analysis?.acoesObrigatorias?.map((acao: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-800">{acao.titulo}</h4>
                    <span className="text-[9px] font-black text-amber-600 uppercase">Prazo: {acao.prazo}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{acao.descricao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risco por Posto/Cliente */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" />
              Risco por Posto
            </h3>
            <div className="space-y-4">
              {analysis?.pendenciasPorPosto?.map((posto: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-xl",
                    posto.nivelRisco === 'Alto' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{posto.posto}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{posto.cliente}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{posto.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Estratégicos */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-sm font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <Award size={18} />
              Insights de Compliance
            </h3>
            <div className="space-y-6">
              {analysis?.insightsCompliance?.map((insight: any, i: number) => (
                <div key={i}>
                  <h4 className="text-xs font-bold text-emerald-100 mb-1">{insight.titulo}</h4>
                  <p className="text-[10px] text-emerald-50/70 leading-relaxed">{insight.descricao}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-white text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
              GERAR RELATÓRIO COMPLETO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
