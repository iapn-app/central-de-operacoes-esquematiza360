import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign,
  Search, ChevronDown, ChevronUp, AlertTriangle,
  BarChart3, Filter, Landmark,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Contrato {
  id: string;
  cliente: string;
  empresa: string;
  tipo: string;
  profissionais: number;
  faturamento: number;
  custoMO: number;
  custoUniforme: number;
  custoTransporte: number;
  custoAdmin: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

function calcular(c: Contrato) {
  const custoTotal = c.custoMO + c.custoUniforme + c.custoTransporte + c.custoAdmin;
  const lucro = c.faturamento - custoTotal;
  const margem = c.faturamento > 0 ? (lucro / c.faturamento) * 100 : 0;
  const custoPerCapita = c.profissionais > 0 ? custoTotal / c.profissionais : 0;
  const faturamentoPerCapita = c.profissionais > 0 ? c.faturamento / c.profissionais : 0;
  return { custoTotal, lucro, margem, custoPerCapita, faturamentoPerCapita };
}

function getStatusConfig(margem: number) {
  if (margem >= 25) return { label: 'Alta',     cor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', barra: '#10b981' };
  if (margem >= 15) return { label: 'Média',    cor: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   barra: '#f59e0b' };
  if (margem >= 0)  return { label: 'Baixa',    cor: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  barra: '#f97316' };
  return              { label: 'Prejuízo', cor: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     barra: '#ef4444' };
}

// ─── KPI Card ──────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, cor }: {
  title: string; value: string; sub: string;
  icon: React.ElementType; cor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${cor}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ─── Linha expandível ──────────────────────────────────────────────────────

function ContratoRow({ c }: { c: Contrato }) {
  const [aberto, setAberto] = useState(false);
  const { custoTotal, lucro, margem, custoPerCapita, faturamentoPerCapita } = calcular(c);
  const cfg = getStatusConfig(margem);

  const custos = [
    { label: 'Mão de Obra (salário + encargos)', valor: c.custoMO,         pct: custoTotal > 0 ? (c.custoMO / custoTotal) * 100 : 0 },
    { label: 'Uniformes e EPIs',                 valor: c.custoUniforme,   pct: custoTotal > 0 ? (c.custoUniforme / custoTotal) * 100 : 0 },
    { label: 'Transporte',                        valor: c.custoTransporte, pct: custoTotal > 0 ? (c.custoTransporte / custoTotal) * 100 : 0 },
    { label: 'Rateio Administrativo',             valor: c.custoAdmin,      pct: custoTotal > 0 ? (c.custoAdmin / custoTotal) * 100 : 0 },
  ];

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        onClick={() => setAberto(a => !a)}
      >
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{c.cliente}</p>
          <p className="text-xs text-slate-400">{c.empresa} · {c.tipo}</p>
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{fmt(c.faturamento)}</td>
        <td className="px-4 py-3 text-sm text-slate-600 text-right">{fmt(custoTotal)}</td>
        <td className="px-4 py-3 text-right">
          <span className={`text-sm font-bold ${lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(lucro)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, margem))}%`, background: cfg.barra }} />
            </div>
            <span className={`text-xs font-bold ${cfg.cor}`}>{fmtPct(margem)}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.cor} ${cfg.border}`}>
            {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-slate-400">
          {aberto ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {aberto && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {fmt(lucro / Math.max(1, c.profissionais))}
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
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('contratos_rentabilidade')
          .select('*')
          .order('faturamento', { ascending: false });

        if (!error && data && data.length > 0) {
          setContratos(data);
        }
      } catch (e) {
        console.warn('Tabela contratos_rentabilidade não encontrada.', e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const empresas = ['Todas', ...Array.from(new Set(contratos.map(c => c.empresa)))];
  const statusOpts = ['Todos', 'Alta', 'Média', 'Baixa', 'Prejuízo'];

  const contratosFiltrados = contratos.filter(c => {
    const { margem } = calcular(c);
    const statusCalc = getStatusConfig(margem).label;
    return (
      (filtroEmpresa === 'Todas' || c.empresa === filtroEmpresa) &&
      (filtroStatus === 'Todos' || statusCalc === filtroStatus) &&
      c.cliente.toLowerCase().includes(busca.toLowerCase())
    );
  });

  const totalFat   = contratos.reduce((s, c) => s + c.faturamento, 0);
  const totalCusto = contratos.reduce((s, c) => s + calcular(c).custoTotal, 0);
  const totalLucro = totalFat - totalCusto;
  const margemMedia = totalFat > 0 ? (totalLucro / totalFat) * 100 : 0;
  const emPrejuizo  = contratos.filter(c => calcular(c).margem < 0).length;
  const margemBaixa = contratos.filter(c => { const m = calcular(c).margem; return m >= 0 && m < 15; }).length;

  const dadosGrafico = [...contratos]
    .map(c => ({ nome: c.cliente.split(' ').slice(0, 2).join(' '), margem: calcular(c).margem }))
    .sort((a, b) => b.margem - a.margem)
    .slice(0, 8);

  const dadosPizza = [
    { name: 'Alta (≥25%)',   value: contratos.filter(c => calcular(c).margem >= 25).length,                                   fill: '#10b981' },
    { name: 'Média (15-25%)', value: contratos.filter(c => { const m = calcular(c).margem; return m >= 15 && m < 25; }).length, fill: '#f59e0b' },
    { name: 'Baixa (0-15%)',  value: contratos.filter(c => { const m = calcular(c).margem; return m >= 0  && m < 15; }).length, fill: '#f97316' },
    { name: 'Prejuízo',       value: contratos.filter(c => calcular(c).margem < 0).length,                                     fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // ── Estado vazio (sem dados reais ainda) ──────────────────────────────────
  if (!loading && contratos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rentabilidade por Contrato</h1>
          <p className="text-sm text-slate-500 mt-1">Margem, custo e lucro por cliente — Grupo Esquematiza</p>
        </div>
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg">Aguardando dados reais</p>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Para ativar este módulo, cadastre os contratos com seus custos operacionais
              na tabela <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">contratos_rentabilidade</code> no Supabase.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-w-lg mx-auto text-left">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Campos esperados na tabela</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 font-mono">
              {['cliente','empresa','tipo','profissionais','faturamento','custo_mo','custo_uniforme','custo_transporte','custo_admin'].map(f => (
                <span key={f} className="bg-white border border-slate-200 rounded px-2 py-1">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rentabilidade por Contrato</h1>
          <p className="text-sm text-slate-500 mt-1">Margem, custo e lucro por cliente — Grupo Esquematiza</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <span className="text-xs text-slate-400 animate-pulse">Carregando...</span>}
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
        <KpiCard title="Faturamento Total" value={fmt(totalFat)}   sub={`${contratos.length} contratos ativos`}                       icon={DollarSign}   cor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Custo Total"       value={fmt(totalCusto)} sub={`${fmtPct(totalFat > 0 ? (totalCusto/totalFat)*100 : 0)} do faturamento`} icon={TrendingDown}  cor="bg-rose-50 text-rose-600" />
        <KpiCard title="Lucro Total"       value={fmt(totalLucro)} sub="resultado líquido"                                             icon={BarChart3}     cor="bg-purple-50 text-purple-600" />
        <KpiCard title="Margem Média"      value={fmtPct(margemMedia)} sub={margemMedia >= 20 ? "✓ Saudável" : "⚠ Abaixo do ideal"}  icon={TrendingUp}    cor={margemMedia >= 20 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"} />
      </div>

      {/* Gráficos */}
      {contratos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-bold text-slate-700 mb-4">Ranking de Margem por Contrato</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={v => `${Number(v).toFixed(0)}%`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
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

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-bold text-slate-700 mb-4">Distribuição de Margem</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ value }) => `${value}`}>
                    {dadosPizza.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : contratosFiltrados.length === 0 ? (
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

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">{contratosFiltrados.length} contratos exibidos</p>
          <p className="text-xs text-slate-400">Clique em qualquer linha para ver o detalhamento de custos</p>
        </div>
      </div>
    </div>
  );
}
