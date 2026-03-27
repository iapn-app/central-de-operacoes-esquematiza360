import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Building2, Car, CheckCircle2, Clock3,
  FileText, Shield, Users, Settings, X, Eye, EyeOff, DollarSign,
  TrendingUp, Wallet, BarChart3, ChevronRight, TrendingDown,
  ArrowUpRight, ArrowDownRight, Layers, Bell, Zap, AlertCircle,
  Users2, Receipt,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { supabase } from "../lib/supabase";

const EMPRESAS = [
  { id: "servicos",     nome: "Serviços de Monitoramento",   cnpj: "29.724.046/0001-35", cor: "#EC6625", inicial: "S" },
  { id: "vigilancia",   nome: "Vigilância e Segurança",      cnpj: "35.201.432/0001-45", cor: "#0f172a", inicial: "V" },
  { id: "patrimonial",  nome: "Patrimonial e Eventos",       cnpj: "47.116.185/0001-68", cor: "#7c3aed", inicial: "P" },
  { id: "prevencao",    nome: "Prevenção de Perdas",         cnpj: "52.605.214/0001-95", cor: "#0369a1", inicial: "P" },
  { id: "inteligencia", nome: "Inteligência e Treinamentos", cnpj: "59.283.344/0001-06", cor: "#047857", inicial: "I" },
];

const OP_KPIS = [
  { id: "postos",      title: "Postos Ativos",         icon: Building2,     color: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "vigilantes",  title: "Vigilantes em Escala",  icon: Users,         color: "bg-blue-50",    iconColor: "text-blue-600" },
  { id: "ocorrencias", title: "Ocorrências Hoje",      icon: AlertTriangle, color: "bg-amber-50",   iconColor: "text-amber-600" },
  { id: "frota",       title: "Frota Operacional",     icon: Car,           color: "bg-violet-50",  iconColor: "text-violet-600" },
  { id: "cobertura",   title: "Cobertura Operacional", icon: Shield,        color: "bg-teal-50",    iconColor: "text-teal-600" },
  { id: "resposta",    title: "Tempo Médio Resposta",  icon: Clock3,        color: "bg-sky-50",     iconColor: "text-sky-600" },
  { id: "alertas",     title: "Alertas Críticos",      icon: AlertTriangle, color: "bg-red-50",     iconColor: "text-red-600" },
  { id: "relatorios",  title: "Relatórios Emitidos",   icon: FileText,      color: "bg-indigo-50",  iconColor: "text-indigo-600" },
];

const FIN_KPIS = [
  { id: "saldo",         title: "Saldo Total",         icon: Wallet,         color: "bg-blue-50",    iconColor: "text-blue-600" },
  { id: "faturamento",   title: "Faturamento Mensal",  icon: TrendingUp,     color: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "custo",         title: "Custo Operacional",   icon: DollarSign,     color: "bg-rose-50",    iconColor: "text-rose-600" },
  { id: "lucro",         title: "Lucro Estimado",      icon: BarChart3,      color: "bg-purple-50",  iconColor: "text-purple-600" },
  { id: "receber",       title: "A Receber (Mês)",     icon: ArrowUpRight,   color: "bg-teal-50",    iconColor: "text-teal-600" },
  { id: "atraso",        title: "Em Atraso",           icon: AlertTriangle,  color: "bg-amber-50",   iconColor: "text-amber-600" },
  { id: "pagar",         title: "A Pagar (Mês)",       icon: ArrowDownRight, color: "bg-orange-50",  iconColor: "text-orange-600" },
  { id: "inadimplencia", title: "Inadimplência",       icon: TrendingDown,   color: "bg-red-50",     iconColor: "text-red-600" },
];

