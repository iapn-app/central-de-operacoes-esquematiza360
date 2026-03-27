import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Search,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  BarChart3, Building2, Shield, ArrowUpRight, ArrowDownRight,
  FileText, Filter,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Contrato {
  id: string;
  cliente: string;
  empresa: string;
  tipo: string;
  profissionais: number;
  faturamento: number;
  custoMO: number;       // Mão de obra (salário + encargos)
  custoUniforme: number; // Uniformes e EPIs
  custoTransporte: number;
  custoAdmin: number;    // Rateio administrativo
  status: 'Alta' | 'Média' | 'Baixa' | 'Prejuízo';
}

// ─── Dados mock realistas para segurança patrimonial ──────────────────────

const CONTRATOS: Contrato[] = [
  {
    id: '1', cliente: 'Condomínio Alto Padrão', empresa: 'Vigilância', tipo: 'Vigilância',
    profissionais: 12, faturamento: 45000,
    custoMO: 28800, custoUniforme: 600, custoTransporte: 1200, custoAdmin: 2250,
    status: 'Alta',
  },
  {
    id: '2', cliente: 'Shopping Center Sul', empresa: 'Vigilância', tipo: 'Vigilância',
    profissionais: 30, faturamento: 120000,
    custoMO: 79200, custoUniforme: 1500, custoTransporte: 3000, custoAdmin: 6000,
    status: 'Alta',
  },
  {
    id: '3', cliente: 'Hospital Santa Maria', empresa: 'Serviços', tipo: 'Limpeza',
    profissionais: 25, faturamento: 85000,
    custoMO: 62500, custoUniforme: 1250, custoTransporte: 2500, custoAdmin: 4250,
    status: 'Média',
  },
  {
    id: '4', cliente: 'Petrobras Duque', empresa: 'Vigilância', tipo: 'Vigilância',
    profissionais: 28, faturamento: 92400,
    custoMO: 63840, custoUniforme: 1400, custoTransporte: 2800, custoAdmin: 4620,
    status: 'Alta',
  },
  {
    id: '5', cliente: 'Banco do Brasil RJ', empresa: 'Vigilância', tipo: 'Vigilância',
    profissionais: 18, faturamento: 64800,
    custoMO: 52200, custoUniforme: 900, custoTransporte: 1800, custoAdmin: 3240,
    status: 'Média',
  },
  {
    id: '6', cliente: 'Escola Estadual Centro', empresa: 'Vigilância', tipo: 'Vigilância',
    profissionais: 8, faturamento: 22000,
    custoMO: 19200, custoUniforme: 400, custoTransporte: 800, custoAdmin: 1100,
    status: 'Baixa',
  },
  {
    id: '7', cliente: 'Supermercado Rede Fácil', empresa: 'Prevenção', tipo: 'Prevenção de Perdas',
    profissionais: 6, faturamento: 18000,
    custoMO: 16800, custoUniforme: 300, custoTransporte: 600, custoAdmin: 900,
    status: 'Prejuízo',
  },
  {
    id: '8', cliente: 'Indústria MetalParts', empresa: 'Patrimonial', tipo: 'Patrimonial',
    profissionais: 10, faturamento: 38000,
    custoMO: 24000, custoUniforme: 500, custoTransporte: 1000, custoAdmin: 1900,
    status: 'Alta',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

function calcular(c: Contrato) {
  const custoTotal = c.custoMO + c.custoUniforme + c.custoTransporte + c.custoAdmin;
  const lucro = c.faturamento - custoTotal;
  const margem = (lucro / c.faturamento) * 100;
  const custoPerCapita = custoTotal / c.profissionais;
  const faturamentoPerCapita = c.faturamento / c.profissionais;
  return { custoTotal, lucro, margem, custoPerCapita, faturamentoPerCapita };
}

function getStatusConfig(margem: number) {
  if (margem >= 25) return { label: 'Alta', cor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', barra: '#10b981' };
  if (margem >= 15) return { label: 'Média', cor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', barra: '#f59e0b' };
  if (margem >= 0)  return { label: 'Baixa', cor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', barra: '#f97316' };
  return { label: 'Prejuízo', cor: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', barra: '#ef4444' };
}

// ─── Card KPI ──────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, cor, trend }: {
  title: string; value: string; sub: string;
  icon: React.ElementType; cor: string; trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${cor}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
          {sub}
        </p>
      </div>
    </div>
  );
}

// ─── Linha da tabela expandível ────────────────────────────────────────────

function ContratoRow({ c }: { c: Contrato }) {
  const [aberto, setAberto] = useState(false);
  const { custoTotal, lucro, margem, custoPerCapita, faturamentoPerCapita } = calcular(c);
  const cfg = getStatusConfig(margem);

  const custos = [
    { label: 'Mão de Obra (salário + encargos)', valor: c.custoMO, pct: (c.custoMO / custoTotal) * 100 },
    { label: 'Uniformes e EPIs', valor: c.custoUniforme, pct: (c.custoUniforme / custoTotal) * 100 },
    { label: 'Transporte', valor: c.custoTransporte, pct: (c.custoTransporte / custoTotal) * 100 },
    { label: 'Rateio Administrativo', valor: c.custoAdmin, pct: (c.custoAdmin / custoTotal) * 100 },
  ];

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        onClick={() => setAberto(a => !a)}
      >
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{c.cliente}</p>
            <p className="text-xs text-slate-400">{c.empresa} · {c.tipo}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{fmt(c.faturamento)}</td>
        <td className="px-4 py-3 text-sm text-slate-600 text-right">{fmt(custoTotal)}</td>
        <td className="px-4 py-3 text-right">
          <span className={`text-sm font-bold ${lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {fmt(lucro)}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, margem))}%`, background: cfg.barra }}
              />
            </div>
            <span className={`text-xs font-bold ${cfg.cor}`}>{fmtPct(margem)}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.cor} ${cfg.border}`}>
            {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-slate-400">{aberto ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}</span>
        </td>
      </tr>

      {aberto && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breakdown de custos */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Composição dos Custos</p>
                {custos.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{fmt(item.valor)}</span>
                        <span className="text-xs text-slate-400">({fmtPct(item.pct)})</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Métricas por profissional */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Por Profissional ({c.profissionais} pessoas)</p>
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Faturamento/pessoa</span>
                    <span className="text-xs font-bold text-emerald-600">{fmt(faturamentoPerCapita)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Custo/pessoa</span>
                    <span className="text-xs font-bold text-slate-700">{fmt(custoPerCapita)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-xs text-slate-500">Lucro/pessoa</span>
                    <span className={`text-xs font-bold ${lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {fmt((lucro) / c.profissionais)}
                    </span>
                  </div>
                </div>

                {margem < 15 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {margem < 0 ? 'Contrato em prejuízo!' : 'Margem abaixo do mínimo (15%)'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {margem < 0
                        ? 'Revise urgente a precificação ou renegocie o contrato.'
                        : 'Considere renegociar ou reduzir custos operacionais.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

export function RentabilidadeContratos() {
  const [busca, setBusca] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const empresas = ['Todas', ...Array.from(new Set(CONTRATOS.map(c => c.empresa)))];
  const statusOpts = ['Todos', 'Alta', 'Média', 'Baixa', 'Prejuízo'];

  const contratosFiltrados = CONTRATOS.filter(c => {
    const { margem } = calcular(c);
    const statusCalc = getStatusConfig(margem).label;
    return (
      (filtroEmpresa === 'Todas' || c.empresa === filtroEmpresa) &&
      (filtroStatus === 'Todos' || statusCalc === filtroStatus) &&
      c.cliente.toLowerCase().includes(busca.toLowerCase())
    );
  });

  // KPIs consolidados
  const totalFat = CONTRATOS.reduce((s, c) => s + c.faturamento, 0);
  const totalCusto = CONTRATOS.reduce((s, c) => s + calcular(c).custoTotal, 0);
  const totalLucro = totalFat - totalCusto;
  const margemMedia = (totalLucro / totalFat) * 100;
  const emPrejuizo = CONTRATOS.filter(c => calcular(c).margem < 0).length;
  const margemBaixa = CONTRATOS.filter(c => { const m = calcular(c).margem; return m >= 0 && m < 15; }).length;

  // Dados gráfico ranking
  const dadosGrafico = [...CONTRATOS]
    .map(c => ({ nome: c.cliente.split(' ').slice(0, 2).join(' '), margem: calcular(c).margem, faturamento: c.faturamento }))
    .sort((a, b) => b.margem - a.margem);

  // Dados pizza distribuição margem
  const dadosPizza = [
    { name: 'Alta (≥25%)', value: CONTRATOS.filter(c => calcular(c).margem >= 25).length, fill: '#10b981' },
    { name: 'Média (15-25%)', value: CONTRATOS.filter(c => { const m = calcular(c).margem; return m >= 15 && m < 25; }).length, fill: '#f59e0b' },
    { name: 'Baixa (0-15%)', value: CONTRATOS.filter(c => { const m = calcular(c).margem; return m >= 0 && m < 15; }).length, fill: '#f97316' },
    { name: 'Prejuízo', value: CONTRATOS.filter(c => calcular(c).margem < 0).length, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rentabilidade por Contrato</h1>
          <p className="text-sm text-slate-500 mt-1">Margem, custo e lucro por cliente — Grupo Esquematiza</p>
        </div>
        <div className="flex items-center gap-2">
          {emPrejuizo > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-700">{emPrejuizo} em prejuízo</span>
            </div>
          )}
          {margemBaixa > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{margemBaixa} margem baixa</span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Faturamento Total" value={fmt(totalFat)} sub={`${CONTRATOS.length} contratos ativos`} icon={DollarSign} cor="bg-emerald-50 text-emerald-600" trend="up" />
        <KpiCard title="Custo Total" value={fmt(totalCusto)} sub={`${fmtPct((totalCusto/totalFat)*100)} do faturamento`} icon={TrendingDown} cor="bg-rose-50 text-rose-600" />
        <KpiCard title="Lucro Total" value={fmt(totalLucro)} sub="resultado líquido" icon={BarChart3} cor="bg-purple-50 text-purple-600" trend="up" />
        <KpiCard title="Margem Média" value={fmtPct(margemMedia)} sub={margemMedia >= 20 ? "✓ Saudável" : "⚠ Abaixo do ideal"} icon={TrendingUp} cor={margemMedia >= 20 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ranking de margem */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Ranking de Margem por Contrato</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: '#6b7280' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Margem']} />
                <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                  {dadosGrafico.map((entry, i) => (
                    <Cell key={i} fill={getStatusConfig(entry.margem).barra} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pizza distribuição */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Distribuição de Margem</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}`}>
                  {dadosPizza.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              {empresas.map(e => <option key={e}>{e}</option>)}
            </select>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              {statusOpts.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Cliente / Empresa</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Faturamento</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Custo Total</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Lucro</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Margem</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {contratosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              ) : (
                contratosFiltrados.map(c => <ContratoRow key={c.id} c={c} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">{contratosFiltrados.length} contratos exibidos</p>
          <p className="text-xs text-slate-400">Clique em qualquer linha para ver o detalhamento de custos</p>
        </div>
      </div>

      {/* Aviso dados reais */}
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-emerald-700 font-semibold text-sm">
          🚀 Dados ilustrativos. Conecte ao Supabase para exibir rentabilidade real por contrato.
        </p>
      </div>
    </div>
  );
}
