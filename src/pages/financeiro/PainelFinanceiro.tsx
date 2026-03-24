import React, { useState, useEffect } from 'react';
import {
  Shield, TrendingUp, DollarSign, Wallet, AlertTriangle,
  Target, BarChart3, Copy, CheckCircle2, Search,
  Building2, Zap, TrendingDown, ArrowUpRight, ArrowDownRight,
  Calendar, ChevronRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { financeiroImportService } from '../../services/financeiroImportService';
import { contextService } from '../../services/contextService';
import { getFinanceKPIs } from '../../services/dashboardService';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr
} from './components/FinanceComponents';

// ─── Dados de demonstração para os gráficos ────────────────────────────────

const fluxoCaixaData = [
  { mes: 'Out', receita: 298000, despesa: 201000, lucro: 97000 },
  { mes: 'Nov', receita: 312000, despesa: 198000, lucro: 114000 },
  { mes: 'Dez', receita: 287000, despesa: 215000, lucro: 72000 },
  { mes: 'Jan', receita: 321000, despesa: 204000, lucro: 117000 },
  { mes: 'Fev', receita: 334000, despesa: 211000, lucro: 123000 },
  { mes: 'Mar', receita: 298500, despesa: 189000, lucro: 109500 },
];

const distribuicaoCustosData = [
  { name: 'Mão de Obra', value: 72, color: '#10b981' },
  { name: 'Impostos', value: 8, color: '#6366f1' },
  { name: 'Equipamentos', value: 9, color: '#f59e0b' },
  { name: 'Uniformes', value: 5, color: '#3b82f6' },
  { name: 'Administrativo', value: 6, color: '#8b5cf6' },
];

const proximosVencimentos = [
  { descricao: 'Folha de pagamento', data: '30/03', valor: 'R$ 186.400', tipo: 'saida', urgencia: 'alta' },
  { descricao: 'FGTS / INSS', data: '07/04', valor: 'R$ 48.200', tipo: 'saida', urgencia: 'alta' },
  { descricao: 'Petrobras Duque — NF-3241', data: '31/03', valor: 'R$ 92.400', tipo: 'entrada', urgencia: 'normal' },
  { descricao: 'Banco do Brasil RJ — NF-3242', data: '31/03', valor: 'R$ 64.800', tipo: 'entrada', urgencia: 'normal' },
  { descricao: 'Bradesco Ipanema — VENCIDA', data: '28/02', valor: 'R$ 18.400', tipo: 'entrada', urgencia: 'atrasado' },
];

// ─── Tooltip customizado para os gráficos ──────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Banner de integração bancária ─────────────────────────────────────────

function BannerIntegracaoBancaria() {
  const bancos = ['Itaú', 'Bradesco', 'Nubank', 'Santander', 'BB', 'Caixa', 'Inter'];
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="p-3 bg-emerald-500 rounded-xl shrink-0">
        <Building2 className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-black text-emerald-800 dark:text-emerald-300 text-sm">
            Integração Bancária via Open Finance / API
          </p>
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">NOVO</span>
        </div>
        <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-3">
          Conecte seu banco para importar extratos automaticamente e conciliar em tempo real — sem sair do sistema.
        </p>
        <div className="flex flex-wrap gap-2">
          {bancos.map(banco => (
            <span key={banco} className="px-3 py-1 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
              {banco}
            </span>
          ))}
        </div>
      </div>
      <ActionButton className="shrink-0 whitespace-nowrap">
        <Zap className="w-4 h-4" />
        Conectar banco
      </ActionButton>
    </div>
  );
}

// ─── Gráfico DRE (Receita vs Custo vs Lucro) ───────────────────────────────

