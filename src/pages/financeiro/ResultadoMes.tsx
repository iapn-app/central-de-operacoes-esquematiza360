import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Wallet, PieChart, Download, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { financeService } from '../../services/financeService';
import { KpiCard, SectionCard, PageHeader, ActionButton } from './components/FinanceComponents';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const pct = (v: number) => `${v.toFixed(1)}%`;

export function ResultadoMes() {
  const [dre, setDre]             = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [periodo, setPeriodo]     = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedRec, setExpandedRec] = useState(true);
  const [expandedDesp, setExpandedDesp] = useState(true);

  useEffect(() => { load(); }, [periodo]);

  async function load() {
    setLoading(true);
    const data = await financeService.getDRE(undefined, periodo);
    setDre(data);
    setLoading(false);
  }

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  const kpis = dre ? [
    { title: 'Receita Bruta',    value: fmt(dre.receitaTotal),  icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Despesas Totais',  value: fmt(dre.despesaTotal),  icon: DollarSign, color: 'text-rose-500' },
    { title: 'Lucro Líquido',    value: fmt(dre.lucro),         icon: Wallet,     color: 'text-blue-500' },
    { title: 'Margem Líquida',   value: pct(dre.margemLucro),   icon: PieChart,   color: 'text-purple-500' },
  ] : [
    { title: 'Receita Bruta',   value: 'R$ 0,00', icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Despesas Totais', value: 'R$ 0,00', icon: DollarSign, color: 'text-rose-500' },
    { title: 'Lucro Líquido',   value: 'R$ 0,00', icon: Wallet,     color: 'text-blue-500' },
    { title: 'Margem Líquida',  value: '0%',       icon: PieChart,   color: 'text-purple-500' },
  ];

  // Dados para gráfico de categorias
  const chartReceitas = dre
    ? Object.entries(dre.receitasPorCategoria as Record<string, number>)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  const chartDespesas = dre
    ? Object.entries(dre.despesasPorCategoria as Record<string, number>)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader
        title="DRE Gerencial"
        subtitle="Demonstrativo de Resultados — dados reais da tabela lançamentos"
        actions={
          <>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm">
              {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ActionButton variant="secondary" onClick={load}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color}
            subtitle={loading ? 'Carregando...' : (dre ? undefined : 'Sem lançamentos no período')} />
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Calculando DRE...</p>
        </div>
      ) : !dre ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <PieChart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Nenhum lançamento no período selecionado.</p>
          <p className="text-gray-400 text-xs mt-1">Cadastre lançamentos em Lançamentos para gerar a DRE.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* DRE Tabela */}
          <SectionCard title="Demonstrativo de Resultados">
            <div className="space-y-1 text-sm">
              {/* Receitas */}
              <button onClick={() => setExpandedRec(!expandedRec)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-emerald-50 rounded-xl font-bold text-emerald-800 hover:bg-emerald-100 transition">
                <span className="flex items-center gap-2">
                  {expandedRec ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Receitas
                </span>
                <span>{fmt(dre.receitaTotal)}</span>
              </button>
              {expandedRec && Object.entries(dre.receitasPorCategoria as Record<string, number>).map(([cat, val]) => (
                <div key={cat} className="flex justify-between px-8 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <span>{cat}</span><span className="font-semibold text-emerald-700">{fmt(val)}</span>
                </div>
              ))}

              {/* Despesas */}
              <button onClick={() => setExpandedDesp(!expandedDesp)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-rose-50 rounded-xl font-bold text-rose-800 hover:bg-rose-100 transition mt-2">
                <span className="flex items-center gap-2">
                  {expandedDesp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Despesas
                </span>
                <span>({fmt(dre.despesaTotal)})</span>
              </button>
              {expandedDesp && Object.entries(dre.despesasPorCategoria as Record<string, number>).map(([cat, val]) => (
                <div key={cat} className="flex justify-between px-8 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg">
                  <span>{cat}</span><span className="font-semibold text-rose-700">({fmt(val)})</span>
                </div>
              ))}

              {/* Totais */}
              <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                <div className="flex justify-between px-3 py-2 font-bold text-slate-900 bg-blue-50 rounded-xl">
                  <span>EBITDA / Lucro Líquido</span>
                  <span className={dre.lucro >= 0 ? 'text-emerald-700' : 'text-red-700'}>{fmt(dre.lucro)}</span>
                </div>
                <div className="flex justify-between px-3 py-1.5 text-sm text-gray-500">
                  <span>Margem líquida</span>
                  <span className={`font-bold ${dre.margemLucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{pct(dre.margemLucro)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Gráficos */}
          <div className="space-y-6">
            {chartReceitas.length > 0 && (
              <SectionCard title="Receitas por categoria">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartReceitas} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="value" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}
            {chartDespesas.length > 0 && (
              <SectionCard title="Despesas por categoria">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDespesas} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="value" name="Despesa" fill="#fb7185" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