const DEFAULT_OP  = OP_KPIS.map(k => k.id);
const DEFAULT_FIN = FIN_KPIS.map(k => k.id);
const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MESES_EVOLUCAO = [
  { mes: "Out", faturamento: 0, custo: 0, lucro: 0 },
  { mes: "Nov", faturamento: 0, custo: 0, lucro: 0 },
  { mes: "Dez", faturamento: 0, custo: 0, lucro: 0 },
  { mes: "Jan", faturamento: 0, custo: 0, lucro: 0 },
  { mes: "Fev", faturamento: 0, custo: 0, lucro: 0 },
  { mes: "Mar", faturamento: 0, custo: 0, lucro: 0 },
];

interface Alerta { id: string; tipo: "critico" | "atencao" | "info"; titulo: string; descricao: string; }
interface ContratoRent { id: string; cliente: string; empresa: string; profissionais: number; faturamento: number; custo_mo: number; custo_uniforme: number; custo_transporte: number; custo_admin: number; }

function calcMargem(c: ContratoRent) {
  const custo = c.custo_mo + c.custo_uniforme + c.custo_transporte + c.custo_admin;
  const lucro = c.faturamento - custo;
  return { custo, lucro, margem: c.faturamento > 0 ? (lucro / c.faturamento) * 100 : 0 };
}

// ─── Alertas ────────────────────────────────────────────────────────────────

