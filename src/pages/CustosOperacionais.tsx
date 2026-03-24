import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Users, 
  Fuel, 
  Wrench, 
  Clock,
  BarChart3, 
  PieChart, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Info,
  Wallet,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import { MOCK_FINANCEIRO_POSTOS, MOCK_FINANCEIRO_CONTRATOS, MOCK_RENTABILIDADE_CLIENTES } from '../constants/mockData';
import { geminiService } from '../services/geminiService';

const CustosOperacionais: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  const fetchAnalysis = async () => {
    setLoading(true);
    const analysis = await geminiService.generateOperationalCostAnalysis({
      postos: MOCK_FINANCEIRO_POSTOS,
      contratos: MOCK_FINANCEIRO_CONTRATOS,
      rentabilidade: MOCK_RENTABILIDADE_CLIENTES
    });
    setCostAnalysis(analysis);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
            <Wallet size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Custos Operacionais & Eficiência</h1>
            <p className="text-sm text-slate-500 font-medium">Inteligência Financeira para Economia Estratégica</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['Mensal', 'Trimestral', 'Anual'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${selectedPeriod === p ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAnalysis}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Custo Total Operacional', val: costAnalysis?.kpis?.custoTotal || 'R$ 0,00', icon: DollarSign, color: 'text-slate-600', bg: 'bg-slate-50', trend: '-2.4%' },
          { label: 'Economia Gerada por IA', val: costAnalysis?.kpis?.economiaIA || 'R$ 0,00', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.8%' },
          { label: 'ROI de Prevenção', val: costAnalysis?.kpis?.roiPrevencao || '0.0x', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+0.5x' },
          { label: 'Margem Média Operacional', val: costAnalysis?.kpis?.margemMedia || '0%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+1.2%' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4`}>
              <kpi.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{kpi.val}</h3>
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-2 ${kpi.trend.includes('+') ? 'text-emerald-500' : 'text-emerald-500'}`}>
              <TrendingDown size={12} />
              <span>{kpi.trend} vs mês anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Fuel Optimization Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Fuel size={18} className="text-blue-500" />
                  Combustível vs Otimização de Rotas (IA)
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Comparativo de consumo real vs projeção com rotas inteligentes</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-slate-500">Real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-500">Otimizado</span>
                </div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={costAnalysis?.graficoCombustivel || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="real" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="otimizado" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost per Post Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Building2 size={18} className="text-emerald-500" />
                Custo Operacional por Posto
              </h3>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posto</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo Real</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margem</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eficiência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {costAnalysis?.custoPorPosto?.map((posto: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{posto.nome}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-900">{posto.custo}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`text-xs font-bold ${parseFloat(posto.margem) > 25 ? 'text-emerald-600' : 'text-amber-600'}`}>{posto.margem}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden min-w-[60px]">
                            <div 
                              className={`h-full rounded-full ${posto.eficiencia > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${posto.eficiencia}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{posto.eficiencia}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Critical Contracts Alerts */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              Contratos de Baixa Margem
            </h3>
            <div className="space-y-4">
              {costAnalysis?.contratosCriticos?.map((contrato: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-white">{contrato.cliente}</h4>
                    <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{contrato.margem}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">{contrato.motivo}</p>
                  <button className="w-full py-2 bg-white/10 text-white text-[10px] font-bold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    {contrato.acao}
                    <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Detection */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <TrendingDown size={18} className="text-amber-500" />
              Desperdícios Detectados
            </h3>
            <div className="space-y-4">
              {costAnalysis?.desperdiciosDetectados?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    {item.tipo.includes('Combustível') ? <Fuel size={16} /> : item.tipo.includes('Manutenção') ? <Wrench size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{item.tipo}</h4>
                      <span className="text-[10px] font-bold text-red-500">-{item.valor}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-sm font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <Zap size={18} />
              Oportunidades de Redução
            </h3>
            <div className="space-y-4">
              {costAnalysis?.oportunidadesReducao?.map((op: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold">{op.titulo}</h4>
                    <span className="text-[10px] font-bold text-emerald-200">{op.economiaEstimada}</span>
                  </div>
                  <p className="text-[10px] text-emerald-50/70 leading-relaxed">{op.descricao}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
              APLICAR OTIMIZAÇÕES
            </button>
          </div>
        </div>
      </div>

      {/* Financial Insights List */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-500" />
          Diagnóstico de Eficiência Operacional (IA)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costAnalysis?.insightsFinanceiros?.map((insight: any, idx: number) => (
            <div key={idx} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{insight.categoria}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${insight.impacto === 'Alto' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  Impacto {insight.impacto}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{insight.titulo}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{insight.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustosOperacionais;
