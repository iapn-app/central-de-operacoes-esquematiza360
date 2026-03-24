import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  ShieldAlert,
  FileWarning,
  HandCoins,
  Scale
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
  PieChart, 
  Cell, 
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { MOCK_FINANCEIRO, MOCK_CLIENTES } from '../constants/mockData';
import { geminiService } from '../services/geminiService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Inadimplencia: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensal');

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await geminiService.generateInadimplenciaAnalysis({
      financeiro: MOCK_FINANCEIRO,
      clientes: MOCK_CLIENTES.slice(0, 30)
    });
    setAnalysis(result);
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
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Inadimplência & Risco</h1>
            <p className="text-sm text-slate-500 font-medium">BI Financeiro para Saúde da Carteira e Fluxo de Caixa</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['Mensal', 'Trimestral', 'Anual'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${selectedPeriod === p ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
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
          { label: 'Volume em Aberto', val: analysis?.kpis?.aberto || 'R$ 0,00', icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50', trend: '+4.2%' },
          { label: 'Taxa de Inadimplência', val: analysis?.kpis?.taxa || '0%', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-0.5%' },
          { label: 'Risco de Fluxo de Caixa', val: analysis?.kpis?.riscoCaixa || 'Baixo', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Estável' },
          { label: 'Recuperação Mensal', val: analysis?.kpis?.recuperacao || 'R$ 0,00', icon: HandCoins, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+15.8%' }
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
            <div className={`flex items-center gap-1 text-[10px] font-bold mt-2 ${kpi.trend.includes('+') ? 'text-red-500' : 'text-emerald-500'}`}>
              {kpi.trend.includes('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{kpi.trend} vs mês anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2">
              <TrendingUp size={18} className="text-red-500" />
              Tendência de Inadimplência (Últimos 6 Meses)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis?.tendenciaInadimplencia || []}>
                  <defs>
                    <linearGradient id="colorTaxa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="taxa" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTaxa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Aging Portfolio & Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <PieChartIcon size={18} className="text-blue-500" />
                Aging (Vencidos por Faixa)
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis?.agingPortfolio || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="valor"
                    >
                      {analysis?.agingPortfolio?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {analysis?.agingPortfolio?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-500">{item.faixa}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-700">{item.percentual}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <HandCoins size={18} className="text-emerald-500" />
                Funil de Cobrança
              </h3>
              <div className="space-y-4">
                {analysis?.funilCobranca?.map((etapa: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{etapa.etapa}</span>
                      <span className="text-[10px] font-black text-slate-700">{etapa.valor}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - (idx * 20)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 font-medium">{etapa.quantidade} clientes nesta fase</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Critical Contracts Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <FileWarning size={18} className="text-red-500" />
                Contratos Críticos & Risco de Cancelamento
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Aberto</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atraso</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risco</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analysis?.contratosCriticos?.map((contrato: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-red-700 transition-colors">{contrato.cliente}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-900">{contrato.valor}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs font-bold text-slate-500">{contrato.atraso}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${contrato.risco === 'Crítico' ? 'bg-red-100 text-red-700' : contrato.risco === 'Alto' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {contrato.risco}
                        </span>
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
          {/* Top Debtors Ranking */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-red-400" />
              Maiores Devedores
            </h3>
            <div className="space-y-4">
              {analysis?.maioresDevedores?.map((devedor: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{devedor.nome}</h4>
                    <span className="text-xs font-black text-red-400">{devedor.valor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Score de Risco Financeiro</span>
                    <span className={`text-[10px] font-bold ${devedor.scoreRisco > 80 ? 'text-red-400' : 'text-amber-400'}`}>{devedor.scoreRisco}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${devedor.scoreRisco > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${devedor.scoreRisco}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Risco */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <HandCoins size={18} className="text-emerald-500" />
              Insights de Risco & Caixa
            </h3>
            <div className="space-y-4">
              {analysis?.insightsRisco?.map((insight: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${insight.impacto === 'Alto' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      Impacto {insight.impacto}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">{insight.titulo}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{insight.descricao}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg">
              EXPORTAR RELATÓRIO DE RISCO
            </button>
          </div>

          {/* Recommended Actions */}
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-sm font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <HandCoins size={18} />
              Ações Recomendadas
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Negociação em Lote', desc: '4 clientes na faixa +90 dias elegíveis para acordo.' },
                { title: 'Suspensão de Serviço', desc: '2 contratos com inadimplência crítica e sem contato.' },
                { title: 'Aviso de Vencimento', desc: '12 contratos vencendo em < 15 dias.' }
              ].map((acao, i) => (
                <div key={i} className="p-3 bg-white/10 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold mb-0.5">{acao.title}</h4>
                  <p className="text-[10px] text-emerald-50/70">{acao.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inadimplencia;