function BannerAlertas({ alertas, onDismiss }: { alertas: Alerta[]; onDismiss: (id: string) => void }) {
  if (alertas.length === 0) return null;
  return (
    <div className="space-y-2">
      {alertas.map(a => {
        const cfg = {
          critico: { bg: "bg-red-50",   border: "border-red-200",   icon: AlertCircle,   cor: "text-red-600",   tag: "bg-red-100 text-red-700",   label: "CRÍTICO" },
          atencao: { bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, cor: "text-amber-600", tag: "bg-amber-100 text-amber-700", label: "ATENÇÃO" },
          info:    { bg: "bg-blue-50",  border: "border-blue-200",  icon: Bell,          cor: "text-blue-600",  tag: "bg-blue-100 text-blue-700",   label: "INFO" },
        }[a.tipo];
        const Icon = cfg.icon;
        return (
          <div key={a.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
            <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.cor}`} />
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${cfg.tag}`}>{cfg.label}</span>
              <span className="text-sm font-semibold text-slate-800">{a.titulo}</span>
              <span className="text-xs text-slate-500 ml-2">{a.descricao}</span>
            </div>
            <button onClick={() => onDismiss(a.id)} style={{ cursor: "pointer" }}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/10 text-slate-400 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Componentes base ────────────────────────────────────────────────────────

function KpiCard({ title, icon: Icon, color, iconColor, value = "—", subtitle = "Aguardando dados" }: {
  title: string; icon: React.ElementType; color: string; iconColor: string; value?: string; subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${color}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 leading-tight">{value}</h3>
        <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, value, status = "neutral" }: { label: string; value: string; status?: "ok" | "alert" | "neutral"; }) {
  const cls = status === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "alert" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${cls}`}>{value}</span>
    </div>
  );
}

function MargemBarra({ margem }: { margem: number }) {
  const cor = margem >= 25 ? "#10b981" : margem >= 15 ? "#f59e0b" : margem >= 0 ? "#f97316" : "#ef4444";
  const tc  = margem >= 25 ? "text-emerald-700" : margem >= 15 ? "text-amber-700" : margem >= 0 ? "text-orange-700" : "text-red-700";
  const bg  = margem >= 25 ? "bg-emerald-50"    : margem >= 15 ? "bg-amber-50"    : margem >= 0 ? "bg-orange-50"    : "bg-red-50";
  const lbl = margem >= 25 ? "Alta" : margem >= 15 ? "Média" : margem >= 0 ? "Baixa" : "Prejuízo";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, margem))}%`, background: cor }} />
      </div>
      <span className={`text-xs font-bold ${tc}`}>{margem.toFixed(1)}%</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${bg} ${tc}`}>{lbl}</span>
    </div>
  );
}

function KpiCustomizerPanel({ kpis, visible, onToggle, onClose, title }: {
  kpis: typeof OP_KPIS; visible: string[]; onToggle: (id: string) => void; onClose: () => void; title: string;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Personalizar — {title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ative ou desative os KPIs</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {kpis.map(kpi => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button key={kpi.id} onClick={() => onToggle(kpi.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition text-left ${active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${active ? kpi.color : "bg-slate-200"}`}>
                  <Icon className={`w-4 h-4 ${active ? kpi.iconColor : "text-slate-400"}`} />
                </div>
                <p className={`text-sm font-medium flex-1 truncate ${active ? "text-slate-800" : "text-slate-400"}`}>{kpi.title}</p>
                {active ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">{visible.length} de {kpis.length} KPIs visíveis</p>
        </div>
      </div>
    </>
  );
}

// ─── Aba Operações ───────────────────────────────────────────────────────────

function TabOperacoes() {
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try { const s = localStorage.getItem("dashboard_op_kpis"); return s ? JSON.parse(s) : DEFAULT_OP; } catch { return DEFAULT_OP; }
  });
  const [showCustomizer, setShowCustomizer] = useState(false);
  function toggleKpi(id: string) {
    setVisibleKpis(prev => { const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]; localStorage.setItem("dashboard_op_kpis", JSON.stringify(next)); return next; });
  }
  const visibleCards = OP_KPIS.filter(k => visibleKpis.includes(k.id));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Monitoramento operacional em tempo real.</p>
        <button onClick={() => setShowCustomizer(true)} style={{ cursor: "pointer" }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>
      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{visibleCards.map(k => <KpiCard key={k.id} {...k} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Settings className="w-7 h-7 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">Nenhum KPI selecionado.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-base font-bold text-slate-900">Resumo Operacional</h2><p className="text-xs text-slate-400 mt-0.5">Indicadores principais da central</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"><Activity className="h-4 w-4 text-slate-600" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Cobertura Operacional",   icon: Shield,        color: "bg-emerald-50", iconColor: "text-emerald-600" },
              { label: "Tempo Médio de Resposta",  icon: Clock3,        color: "bg-blue-50",    iconColor: "text-blue-600" },
              { label: "Alertas Críticos",         icon: AlertTriangle, color: "bg-amber-50",   iconColor: "text-amber-600" },
              { label: "Relatórios Emitidos",      icon: FileText,      color: "bg-violet-50",  iconColor: "text-violet-600" },
            ].map(({ label, icon: Icon, color, iconColor }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className={`h-5 w-5 ${iconColor}`} /></div>
                <div><p className="text-xs font-medium text-slate-500">{label}</p><h3 className="text-xl font-black text-slate-900">—</h3></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-base font-bold text-slate-900">Status da Operação</h2><p className="text-xs text-slate-400 mt-0.5">Panorama rápido da central</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"><CheckCircle2 className="h-4 w-4 text-slate-600" /></div>
          </div>
          <div className="space-y-2">
            {["Centro de Operações", "Rondas Programadas", "Escalas do Dia", "Ocorrências Pendentes", "Frota", "Compliance"].map(label => (
              <StatusItem key={label} label={label} value="—" />
            ))}
          </div>
        </div>
      </div>
      {showCustomizer && <KpiCustomizerPanel kpis={OP_KPIS} visible={visibleKpis} onToggle={toggleKpi} onClose={() => setShowCustomizer(false)} title="Operações" />}
    </div>
  );
}

// ─── Aba Financeiro ──────────────────────────────────────────────────────────

function TabFinanceiro() {
  const navigate = useNavigate();
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try { const s = localStorage.getItem("dashboard_fin_kpis"); return s ? JSON.parse(s) : DEFAULT_FIN; } catch { return DEFAULT_FIN; }
  });
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [contratos, setContratos] = useState<ContratoRent[]>([]);
  const [folha, setFolha] = useState<{ vigilantes: number; liquido: number; custo: number; faltas: number; he: number } | null>(null);
  const [loadingRent, setLoadingRent] = useState(true);
  const [grafTab, setGrafTab] = useState<"evolucao" | "margem">("evolucao");

  useEffect(() => {
    supabase.from("contratos_rentabilidade").select("*").eq("ativo", true).order("faturamento", { ascending: false }).limit(8)
      .then(({ data }) => { setContratos(data ?? []); setLoadingRent(false); }).catch(() => setLoadingRent(false));

    supabase.from("folha_pagamento").select("*").eq("status", "ativo").then(({ data }) => {
      if (data && data.length > 0) {
        const r = data.reduce((acc, v) => {
          const base = v.salario_base || 0; const vhora = base / 220;
          const prov = base + (v.horas_extras_50||0)*vhora*1.5 + (v.horas_extras_100||0)*vhora*2 + (v.insalubre ? base*0.2 : 0);
          const liq  = prov - prov*0.09 - (base/30)*(v.faltas||0);
          const custo = liq + base*0.08 + base*0.20;
          return { vigilantes: acc.vigilantes+1, liquido: acc.liquido+liq, custo: acc.custo+custo, faltas: acc.faltas+(v.faltas>0?1:0), he: acc.he+(v.horas_extras_50>0||v.horas_extras_100>0?1:0) };
        }, { vigilantes: 0, liquido: 0, custo: 0, faltas: 0, he: 0 });
        setFolha(r);
      }
    }).catch(() => {});
  }, []);

  function toggleKpi(id: string) {
    setVisibleKpis(prev => { const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]; localStorage.setItem("dashboard_fin_kpis", JSON.stringify(next)); return next; });
  }

  const visibleCards = FIN_KPIS.filter(k => visibleKpis.includes(k.id));
  const totalFat   = contratos.reduce((s, c) => s + c.faturamento, 0);
  const totalLucro = contratos.reduce((s, c) => s + calcMargem(c).lucro, 0);
  const margemMedia = totalFat > 0 ? (totalLucro / totalFat) * 100 : 0;
  const emPrejuizo  = contratos.filter(c => calcMargem(c).margem < 0).length;
  const margemBaixa = contratos.filter(c => { const m = calcMargem(c).margem; return m >= 0 && m < 15; }).length;

  const dadosMargem = contratos.map(c => ({
    nome: c.cliente.split(" ").slice(0, 2).join(" "),
    margem: parseFloat(calcMargem(c).margem.toFixed(1)),
  })).sort((a, b) => b.margem - a.margem);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Visão executiva financeira do Grupo Esquematiza.</p>
        <button onClick={() => setShowCustomizer(true)} style={{ cursor: "pointer" }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>

      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{visibleCards.map(k => <KpiCard key={k.id} {...k} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Settings className="w-7 h-7 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">Nenhum KPI selecionado.</p>
        </div>
      )}

      {/* Folha de pagamento */}
      {folha && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><Users2 className="w-4 h-4 text-slate-500" /><p className="text-sm font-bold text-slate-800">Folha de Pagamento — Mês Atual</p></div>
            <button onClick={() => navigate("/folha-pagamento")} style={{ cursor: "pointer" }} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">Ver folha <ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Vigilantes", value: String(folha.vigilantes), icon: Users,     cor: "bg-blue-50 text-blue-600",    sub: `${folha.faltas} com falta` },
              { label: "Líquido",    value: fmt(folha.liquido),       icon: Receipt,   cor: "bg-purple-50 text-purple-600", sub: "a depositar" },
              { label: "Custo Total",value: fmt(folha.custo),         icon: DollarSign,cor: "bg-orange-50 text-orange-600", sub: "com encargos" },
              { label: "Com HE",     value: String(folha.he),         icon: Clock3,    cor: "bg-amber-50 text-amber-600",   sub: "horas extras" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${item.cor}`}><Icon className="w-4 h-4" /></div>
                  <div><p className="text-xs text-slate-400">{item.label}</p><p className="text-lg font-black text-slate-900">{item.value}</p><p className="text-[10px] text-slate-400">{item.sub}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="text-base font-bold text-slate-900">Evolução Mensal</h2><p className="text-xs text-slate-400 mt-0.5">Últimos 6 meses</p></div>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(["evolucao", "margem"] as const).map(t => (
                <button key={t} onClick={() => setGrafTab(t)} style={{ cursor: "pointer" }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${grafTab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>
                  {t === "evolucao" ? "Financeiro" : "Margem"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {grafTab === "evolucao" ? (
                <AreaChart data={MESES_EVOLUCAO}>
                  <defs>
                    <linearGradient id="gFat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gCusto" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [fmt(Number(v))]} />
                  <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#10b981" strokeWidth={2} fill="url(#gFat)" />
                  <Area type="monotone" dataKey="custo" name="Custo" stroke="#f43f5e" strokeWidth={2} fill="url(#gCusto)" />
                </AreaChart>
              ) : (
                <BarChart data={dadosMargem} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: "#6b7280" }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Margem"]} />
                  <Bar dataKey="margem" radius={[0, 4, 4, 0]}>
                    {dadosMargem.map((e, i) => <Cell key={i} fill={e.margem >= 25 ? "#10b981" : e.margem >= 15 ? "#f59e0b" : e.margem >= 0 ? "#f97316" : "#ef4444"} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          {grafTab === "evolucao" && MESES_EVOLUCAO.every(m => m.faturamento === 0) && (
            <p className="text-center text-xs text-slate-400 mt-2">Aguardando dados reais para exibir o gráfico.</p>
          )}
          {grafTab === "margem" && dadosMargem.length === 0 && (
            <p className="text-center text-xs text-slate-400 mt-2">Cadastre contratos para ver o ranking de margem.</p>
          )}
        </div>

        {/* Margem por contrato */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div><h2 className="text-sm font-bold text-slate-900">Margem por Contrato</h2><p className="text-xs text-slate-400">Rentabilidade dos principais contratos</p></div>
            <div className="flex items-center gap-2">
              {emPrejuizo > 0 && <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">{emPrejuizo} prejuízo</span>}
              {margemBaixa > 0 && <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">{margemBaixa} baixa</span>}
              {contratos.length > 0 && <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">média {margemMedia.toFixed(1)}%</span>}
              <button onClick={() => navigate("/financeiro/rentabilidade")} style={{ cursor: "pointer" }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition">
                Ver tudo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          {loadingRent ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : contratos.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Nenhum dado ainda</p>
              <p className="text-xs text-slate-400 mt-1">Cadastre contratos em <strong>Contratos</strong></p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contratos.map(c => {
                const { lucro, margem } = calcMargem(c);
                return (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.cliente}</p>
                      <p className="text-xs text-slate-400">{c.empresa} · {c.profissionais}p</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400">Lucro</p>
                        <p className={`text-sm font-bold ${lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(lucro)}</p>
                      </div>
                      <MargemBarra margem={margem} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Visão por empresa */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-slate-900">Visão por Empresa</h2><p className="text-xs text-slate-400 mt-0.5">Consolidado do Grupo Esquematiza</p></div>
          <div className="space-y-2">
            {EMPRESAS.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: e.cor }}>{e.inicial}</div>
                  <span className="text-sm font-medium text-slate-700">ESQMT {e.nome}</span>
                </div>
                <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Aguardando dados</span><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-slate-900">Status Financeiro</h2><p className="text-xs text-slate-400 mt-0.5">Indicadores do mês</p></div>
          <div className="space-y-2">
            <StatusItem label="Faturamento"        value="—" />
            <StatusItem label="Inadimplência"      value="—" />
            <StatusItem label="Contas a Pagar"     value="—" />
            <StatusItem label="Saldo Consolidado"  value="—" />
            <StatusItem label="Margem do Mês"      value={contratos.length > 0 ? `${margemMedia.toFixed(1)}%` : "—"} status={margemMedia >= 20 ? "ok" : margemMedia > 0 ? "alert" : "neutral"} />
            <StatusItem label="Folha de Pagamento" value={folha ? fmt(folha.custo) : "—"} status={folha ? "ok" : "neutral"} />
          </div>
        </div>
      </div>

      {showCustomizer && <KpiCustomizerPanel kpis={FIN_KPIS} visible={visibleKpis} onToggle={toggleKpi} onClose={() => setShowCustomizer(false)} title="Financeiro" />}
    </div>
  );
}

