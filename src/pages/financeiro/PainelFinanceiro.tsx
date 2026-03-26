import React, { useState } from 'react';
import {
  Shield, TrendingUp, DollarSign, Wallet, AlertTriangle,
  BarChart3, Building2, Zap, Calendar, Settings, X, Eye, EyeOff,
  Landmark, CreditCard, Layers, ChevronDown, ChevronUp,
  TrendingDown, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  KpiCard, ActionButton, SectionCard, PageHeader,
} from './components/FinanceComponents';

// ─── Empresas do grupo ─────────────────────────────────────────────────────

const EMPRESAS = [
  { id: "servicos",     nome: "Serviços de Monitoramento",   cnpj: "29.724.046/0001-35", cor: "#EC6625", inicial: "S",
    contas: ["Itaú Ag.7157 — 0099842-3", "Bradesco Ag.1804 — 0007997-9"] },
  { id: "vigilancia",   nome: "Vigilância e Segurança",      cnpj: "35.201.432/0001-45", cor: "#0f172a", inicial: "V",
    contas: ["Itaú Ag.7157 — 0099812-6", "Itaú Ag.7157 — 0029170-4", "Bradesco Ag.1804 — 0084935-9", "Inter Ag.0001-9 — 4596447-5"] },
  { id: "patrimonial",  nome: "Patrimonial e Eventos",       cnpj: "47.116.185/0001-68", cor: "#7c3aed", inicial: "P",
    contas: ["Itaú Ag.7157 — 0099813-4"] },
  { id: "prevencao",    nome: "Prevenção de Perdas",         cnpj: "52.605.214/0001-95", cor: "#0369a1", inicial: "P",
    contas: ["Itaú Ag.309 — 0099120-6", "Bradesco Ag.1804 — 0103834-6"] },
  { id: "inteligencia", nome: "Inteligência e Treinamentos", cnpj: "59.283.344/0001-06", cor: "#047857", inicial: "I",
    contas: ["Itaú Ag.309 — 0098959-8"] },
];

// ─── Contas bancárias reais ────────────────────────────────────────────────

