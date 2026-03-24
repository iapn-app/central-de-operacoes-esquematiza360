import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Wallet,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Briefcase,
  Percent,
  Calculator,
  Building2,
  Car,
  Wrench,
  ShieldCheck,
  Landmark,
  Receipt,
  PiggyBank
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Data for Charts (Initial empty states)
const REVENUE_DATA: any[] = [];
const COST_BREAKDOWN: any[] = [];
const TAX_DATA = [
  { name: 'ISS (5%)', value: 45000, color: '#f59e0b' },
  { name: 'PIS (0,65%)', value: 5850, color: '#3b82f6' },
  { name: 'COFINS (3%)', value: 27000, color: '#10b981' },
  { name: 'IRPJ (Presumido)', value: 43200, color: '#8b5cf6' },
  { name: 'CSLL (Presumido)', value: 25920, color: '#ec4899' },
];

// Data for RH & Folha
const MOCK_FOLHA_CONTRATOS = [
  { contrato: 'Condomínio Alto Padrão', operacao: 'São Paulo - SP', funcionarios: 12, salario_base: 24000, encargos: 16800, beneficios: 4200, custo_total: 45000 },
  { contrato: 'Shopping Center Sul', operacao: 'Campinas - SP', funcionarios: 30, salario_base: 60000, encargos: 42000, beneficios: 10500, custo_total: 112500 },
  { contrato: 'Hospital Santa Maria', operacao: 'São Paulo - SP', funcionarios: 25, salario_base: 50000, encargos: 35000, beneficios: 8750, custo_total: 93750 },
];

const MOCK_RESUMO_ENCARGOS = [
  { rubrica: 'INSS (Patronal + RAT + Terceiros)', valor: 32500, vencimento: '20/03/2026', status: 'A Vencer' },
  { rubrica: 'FGTS', valor: 10720, vencimento: '07/03/2026', status: 'Pago' },
  { rubrica: 'Provisão de Férias (1/12)', valor: 11166, vencimento: '-', status: 'Provisionado' },
  { rubrica: 'Provisão de 13º Salário (1/12)', valor: 11166, vencimento: '-', status: 'Provisionado' },
];

const MOCK_CONTRATOS_DETALHADOS = [
  { id: 1, cliente: 'Condomínio Alpha', tipo: 'Vigilância 24h', valorMensal: 45000, margem: 32, postos: 4, reajuste: 'Out/2026', status: 'Ativo' },
  { id: 2, cliente: 'Shopping Center Sul', tipo: 'Limpeza e Asseio', valorMensal: 82000, margem: 28, postos: 12, reajuste: 'Jan/2026', status: 'Atenção' },
  { id: 3, cliente: 'Indústria Beta', tipo: 'Vigilância Armada', valorMensal: 125000, margem: 38, postos: 8, reajuste: 'Mai/2026', status: 'Ativo' },
  { id: 4, cliente: 'Centro Logístico', tipo: 'Portaria', valorMensal: 35000, margem: 25, postos: 3, reajuste: 'Dez/2025', status: 'Crítico' },
];

const MOCK_CUSTOS_OPERACIONAIS = [
  { categoria: 'Folha de Pagamento', valor: 450000, percentual: 55, tendencia: 'up' },
  { categoria: 'Encargos e Benefícios', valor: 180000, percentual: 22, tendencia: 'stable' },
  { categoria: 'Frota e Combustível', valor: 65000, percentual: 8, tendencia: 'down' },
  { categoria: 'Equipamentos e Uniformes', valor: 45000, percentual: 5, tendencia: 'up' },
  { categoria: 'Despesas Administrativas', valor: 85000, percentual: 10, tendencia: 'stable' },
];