// ─── Aba Grupo ───────────────────────────────────────────────────────────────

function TabGrupo() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);
  const empresa = EMPRESAS.find(e => e.id === empresaSelecionada);
  const METRICAS = [
    { label: "Faturamento Total",    icon: TrendingUp,    cor: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Custo Total",          icon: TrendingDown,  cor: "text-rose-600",    bg: "bg-rose-50" },
    { label: "Lucro Consolidado",    icon: BarChart3,     cor: "text-purple-600",  bg: "bg-purple-50" },
    { label: "Saldo em Caixa",       icon: Wallet,        cor: "text-blue-600",    bg: "bg-blue-50" },
    { label: "A Receber",            icon: ArrowUpRight,  cor: "text-teal-600",    bg: "bg-teal-50" },
    { label: "Inadimplência Grupo",  icon: AlertTriangle, cor: "text-amber-600",   bg: "bg-amber-50" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Visão consolidada das 5 empresas do Grupo Esquematiza.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200"><Layers className="w-3.5 h-3.5 text-emerald-600" /><span className="text-xs font-semibold text-emerald-700">5 CNPJs ativos</span></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {METRICAS.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm flex flex-col gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg}`}><Icon className={`h-4 w-4 ${m.cor}`} /></div>
              <div><p className="text-xs font-medium text-slate-400 leading-tight">{m.label}</p><h3 className="text-xl font-black text-slate-900">—</h3></div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {EMPRESAS.map(e => (
          <button key={e.id} onClick={() => setEmpresaSelecionada(empresaSelecionada === e.id ? null : e.id)}
            style={{ cursor: "pointer", ...(empresaSelecionada === e.id ? { borderColor: e.cor, background: e.cor + "08" } : {}) }}
            className={`rounded-2xl border p-5 text-left transition-all shadow-sm ${empresaSelecionada === e.id ? "border-2 shadow-md" : "border-slate-200 bg-white hover:shadow-md"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: e.cor }}>{e.inicial}</div>
                <div><p className="text-sm font-bold text-slate-900">ESQMT {e.nome}</p><p className="text-xs text-slate-400">{e.cnpj}</p></div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 mt-1 ${empresaSelecionada === e.id ? "rotate-90" : ""}`} style={{ color: e.cor }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Faturamento", "Margem", "A Receber", "Em Atraso"].map(item => (
                <div key={item} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2"><p className="text-xs text-slate-400">{item}</p><p className="text-sm font-bold text-slate-800">—</p></div>
              ))}
            </div>
          </button>
        ))}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center"><Layers className="w-5 h-5 text-slate-500" /></div>
          <div><p className="text-sm font-bold text-slate-700">Consolidado Grupo</p><p className="text-xs text-slate-400 mt-1">Soma de todas as 5 empresas</p></div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {["Faturamento", "Lucro", "A Receber", "Saldo Caixa"].map(label => (
              <div key={label} className="rounded-lg bg-white border border-slate-200 px-3 py-2"><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-bold text-slate-800">—</p></div>
            ))}
          </div>
        </div>
      </div>
      {empresa && (
        <div className="rounded-2xl border-2 p-6 space-y-4" style={{ borderColor: empresa.cor, background: empresa.cor + "06" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: empresa.cor }}>{empresa.inicial}</div>
            <div><h2 className="text-base font-bold text-slate-900">ESQMT {empresa.nome}</h2><p className="text-xs text-slate-500">CNPJ: {empresa.cnpj}</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Faturamento Mensal", "Custo Operacional", "Lucro do Mês", "Saldo em Conta", "Postos Ativos", "Profissionais", "Contratos Ativos", "Inadimplência"].map(item => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{item}</p><p className="text-lg font-bold text-slate-900 mt-1">—</p></div>
            ))}
          </div>
          <div className="rounded-xl border border-dashed px-4 py-3 text-center" style={{ borderColor: empresa.cor + "50" }}>
            <p className="text-sm font-semibold" style={{ color: empresa.cor }}>🚀 Conecte os dados reais desta empresa para ativar todos os indicadores.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard principal ─────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"operacoes" | "financeiro" | "grupo">("operacoes");
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const tabs = [
    { id: "operacoes",  label: "Operações",  icon: Shield },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
    { id: "grupo",      label: "Grupo",      icon: Layers },
  ] as const;

  useEffect(() => {
    Promise.all([
      supabase.from("contratos_rentabilidade").select("cliente, faturamento, custo_mo, custo_uniforme, custo_transporte, custo_admin").eq("ativo", true),
      supabase.from("folha_pagamento").select("nome, faltas").eq("status", "ativo"),
    ]).then(([{ data: contratos }, { data: folha }]) => {
      const lista: Alerta[] = [];
      const prejuizo = (contratos ?? []).filter(c => c.faturamento - (c.custo_mo+c.custo_uniforme+c.custo_transporte+c.custo_admin) < 0);
      const mBaixa   = (contratos ?? []).filter(c => { const custo = c.custo_mo+c.custo_uniforme+c.custo_transporte+c.custo_admin; const m = c.faturamento > 0 ? ((c.faturamento-custo)/c.faturamento)*100 : 0; return m >= 0 && m < 15; });
      const comFalta = (folha ?? []).filter(v => v.faltas > 0);
      if (prejuizo.length > 0) lista.push({ id: "prejuizo", tipo: "critico", titulo: `${prejuizo.length} contrato(s) em prejuízo`, descricao: prejuizo.map(c => c.cliente).slice(0,2).join(", ") });
      if (mBaixa.length > 0)   lista.push({ id: "margem",   tipo: "atencao", titulo: `${mBaixa.length} contrato(s) com margem abaixo de 15%`, descricao: "Revise custos ou renegocie." });
      if (comFalta.length > 0) lista.push({ id: "faltas",   tipo: "atencao", titulo: `${comFalta.length} vigilante(s) com falta este mês`, descricao: comFalta.map(v => v.nome).slice(0,2).join(", ") });
      if ((contratos ?? []).length === 0) lista.push({ id: "onboarding", tipo: "info", titulo: "Sistema pronto!", descricao: "Cadastre contratos e vigilantes para ativar todos os indicadores." });
      setAlertas(lista);
    }).catch(() => {});
  }, []);

  const { profile } = useAuth();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const primeiroNome = profile?.nome ? profile.nome.split(" ")[0] : "Grupo Esquematiza";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Central Operacional
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{saudacao}, {primeiroNome}! 👋</h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {alertas.filter(a => a.tipo === "critico").length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
              <Bell className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-700">{alertas.filter(a => a.tipo === "critico").length} crítico(s)</span>
            </div>
          )}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && <BannerAlertas alertas={alertas} onDismiss={id => setAlertas(prev => prev.filter(a => a.id !== id))} />}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl w-fit shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ cursor: "pointer" }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "operacoes"  && <TabOperacoes />}
        {activeTab === "financeiro" && <TabFinanceiro />}
        {activeTab === "grupo"      && <TabGrupo />}

      </div>
    </div>
  );
}