const CONTAS_BANCARIAS = [
  { empresa: "Serviços",     razao: "ESQUEMATIZA SERVIÇOS DE MONITORAMENTO LTDA",   cnpj: "29.724.046/0001-35", agencia: "7157",   conta: "0099842-3",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Inteligência", razao: "ESQUEMATIZA INTELIGENCIA E TREINAMENTOS LTDA", cnpj: "59.283.344/0001-06", agencia: "309",    conta: "0098959-8",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Patrimonial",  razao: "ESQUEMATIZA PATRIMONIAL E EVENTOS LTDA",       cnpj: "47.116.185/0001-68", agencia: "7157",   conta: "0099813-4",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Prevenção",    razao: "ESQUEMATIZA PREVENCAO DE PERDAS",              cnpj: "52.605.214/0001-95", agencia: "309",    conta: "0099120-6",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Vigilância",   razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA",      cnpj: "35.201.432/0001-45", agencia: "7157",   conta: "0099812-6",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Vigilância",   razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA",      cnpj: "35.201.432/0001-45", agencia: "7157",   conta: "0029170-4",  banco: "Itaú",     cor: "#EC6625" },
  { empresa: "Vigilância",   razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA",      cnpj: "35.201.432/0001-45", agencia: "1804",   conta: "0084935-9",  banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Prevenção",    razao: "ESQUEMATIZA PREVENCAO DE PERDAS",              cnpj: "52.605.214/0001-95", agencia: "1804",   conta: "0103834-6",  banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Serviços",     razao: "ESQUEMATIZA SERVIÇOS DE MONITORAMENTO LTDA",   cnpj: "29.724.046/0001-35", agencia: "1804",   conta: "0007997-9",  banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Vigilância",   razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA",      cnpj: "35.201.432/0001-45", agencia: "0001-9", conta: "4596447-5",  banco: "Inter",    cor: "#FF7A00" },
];

// ─── KPIs ──────────────────────────────────────────────────────────────────

const ALL_FIN_KPIS = [
  { id: "saldo",       title: "Saldo Total",        icon: Wallet,        colorClass: "text-blue-500" },
  { id: "faturamento", title: "Faturamento Mensal", icon: TrendingUp,    colorClass: "text-emerald-500" },
  { id: "custo",       title: "Custo Operacional",  icon: DollarSign,    colorClass: "text-rose-500" },
  { id: "lucro",       title: "Lucro Estimado",     icon: BarChart3,     colorClass: "text-purple-500" },
  { id: "juros",       title: "Juros Evitados",     icon: Shield,        colorClass: "text-teal-500" },
  { id: "atraso",      title: "Em Atraso",          icon: AlertTriangle, colorClass: "text-amber-500" },
];

const DEFAULT_FIN_KPIS = ["saldo", "faturamento", "custo", "lucro", "juros", "atraso"];

const fluxoCaixaData = [
  { mes: 'Out', receita: 0, despesa: 0, lucro: 0 },
  { mes: 'Nov', receita: 0, despesa: 0, lucro: 0 },
  { mes: 'Dez', receita: 0, despesa: 0, lucro: 0 },
  { mes: 'Jan', receita: 0, despesa: 0, lucro: 0 },
  { mes: 'Fev', receita: 0, despesa: 0, lucro: 0 },
  { mes: 'Mar', receita: 0, despesa: 0, lucro: 0 },
];

// ─── Painel KPIs ──────────────────────────────────────────────────────────

function KpiCustomizerPanel({ visible, onToggle, onClose }: {
  visible: string[]; onToggle: (id: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div><h2 className="text-base font-bold text-slate-900">Personalizar KPIs</h2><p className="text-xs text-slate-500 mt-0.5">Escolha quais indicadores exibir</p></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {ALL_FIN_KPIS.map((kpi) => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button key={kpi.id} onClick={() => onToggle(kpi.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${active ? "bg-emerald-100" : "bg-slate-200"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-500"}`} />
                </div>
                <p className={`text-sm font-semibold flex-1 truncate ${active ? "text-slate-900" : "text-slate-500"}`}>{kpi.title}</p>
                {active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">{visible.length} de {ALL_FIN_KPIS.length} KPIs visíveis</p>
        </div>
      </div>
    </>
  );
}

// ─── Card conta bancária ───────────────────────────────────────────────────

function ContaBancariaCard({ conta }: { conta: typeof CONTAS_BANCARIAS[0] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: conta.cor + "18" }}>
        <Landmark className="w-5 h-5" style={{ color: conta.cor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: conta.cor }}>{conta.banco}</span>
          <span className="text-xs font-semibold text-slate-500">{conta.empresa}</span>
        </div>
        <p className="text-xs font-medium text-slate-700 truncate">{conta.razao}</p>
        <p className="text-xs text-slate-400 mt-1">CNPJ: {conta.cnpj}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-slate-500">Ag: <strong className="text-slate-700">{conta.agencia}</strong></span>
          <span className="text-xs text-slate-500">Conta: <strong className="text-slate-700">{conta.conta}</strong></span>
        </div>
      </div>
    </div>
  );
}

// ─── Seção Multi-empresa ───────────────────────────────────────────────────

function SecaoMultiEmpresa() {
  const [expandida, setExpandida] = useState<string | null>(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");

  const contasFiltradas = filtroEmpresa === "todas"
    ? CONTAS_BANCARIAS
    : CONTAS_BANCARIAS.filter(c => c.empresa.toLowerCase() === filtroEmpresa.toLowerCase());

  return (
    <SectionCard
      title="Visão por Empresa — Grupo Esquematiza"
      action={
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">5 CNPJs • 10 contas bancárias</span>
        </div>
      }
    >
      {/* KPIs consolidados topo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 pb-5 border-b border-slate-100">
        {[
          { label: "Faturamento Consolidado", icon: TrendingUp,   cor: "text-emerald-600", bg: "bg-emerald-50", value: "—" },
          { label: "Custo Consolidado",        icon: TrendingDown, cor: "text-rose-600",    bg: "bg-rose-50",    value: "—" },
          { label: "Lucro Grupo",              icon: BarChart3,    cor: "text-purple-600",  bg: "bg-purple-50",  value: "—" },
          { label: "Saldo Total (10 contas)",  icon: Wallet,       cor: "text-blue-600",    bg: "bg-blue-50",    value: "—" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${item.bg}`}>
                <Icon className={`w-4 h-4 ${item.cor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion por empresa */}
      <div className="space-y-2 mb-5">
        {EMPRESAS.map(e => (
          <div key={e.id} className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandida(expandida === e.id ? null : e.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: e.cor }}>
                  {e.inicial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ESQMT {e.nome}</p>
                  <p className="text-xs text-slate-400">{e.cnpj} • {e.contas.length} conta{e.contas.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="hidden md:grid grid-cols-3 gap-6 text-right">
                  {["Faturamento", "Margem", "Saldo"].map(label => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-800">—</p>
                    </div>
                  ))}
                </div>
                {expandida === e.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </div>
            </button>

            {expandida === e.id && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Faturamento Mensal", "Custo Operacional",
                    "Lucro do Mês", "Saldo em Conta",
                    "Contratos Ativos", "A Receber",
                    "Contas a Pagar", "Inadimplência"
                  ].map(label => (
                    <div key={label} className="rounded-lg bg-white border border-slate-200 px-3 py-2.5">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">—</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Contas bancárias desta empresa:</p>
                  <div className="flex flex-wrap gap-2">
                    {e.contas.map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600">
                        <Landmark className="w-3 h-3 text-slate-400" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-dashed px-4 py-3 text-center" style={{ borderColor: e.cor + "50" }}>
                  <p className="text-xs font-semibold" style={{ color: e.cor }}>
                    🚀 Conecte os dados reais para ativar os indicadores desta empresa.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filtro + contas bancárias por empresa */}
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Contas bancárias por empresa</p>
          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todas as empresas</option>
            {["Serviços", "Vigilância", "Patrimonial", "Prevenção", "Inteligência"].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {contasFiltradas.map((conta, i) => (
            <ContaBancariaCard key={i} conta={conta} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function PainelFinanceiro() {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try { const saved = localStorage.getItem("financeiro_kpis"); return saved ? JSON.parse(saved) : DEFAULT_FIN_KPIS; }
    catch { return DEFAULT_FIN_KPIS; }
  });

  function toggleKpi(id: string) {
    setVisibleKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem("financeiro_kpis", JSON.stringify(next));
      return next;
    });
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const allKpiCards = [
    { id: "saldo",       title: "Saldo Total",        value: fmt(0), subtitle: "Aguardando dados reais", icon: Wallet,        colorClass: "text-blue-500" },
    { id: "faturamento", title: "Faturamento Mensal", value: fmt(0), subtitle: "Aguardando dados reais", icon: TrendingUp,    colorClass: "text-emerald-500" },
    { id: "custo",       title: "Custo Operacional",  value: fmt(0), subtitle: "Aguardando dados reais", icon: DollarSign,    colorClass: "text-rose-500" },
    { id: "lucro",       title: "Lucro Estimado",     value: fmt(0), subtitle: "Aguardando dados reais", icon: BarChart3,     colorClass: "text-purple-500" },
    { id: "juros",       title: "Juros Evitados",     value: fmt(0), subtitle: "Aguardando dados reais", icon: Shield,        colorClass: "text-teal-500" },
    { id: "atraso",      title: "Em Atraso",          value: fmt(0), subtitle: "Aguardando dados reais", icon: AlertTriangle, colorClass: "text-amber-500" },
  ];

  const visibleCards = allKpiCards.filter(k => visibleKpis.includes(k.id));

  return (
    <div className="space-y-8">

      <PageHeader
        title="Gestão Financeira e Contábil"
        subtitle="Controle completo de receitas, custos operacionais e obrigações — Grupo Esquematiza (5 empresas)."
        actions={
          <>
            <ActionButton variant="secondary"><Calendar className="w-4 h-4" />Março 2026</ActionButton>
            <button onClick={() => setShowCustomizer(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
              <Settings className="w-4 h-4" /> Personalizar KPIs
            </button>
            <ActionButton>+ Novo Lançamento</ActionButton>
          </>
        }
      />

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-emerald-500 rounded-xl shrink-0"><Building2 className="w-6 h-6 text-white" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-emerald-800 text-sm">Integração Bancária via Open Finance / API</p>
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">NOVO</span>
          </div>
          <p className="text-emerald-700 text-xs font-medium">Conecte seu banco para importar extratos automaticamente e conciliar em tempo real.</p>
        </div>
        <ActionButton className="shrink-0 whitespace-nowrap"><Zap className="w-4 h-4" /> Conectar banco</ActionButton>
      </div>

      {/* KPI Cards */}
      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {visibleCards.map((card, i) => <KpiCard key={i} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} colorClass={card.colorClass} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum KPI selecionado.</p>
          <button onClick={() => setShowCustomizer(true)} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Personalizar</button>
        </div>
      )}

      {/* Multi-empresa */}
      <SecaoMultiEmpresa />

      {/* DRE */}
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
              <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="despesa" name="Custo"   fill="#fb7185" radius={[4,4,0,0]} />
              <Bar dataKey="lucro"   name="Lucro"   fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">Aguardando dados reais para exibir o gráfico.</p>
      </SectionCard>

      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-emerald-700 font-semibold text-sm">
          🚀 Sistema pronto para implantação. Conecte os dados reais para ativar todos os indicadores financeiros.
        </p>
      </div>

      {showCustomizer && <KpiCustomizerPanel visible={visibleKpis} onToggle={toggleKpi} onClose={() => setShowCustomizer(false)} />}
    </div>
  );
}
