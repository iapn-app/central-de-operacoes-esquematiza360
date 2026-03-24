import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Zap,
  Clock,
  UserPlus,
  ArrowRight,
  Search,
  Filter,
  Star,
  Navigation,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  AlertCircle,
  ChevronRight,
  UserCheck,
  UserX,
  LayoutGrid,
  List,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';
import { geminiService } from '../services/geminiService';
import { 
  MOCK_ESCALAS, 
  MOCK_DISPONIBILIDADE,
  MOCK_POSTOS,
  MOCK_VIGILANTES
} from '../constants/mockData';
import { Escala, Disponibilidade } from '../types';

export function EscalasInteligentes() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'diaria' | 'semanal' | 'mensal'>('diaria');
  const [escalas, setEscalas] = useState<Escala[]>(MOCK_ESCALAS as any);
  const [disponiveis, setDisponiveis] = useState<Disponibilidade[]>(MOCK_DISPONIBILIDADE as any);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedEscala, setSelectedEscala] = useState<Escala | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const result = await geminiService.generateIntelligentScheduleAnalysis({
        escalas,
        disponiveis,
        postos: MOCK_POSTOS,
        vigilantes: MOCK_VIGILANTES
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Error fetching schedule analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleSuggestSubstitution = (escala: Escala) => {
    setSelectedEscala(escala);
    setIsSubModalOpen(true);
  };

  const confirmSubstitution = (vigilanteId: string, vigilanteNome: string) => {
    if (!selectedEscala) return;

    const updatedEscalas = escalas.map(e => 
      e.id === selectedEscala.id 
        ? { ...e, status: 'Substituído' as const, substitutoId: vigilanteId, vigilanteNome: `${e.vigilanteNome} (Subst: ${vigilanteNome})` }
        : e
    );
    
    setEscalas(updatedEscalas);
    setIsSubModalOpen(false);
    setSelectedEscala(null);
    fetchAnalysis();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green text-white rounded-2xl shadow-lg shadow-emerald-200">
            <CalendarDays size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Motor de Alocação Inteligente</h1>
            <p className="text-sm text-slate-500 font-medium">Gestão de Escalas, Faltas e Otimização de Recursos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {[
              { id: 'diaria', label: 'Diária', icon: LayoutGrid },
              { id: 'semanal', label: 'Semanal', icon: List },
              { id: 'mensal', label: 'Mensal', icon: Calendar }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id as any)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                  view === v.id ? "bg-brand-green text-white shadow-md" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <v.icon size={14} />
                {v.label}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Cobertura Total', val: analysis?.kpis?.cobertura || '0%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Postos Descobertos', val: analysis?.kpis?.descobertos || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Faltas Hoje', val: analysis?.kpis?.faltas || 0, icon: UserX, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Trocas Pendentes', val: analysis?.kpis?.trocas || 0, icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Reserva Disponível', val: analysis?.kpis?.reserva || 0, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' }
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
        {/* Coluna Principal: Escalas e Sugestões */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sugestões de Alocação Ótima (IA) */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <h3 className="text-sm font-bold uppercase tracking-tight mb-6 flex items-center gap-2 relative z-10">
              <Zap size={18} className="text-emerald-400" />
              Sugestões de Alocação Ótima (IA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {analysis?.sugestoesAlocacao?.map((sug: any, i: number) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">{sug.posto}</h4>
                      <p className="text-sm font-black text-white">{sug.vigilanteSugerido}</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500 px-2 py-0.5 rounded-full">{sug.match}% Match</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">{sug.motivo}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 italic">Custo Extra: {sug.custoExtra}</span>
                    <button className="p-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Escalas do Dia */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-brand-green" />
                Escalas Ativas - {view.charAt(0).toUpperCase() + view.slice(1)}
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrar posto..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posto</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vigilante</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Turno</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {escalas.map((escala) => (
                    <tr key={escala.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-xs font-bold text-slate-800">{escala.postoNome}</p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs font-medium text-slate-600">{escala.vigilanteNome}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs text-slate-500 font-medium">{escala.turno}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          escala.status === 'Confirmado' ? "bg-emerald-100 text-emerald-700" :
                          escala.status === 'Falta' ? "bg-red-100 text-red-700" :
                          escala.status === 'Substituído' ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {escala.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button 
                          onClick={() => handleSuggestSubstitution(escala)}
                          className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
                        >
                          <UserPlus size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Risco, Sobrecarga e Financeiro */}
        <div className="space-y-8">
          {/* Risco Operacional por Posto Descoberto */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-500" />
              Risco Operacional (Descobertos)
            </h3>
            <div className="space-y-4">
              {analysis?.riscoOperacional?.map((risco: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-slate-800">{risco.posto}</h4>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                      risco.nivel === 'Crítico' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {risco.nivel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{risco.motivo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas de Sobrecarga */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Alertas de Sobrecarga
            </h3>
            <div className="space-y-4">
              {analysis?.alertasSobrecarga?.map((alerta: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{alerta.vigilante}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{alerta.motivo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(alerta.horasSemana / 44) * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{alerta.horasSemana}h/sem</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impacto Financeiro da Escala */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-sm font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <DollarSign size={18} />
              Impacto Financeiro
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-100">Custo de Substituições</span>
                <span className="text-sm font-black">{analysis?.impactoFinanceiro?.custoSubstituicao || 'R$ 0,00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-100">Economia Otimização IA</span>
                <span className="text-sm font-black text-emerald-200">-{analysis?.impactoFinanceiro?.economiaIA || 'R$ 0,00'}</span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">ROI da Escala Inteligente</span>
                <span className="text-lg font-black">{analysis?.impactoFinanceiro?.roiEscala || '0.0x'}</span>
              </div>
            </div>
            <button className="w-full py-3 bg-white text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
              APLICAR ESCALA ÓTIMA
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Substituição Inteligente */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="Sugestão de Substituição Inteligente"
        maxWidth="max-w-lg"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Candidatos Disponíveis</h4>
                <p className="text-[10px] text-slate-500">Filtrados por distância, performance e custo.</p>
              </div>
            </div>

            <div className="space-y-3">
              {disponiveis.map((v) => (
                <div key={v.vigilanteId} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-500 transition-all group">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-bold text-slate-800">{v.vigilanteNome}</h5>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black">{v.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1"><Navigation size={10} /> {v.distanciaKm} km</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {v.historicoSubstituicoes} subst.</span>
                  </div>
                  <button 
                    onClick={() => confirmSubstitution(v.vigilanteId, v.vigilanteNome)}
                    className="w-full py-2 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all"
                  >
                    CONFIRMAR ALOCAÇÃO
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