export function Financeiro() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'receitas' | 'custos' | 'rh' | 'contabilidade'>('visao_geral');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const stats = [
    { label: 'Faturamento Mensal', value: 'R$ 0,00', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '0%' },
    { label: 'Lucro Estimado', value: 'R$ 0,00', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: '0%' },
    { label: 'Custo Operacional', value: 'R$ 0,00', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', trend: '0%' },
    { label: 'Margem Média', value: '0%', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50', trend: '0%' },
    { label: 'Juros Evitados (Mês)', value: 'R$ 0,00', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '0%' },
    { label: 'Clientes Ativos', value: '0', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: '0' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <Landmark className="text-white w-7 h-7" />
            </div>
            Gestão Financeira e Contábil
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Controle completo de receitas, custos operacionais, folha de pagamento e obrigações contábeis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
            <Calendar className="w-4 h-4" />
            Março 2026
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
          >
            <Download className="w-4 h-4" />
            Exportar DRE
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between group hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl dark:bg-opacity-10 dark:text-opacity-90 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                stat.trend.startsWith('+') ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20"
              )}>
                {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-black text-soft-black dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'visao_geral', label: 'Visão Geral', icon: PieChartIcon },
          { id: 'receitas', label: 'Receitas & Contratos', icon: TrendingUp },
          { id: 'custos', label: 'Custos Operacionais', icon: Wallet },
          { id: 'rh', label: 'RH & Folha', icon: Users },
          { id: 'contabilidade', label: 'Contabilidade & Impostos', icon: Receipt },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2",
              activeTab === tab.id
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Visão Geral */}
      {activeTab === 'visao_geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-soft-black dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-green" />
                DRE Resumido (Receita vs Custo vs Lucro)
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Custo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Lucro</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(17, 24, 39, 0.9)', color: '#fff' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Breakdown Pie Chart */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <h3 className="font-bold text-soft-black dark:text-white mb-8 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              Distribuição de Custos
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COST_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {COST_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(31, 41, 55, 1)', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {COST_BREAKDOWN.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-soft-black dark:text-white">
                    {((item.value / 780000) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Receitas & Contratos */}
      {activeTab === 'receitas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-green" />
                Contratos e Receitas Recorrentes
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
                  />
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg border border-gray-100 dark:border-white/10"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cliente / Serviço</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valor Mensal</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Margem</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Postos</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reajuste</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {MOCK_CONTRATOS_DETALHADOS
                    .filter(c => c.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((contrato) => (
                      <tr key={contrato.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-soft-black dark:text-white">{contrato.cliente}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{contrato.tipo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-soft-black dark:text-white">
                            {formatCurrency(contrato.valorMensal)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs font-bold",
                            contrato.margem >= 35 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          )}>
                            {contrato.margem}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{contrato.postos} postos</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{contrato.reajuste}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                            contrato.status === 'Ativo' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
                          )}>
                            {contrato.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Custos Operacionais */}
      {activeTab === 'custos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
              <h3 className="font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                Detalhamento de Custos Operacionais
              </h3>
              <div className="space-y-4">
                {COST_BREAKDOWN.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                        {index === 0 ? <Users className="w-5 h-5" /> : 
                         index === 1 ? <ShieldCheck className="w-5 h-5" /> : 
                         index === 2 ? <Car className="w-5 h-5" /> : 
                         index === 3 ? <Wrench className="w-5 h-5" /> : 
                         <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-soft-black dark:text-white">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                          {((item.value / 780000) * 100).toFixed(1)}% do custo total
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-soft-black dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
              <h3 className="font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Métricas de Custo
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Custo Médio por Posto</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">R$ 0,00</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Custo Médio por Vigilante</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">R$ 0,00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: RH & Folha */}
      {activeTab === 'rh' && (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-white/5">
              <h3 className="font-bold text-soft-black dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Apropriação do Custo da Folha por Contrato
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contrato / Operação</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Funcionários</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Salário Base</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Encargos</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Benefícios</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {MOCK_FOLHA_CONTRATOS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-soft-black dark:text-white">{item.contrato}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.operacao}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.funcionarios}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{formatCurrency(item.salario_base)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{formatCurrency(item.encargos)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{formatCurrency(item.beneficios)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-soft-black dark:text-white">{formatCurrency(item.custo_total)}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-white/5">
                    <td className="px-6 py-4 font-bold text-soft-black dark:text-white">Total Geral</td>
                    <td className="px-6 py-4 text-center font-bold text-soft-black dark:text-white">
                      {MOCK_FOLHA_CONTRATOS.reduce((acc, curr) => acc + curr.funcionarios, 0)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-soft-black dark:text-white">
                      {formatCurrency(MOCK_FOLHA_CONTRATOS.reduce((acc, curr) => acc + curr.salario_base, 0))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-soft-black dark:text-white">
                      {formatCurrency(MOCK_FOLHA_CONTRATOS.reduce((acc, curr) => acc + curr.encargos, 0))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-soft-black dark:text-white">
                      {formatCurrency(MOCK_FOLHA_CONTRATOS.reduce((acc, curr) => acc + curr.beneficios, 0))}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-brand-green">
                      {formatCurrency(MOCK_FOLHA_CONTRATOS.reduce((acc, curr) => acc + curr.custo_total, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-white/5">
              <h3 className="font-bold text-soft-black dark:text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                Resumo de Encargos e Provisões
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_RESUMO_ENCARGOS.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <p className="text-sm font-bold text-soft-black dark:text-white">{item.rubrica}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Venc: {item.vencimento}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          item.status === 'Pago' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                          item.status === 'Provisionado' ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-soft-black dark:text-white">{formatCurrency(item.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Contabilidade & Impostos */}
      {activeTab === 'contabilidade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
            <h3 className="font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-500" />
              Provisão de Impostos e Tributos (Mensal)
            </h3>
            <div className="space-y-4">
              {TAX_DATA.map((tax, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: tax.color }}></div>
                    <div>
                      <h4 className="text-sm font-bold text-soft-black dark:text-white">{tax.name}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">Vencimento dia 20</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-soft-black dark:text-white">{formatCurrency(tax.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 mt-6">
                <span className="text-sm font-black text-red-700 dark:text-red-400">Total de Impostos Estimados</span>
                <span className="text-lg font-black text-red-700 dark:text-red-400">{formatCurrency(TAX_DATA.reduce((acc, curr) => acc + curr.value, 0))}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
              <h3 className="font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Exportação Contábil
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-soft-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">DRE Gerencial</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Demonstrativo de Resultados</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </button>

                <button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-soft-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Fluxo de Caixa</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Entradas e Saídas (Mensal)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
              <h3 className="font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Faturamento Anual (YTD)
              </h3>
              <div className="text-center py-6">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Acumulado 2026</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">R$ 2.450.000</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Meta Anual: R$ 12.000.000 (20.4%)</p>
                <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20.4%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Relatório DRE"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Período</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="current_month">Mês Atual (Março 2026)</option>
                <option value="last_month">Mês Anterior (Fevereiro 2026)</option>
                <option value="q1">1º Trimestre 2026</option>
                <option value="ytd">Acumulado do Ano (YTD)</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Formato do Arquivo</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-brand-green bg-brand-green/5 text-brand-green font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                  <FileText className="w-4 h-4" />
                  Excel (XLSX)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opções de Exportação</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" defaultChecked />
                  <span className="text-sm font-medium text-soft-black dark:text-white">Incluir detalhamento de custos</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" defaultChecked />
                  <span className="text-sm font-medium text-soft-black dark:text-white">Incluir gráficos e indicadores</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsExportModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                // Simulate download
                setTimeout(() => setIsExportModalOpen(false), 800);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              <Download className="w-4 h-4" />
              Baixar Relatório
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Contratos"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status do Contrato</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="suspenso">Suspensos</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Serviço</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="todos">Todos os Serviços</option>
                <option value="seguranca">Segurança Patrimonial</option>
                <option value="monitoramento">Monitoramento 24h</option>
                <option value="escolta">Escolta Armada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Inadimplência</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="todos">Todos</option>
                <option value="em_dia">Apenas em Dia</option>
                <option value="inadimplentes">Apenas Inadimplentes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Limpar Filtros
            </button>
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