function GraficoDRE() {
  return (
    <SectionCard
      title="DRE Resumido — Receita vs Custo vs Lucro"
      action={
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Receita</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />Custo</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Lucro</span>
        </div>
      }
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fluxoCaixaData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" name="Custo" fill="#fb7185" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

// ─── Gráfico Distribuição de Custos ────────────────────────────────────────

function GraficoDistribuicaoCustos() {
  return (
    <SectionCard title="Distribuição de Custos">
      <div className="h-44 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribuicaoCustosData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {distribuicaoCustosData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {distribuicaoCustosData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Próximos vencimentos ───────────────────────────────────────────────────

function ProximosVencimentos() {
  const urgenciaConfig: Record<string, { bg: string; text: string; label: string }> = {
    atrasado: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', label: 'Atrasado' },
    alta: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'Urgente' },
    normal: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', label: '' },
  };

  return (
    <SectionCard
      title="Próximos Vencimentos"
      action={
        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 cursor-pointer hover:underline">
          Ver todos <ChevronRight className="w-3 h-3" />
        </span>
      }
    >
      <div className="space-y-2">
        {proximosVencimentos.map((item, idx) => {
          const cfg = urgenciaConfig[item.urgencia];
          return (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${cfg.bg} group`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${item.tipo === 'entrada' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
                  {item.tipo === 'entrada'
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.descricao}</p>
                  <p className={`text-xs font-semibold ${cfg.text}`}>
                    {cfg.label || item.data}
                    {cfg.label ? ` — ${item.data}` : ''}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-black shrink-0 ml-2 ${item.tipo === 'entrada' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {item.valor}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─── Indicadores KPI extras ─────────────────────────────────────────────────

function IndicadoresExtra() {
  const indicadores = [
    { label: 'Lucratividade', valor: 36.7, cor: 'bg-emerald-500', meta: 40 },
    { label: 'Meta de receita', valor: 92, cor: 'bg-blue-500', meta: 100 },
    { label: 'Budget utilizado', valor: 74, cor: 'bg-amber-500', meta: 100 },
    { label: 'Inadimplência', valor: 5.1, cor: 'bg-rose-500', meta: 10 },
  ];

  return (
    <SectionCard title="Indicadores de Performance">
      <div className="space-y-5">
        {indicadores.map((ind, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{ind.label}</span>
              <span className="font-black text-gray-900 dark:text-white">{ind.valor}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`${ind.cor} h-full rounded-full transition-all duration-700`}
                style={{ width: `${(ind.valor / ind.meta) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Ponto de equilíbrio</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">R$ 189.400</p>
            <p className="text-xs text-emerald-600 font-bold">Atingido dia 11</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Prazo médio receb.</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">28 dias</p>
            <p className="text-xs text-amber-600 font-bold">Meta: 21 dias</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────

export function PainelFinanceiro() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openModal, setOpenModal] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  useEffect(() => {
    let mounted = true;
    async function loadKPIs() {
      try {
        const data = await getFinanceKPIs();
        if (mounted) { setKpis(data); setLoading(false); }
      } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
        if (mounted) setLoading(false);
      }
    }
    loadKPIs();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-500 dark:text-gray-400">
      <RefreshCw className="w-5 h-5 animate-spin" />
      <span className="font-medium">Carregando dados financeiros...</span>
    </div>
  );

  if (!kpis) return <div className="text-rose-500 font-medium p-8">Erro ao carregar dados. Tente novamente.</div>;

  const handleCopyContext = async () => {
    try {
      const context = await contextService.getProjectContext();
      const text = contextService.buildChatContextText(context);
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao copiar contexto:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const kpiCards = [
    {
      title: 'Saldo Total',
      value: formatCurrency(kpis?.total_balance ?? 0),
      subtitle: 'Disponível agora',
      icon: Wallet,
      colorClass: 'text-blue-500',
    },
    {
      title: 'Faturamento Mensal',
      value: formatCurrency(kpis?.monthly_revenue ?? 0),
      subtitle: `${kpis?.revenue_growth >= 0 ? '+' : ''}${kpis?.revenue_growth ?? 0}% vs mês ant.`,
      icon: TrendingUp,
      colorClass: 'text-emerald-500',
    },
    {
      title: 'Custo Operacional',
      value: formatCurrency(kpis?.monthly_costs ?? 0),
      subtitle: 'Folha + impostos + infra',
      icon: DollarSign,
      colorClass: 'text-rose-500',
    },
    {
      title: 'Lucro Estimado',
      value: formatCurrency((kpis?.monthly_revenue ?? 0) - (kpis?.monthly_costs ?? 0)),
      subtitle: `Margem ${kpis?.profit_margin ?? 0}%`,
      icon: BarChart3,
      colorClass: 'text-purple-500',
    },
    {
      title: 'Juros Evitados',
      value: formatCurrency(kpis?.juros_evitados ?? 0),
      subtitle: 'Pgtos antecipados no mês',
      icon: Shield,
      colorClass: 'text-teal-500',
    },
    {
      title: 'Em Atraso',
      value: formatCurrency(kpis?.overdue_receivables ?? 0),
      subtitle: `Inadimplência ${kpis?.inadimplencia_pct ?? 0}%`,
      icon: AlertTriangle,
      colorClass: 'text-amber-500',
    },
  ];

  const despesasPorCentro = [
    { nome: 'Mão de Obra (folha + encargos)', percentual: 72 },
    { nome: 'Impostos & Taxas', percentual: 8 },
    { nome: 'Equipamentos & Tecnologia', percentual: 9 },
    { nome: 'Uniformes & EPI', percentual: 5 },
    { nome: 'Administrativo & Outros', percentual: 6 },
  ];

  const indicadoresFinanceiros = [
    { label: 'Receita por vigilante/mês', value: 'R$ 3.284' },
    { label: 'Custo médio por vigilante', value: 'R$ 2.680' },
    { label: 'Ticket médio por contrato', value: 'R$ 24.917' },
    { label: 'Prazo médio recebimento', value: '28 dias' },
    { label: 'Inadimplência (% receita)', value: '5,1%' },
    { label: 'Liquidez corrente', value: '1,42' },
    { label: 'EBITDA', value: 'R$ 178.320' },
  ];

  const topContratos = [
    { cliente: 'Petrobras Duque', servico: 'Vigilância Armada', func: 28, valor: 'R$ 92.400', status: 'Ativo', vencimento: 'Dez/2026' },
    { cliente: 'Banco do Brasil RJ', servico: 'Vigilância Armada', func: 18, valor: 'R$ 64.800', status: 'Ativo', vencimento: 'Jun/2026' },
    { cliente: 'Shopping Tijuca', servico: 'Vigilância + Portaria', func: 22, valor: 'R$ 58.200', status: 'Renovar', vencimento: 'Abr/2026' },
    { cliente: 'Condomínio Barra Sul', servico: 'Portaria 24h', func: 12, valor: 'R$ 28.800', status: 'Ativo', vencimento: 'Out/2026' },
    { cliente: 'Bradesco Ipanema', servico: 'Vigilância Armada', func: 8, valor: 'R$ 24.800', status: 'Inadimplente', vencimento: 'Ago/2026' },
  ];

  const notasFiscais = [
    { nf: 'NF-3241', cliente: 'Petrobras Duque', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 92.400', status: 'Emitida', acao: 'Ver' },
    { nf: 'NF-3242', cliente: 'Banco do Brasil RJ', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 64.800', status: 'Emitida', acao: 'Ver' },
    { nf: 'NF-3243', cliente: 'Shopping Tijuca', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 58.200', status: 'Pendente', acao: 'Ver' },
    { nf: 'NF-3220', cliente: 'Bradesco Ipanema', emissao: '01/02/2026', vencimento: '28/02/2026', valor: 'R$ 18.400', status: 'Vencida', acao: 'Cobrar' },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <PageHeader
        title="Gestão Financeira e Contábil"
        subtitle="Controle completo de receitas, custos operacionais, folha de pagamento e obrigações contábeis."
        actions={
          <>
            <ActionButton
              variant="secondary"
              onClick={handleCopyContext}
              className={
                copyStatus === 'success' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                copyStatus === 'error' ? 'text-rose-600 border-rose-200 bg-rose-50' : ''
              }
            >
              {copyStatus === 'success'
                ? <><CheckCircle2 className="w-4 h-4" /> Contexto copiado</>
                : copyStatus === 'error'
                ? 'Erro ao copiar'
                : <><Copy className="w-4 h-4" /> Copiar contexto</>
              }
            </ActionButton>
            <ActionButton variant="secondary">
              <Calendar className="w-4 h-4" />
              Março 2026
            </ActionButton>
            <ActionButton>
              + Novo Lançamento
            </ActionButton>
          </>
        }
      />

      {/* ── Banner integração bancária ──────────────────────────────────── */}
      <BannerIntegracaoBancaria />

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => (
          <KpiCard key={i} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} colorClass={card.colorClass} />
        ))}
      </div>

      {/* ── Gráficos principais ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GraficoDRE />
        </div>
        <div>
          <GraficoDistribuicaoCustos />
        </div>
      </div>

      {/* ── Vencimentos + Indicadores ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProximosVencimentos />
        </div>
        <div>
          <IndicadoresExtra />
        </div>
      </div>

      {/* ── Despesas por Centro de Custo + Indicadores financeiros ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Despesas por Centro de Custo">
            <div className="space-y-5">
              {despesasPorCentro.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.nome}</span>
                    <span className="text-gray-900 dark:text-white font-black">{item.percentual}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500 group-hover:bg-emerald-400"
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Indicadores Financeiros">
            <div className="space-y-4">
              {indicadoresFinanceiros.map((ind, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{ind.label}</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{ind.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Top Contratos ───────────────────────────────────────────────── */}
      <SectionCard
        title="Top Contratos por Receita"
        action={
          <ActionButton variant="ghost" className="text-emerald-600 hover:text-emerald-700">
            + Lançamento
          </ActionButton>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Serviço</Th>
              <Th className="text-center">Func.</Th>
              <Th>Valor/Mês</Th>
              <Th>Status</Th>
              <Th>Vencimento</Th>
            </tr>
          </thead>
          <tbody>
            {topContratos.map((contrato, idx) => (
              <Tr key={idx}>
                <Td className="font-bold">{contrato.cliente}</Td>
                <Td>{contrato.servico}</Td>
                <Td className="text-center">{contrato.func}</Td>
                <Td className="font-black">{contrato.valor}</Td>
                <Td><StatusBadge status={contrato.status} /></Td>
                <Td>{contrato.vencimento}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {/* ── Notas Fiscais ───────────────────────────────────────────────── */}
      <SectionCard
        title="Notas Fiscais — Março 2026"
        action={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar NF ou cliente..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <ActionButton className="w-full sm:w-auto whitespace-nowrap">
              + Emitir NF
            </ActionButton>
          </div>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>NF</Th>
              <Th>Cliente</Th>
              <Th>Emissão</Th>
              <Th>Vencimento</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th className="text-right">Ação</Th>
            </tr>
          </thead>
          <tbody>
            {notasFiscais.map((nf, idx) => (
              <Tr key={idx}>
                <Td className="font-black">{nf.nf}</Td>
                <Td className="font-bold">{nf.cliente}</Td>
                <Td>{nf.emissao}</Td>
                <Td>{nf.vencimento}</Td>
                <Td className="font-black">{nf.valor}</Td>
                <Td><StatusBadge status={nf.status} /></Td>
                <Td className="text-right">
                  <button className={`text-xs font-bold hover:underline ${nf.acao === 'Cobrar' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {nf.acao}
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {/* ── Modal novo lançamento ───────────────────────────────────────── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[400px] border border-gray-200 dark:border-gray-800 shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Novo Lançamento</h2>
            <input
              placeholder="Descrição"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <input
              placeholder="Valor"
              type="number"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <select className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-6 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
            </select>
            <div className="flex justify-end gap-3">
              <ActionButton variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</ActionButton>
              <ActionButton>Salvar</ActionButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
