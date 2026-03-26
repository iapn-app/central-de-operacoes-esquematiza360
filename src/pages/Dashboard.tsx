import { useState } from "react";
import {
  Activity, AlertTriangle, Building2, Car, CheckCircle2,
  Clock3, FileText, Shield, Users, Settings, X, Eye, EyeOff,
  DollarSign, TrendingUp, Wallet, BarChart3, ChevronRight,
  TrendingDown, ArrowUpRight, ArrowDownRight, Layers,
} from "lucide-react";

// ─── Empresas do grupo ─────────────────────────────────────────────────────

const EMPRESAS = [
  { id: "servicos",      nome: "Serviços de Monitoramento",   cnpj: "29.724.046/0001-35", cor: "#EC6625", inicial: "S" },
  { id: "vigilancia",    nome: "Vigilância e Segurança",      cnpj: "35.201.432/0001-45", cor: "#0f172a", inicial: "V" },
  { id: "patrimonial",   nome: "Patrimonial e Eventos",       cnpj: "47.116.185/0001-68", cor: "#7c3aed", inicial: "P" },
  { id: "prevencao",     nome: "Prevenção de Perdas",         cnpj: "52.605.214/0001-95", cor: "#0369a1", inicial: "P" },
  { id: "inteligencia",  nome: "Inteligência e Treinamentos", cnpj: "59.283.344/0001-06", cor: "#047857", inicial: "I" },
];

// ─── KPIs Operacionais ─────────────────────────────────────────────────────

const OP_KPIS = [
  { id: "postos",      title: "Postos Ativos",         icon: Building2,    color: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "vigilantes",  title: "Vigilantes em Escala",  icon: Users,        color: "bg-blue-50",    iconColor: "text-blue-600" },
  { id: "ocorrencias", title: "Ocorrências Hoje",      icon: AlertTriangle,color: "bg-amber-50",   iconColor: "text-amber-600" },
  { id: "frota",       title: "Frota Operacional",     icon: Car,          color: "bg-violet-50",  iconColor: "text-violet-600" },
  { id: "cobertura",   title: "Cobertura Operacional", icon: Shield,       color: "bg-teal-50",    iconColor: "text-teal-600" },
  { id: "resposta",    title: "Tempo Médio Resposta",  icon: Clock3,       color: "bg-sky-50",     iconColor: "text-sky-600" },
  { id: "alertas",     title: "Alertas Críticos",      icon: AlertTriangle,color: "bg-red-50",     iconColor: "text-red-600" },
  { id: "relatorios",  title: "Relatórios Emitidos",   icon: FileText,     color: "bg-indigo-50",  iconColor: "text-indigo-600" },
];

const FIN_KPIS = [
  { id: "saldo",         title: "Saldo Total",         icon: Wallet,        color: "bg-blue-50",    iconColor: "text-blue-600" },
  { id: "faturamento",   title: "Faturamento Mensal",  icon: TrendingUp,    color: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "custo",         title: "Custo Operacional",   icon: DollarSign,    color: "bg-rose-50",    iconColor: "text-rose-600" },
  { id: "lucro",         title: "Lucro Estimado",      icon: BarChart3,     color: "bg-purple-50",  iconColor: "text-purple-600" },
  { id: "receber",       title: "A Receber (Mês)",     icon: ArrowUpRight,  color: "bg-teal-50",    iconColor: "text-teal-600" },
  { id: "atraso",        title: "Em Atraso",           icon: AlertTriangle, color: "bg-amber-50",   iconColor: "text-amber-600" },
  { id: "pagar",         title: "A Pagar (Mês)",       icon: ArrowDownRight,color: "bg-orange-50",  iconColor: "text-orange-600" },
  { id: "inadimplencia", title: "Inadimplência",       icon: TrendingDown,  color: "bg-red-50",     iconColor: "text-red-600" },
];

const DEFAULT_OP  = OP_KPIS.map(k => k.id);
const DEFAULT_FIN = FIN_KPIS.map(k => k.id);

// ─── Componentes base ──────────────────────────────────────────────────────

function KpiCard({ title, icon: Icon, color, iconColor, value = "—", subtitle = "Aguardando dados" }: {
  title: string; icon: React.ElementType; color: string; iconColor: string;
  value?: string; subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
        <h3 className="text-xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, value, status = "neutral" }: {
  label: string; value: string; status?: "ok" | "alert" | "neutral";
}) {
  const cls = status === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "alert" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>
    </div>
  );
}

function KpiCustomizerPanel({ kpis, visible, onToggle, onClose, title }: {
  kpis: typeof OP_KPIS; visible: string[];
  onToggle: (id: string) => void; onClose: () => void; title: string;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Personalizar — {title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ative ou desative os KPIs</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {kpis.map((kpi) => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button key={kpi.id} onClick={() => onToggle(kpi.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition text-left ${
                  active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
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

// ─── Aba Operações ─────────────────────────────────────────────────────────

function TabOperacoes() {
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try { const s = localStorage.getItem("dashboard_op_kpis"); return s ? JSON.parse(s) : DEFAULT_OP; }
    catch { return DEFAULT_OP; }
  });
  const [showCustomizer, setShowCustomizer] = useState(false);

  function toggleKpi(id: string) {
    setVisibleKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem("dashboard_op_kpis", JSON.stringify(next));
      return next;
    });
  }

  const visibleCards = OP_KPIS.filter(k => visibleKpis.includes(k.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Monitoramento operacional em tempo real.</p>
        <button onClick={() => setShowCustomizer(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>

      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visibleCards.map(k => <KpiCard key={k.id} {...k} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Settings className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Nenhum KPI selecionado.</p>
          <button onClick={() => setShowCustomizer(true)} className="mt-2 text-sm text-emerald-600 font-semibold hover:underline">Personalizar</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-base font-bold text-slate-900">Resumo Operacional</h2><p className="text-xs text-slate-500">Indicadores principais da central</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"><Activity className="h-4 w-4 text-slate-700" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Cobertura Operacional",  icon: Shield,       color: "bg-emerald-50", iconColor: "text-emerald-600" },
              { label: "Tempo Médio de Resposta", icon: Clock3,       color: "bg-blue-50",    iconColor: "text-blue-600" },
              { label: "Alertas Críticos",        icon: AlertTriangle,color: "bg-amber-50",   iconColor: "text-amber-600" },
              { label: "Relatórios Emitidos",     icon: FileText,     color: "bg-violet-50",  iconColor: "text-violet-600" },
            ].map(({ label, icon: Icon, color, iconColor }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon className={`h-4 w-4 ${iconColor}`} /></div>
                <div><p className="text-xs font-medium text-slate-500">{label}</p><h3 className="text-xl font-bold text-slate-900">—</h3></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-base font-bold text-slate-900">Status da Operação</h2><p className="text-xs text-slate-500">Panorama rápido da central</p></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100"><CheckCircle2 className="h-4 w-4 text-slate-700" /></div>
          </div>
          <div className="space-y-2">
            <StatusItem label="Centro de Operações"   value="—" />
            <StatusItem label="Rondas Programadas"    value="—" />
            <StatusItem label="Escalas do Dia"        value="—" />
            <StatusItem label="Ocorrências Pendentes" value="—" />
            <StatusItem label="Frota"                 value="—" />
            <StatusItem label="Compliance"            value="—" />
          </div>
        </div>
      </div>

      {showCustomizer && <KpiCustomizerPanel kpis={OP_KPIS} visible={visibleKpis} onToggle={toggleKpi} onClose={() => setShowCustomizer(false)} title="Operações" />}
    </div>
  );
}

// ─── Aba Financeiro ────────────────────────────────────────────────────────

function TabFinanceiro() {
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try { const s = localStorage.getItem("dashboard_fin_kpis"); return s ? JSON.parse(s) : DEFAULT_FIN; }
    catch { return DEFAULT_FIN; }
  });
  const [showCustomizer, setShowCustomizer] = useState(false);

  function toggleKpi(id: string) {
    setVisibleKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem("dashboard_fin_kpis", JSON.stringify(next));
      return next;
    });
  }

  const visibleCards = FIN_KPIS.filter(k => visibleKpis.includes(k.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Visão executiva financeira do Grupo Esquematiza.</p>
        <button onClick={() => setShowCustomizer(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          <Settings className="w-3.5 h-3.5" /> Personalizar
        </button>
      </div>
      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{visibleCards.map(k => <KpiCard key={k.id} {...k} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Settings className="w-7 h-7 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Nenhum KPI selecionado.</p>
          <button onClick={() => setShowCustomizer(true)} className="mt-2 text-sm text-emerald-600 font-semibold hover:underline">Personalizar</button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-slate-900">Visão por Empresa</h2><p className="text-xs text-slate-500">Consolidado do Grupo Esquematiza</p></div>
          <div className="space-y-2">
            {EMPRESAS.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: e.cor }}>{e.inicial}</div>
                  <span className="text-sm font-medium text-slate-700 truncate">ESQMT {e.nome}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-xs text-slate-400">Aguardando dados</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-slate-900">Status Financeiro</h2><p className="text-xs text-slate-500">Indicadores do mês</p></div>
          <div className="space-y-2">
            <StatusItem label="Faturamento"       value="—" />
            <StatusItem label="Inadimplência"     value="—" />
            <StatusItem label="Contas a Pagar"    value="—" />
            <StatusItem label="Saldo Consolidado" value="—" />
            <StatusItem label="Margem do Mês"     value="—" />
            <StatusItem label="NFs Pendentes"     value="—" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-emerald-700 font-semibold text-sm">🚀 Conecte os dados reais para ativar todos os indicadores financeiros consolidados.</p>
      </div>
      {showCustomizer && <KpiCustomizerPanel kpis={FIN_KPIS} visible={visibleKpis} onToggle={toggleKpi} onClose={() => setShowCustomizer(false)} title="Financeiro" />}
    </div>
  );
}

// ─── Aba Grupo (Multi-empresa) ─────────────────────────────────────────────

function TabGrupo() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);

  const empresa = EMPRESAS.find(e => e.id === empresaSelecionada);

  const METRICAS_CONSOLIDADAS = [
    { label: "Faturamento Total Grupo",  value: "—",  icon: TrendingUp,    cor: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Custo Total Grupo",        value: "—",  icon: TrendingDown,  cor: "text-rose-600",    bg: "bg-rose-50" },
    { label: "Lucro Consolidado",        value: "—",  icon: BarChart3,     cor: "text-purple-600",  bg: "bg-purple-50" },
    { label: "Saldo em Caixa (10 contas)",value: "—", icon: Wallet,        cor: "text-blue-600",    bg: "bg-blue-50" },
    { label: "A Receber (todas)",        value: "—",  icon: ArrowUpRight,  cor: "text-teal-600",    bg: "bg-teal-50" },
    { label: "Inadimplência Grupo",      value: "—",  icon: AlertTriangle, cor: "text-amber-600",   bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Visão consolidada das 5 empresas do Grupo Esquematiza.</p>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">5 CNPJs ativos</span>
        </div>
      </div>

      {/* KPIs consolidados */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {METRICAS_CONSOLIDADAS.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                <Icon className={`h-4 w-4 ${m.cor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{m.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{m.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards das empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {EMPRESAS.map(e => (
          <button key={e.id} onClick={() => setEmpresaSelecionada(empresaSelecionada === e.id ? null : e.id)}
            className={`rounded-2xl border p-5 text-left transition-all shadow-sm ${
              empresaSelecionada === e.id
                ? "border-2 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            }`}
            style={empresaSelecionada === e.id ? { borderColor: e.cor, background: e.cor + "08" } : {}}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: e.cor }}>
                  {e.inicial}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">ESQMT {e.nome}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{e.cnpj}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 mt-1 ${empresaSelecionada === e.id ? "rotate-90" : ""}`} style={{ color: e.cor }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Faturamento", value: "—" },
                { label: "Margem",      value: "—" },
                { label: "A Receber",   value: "—" },
                { label: "Em Atraso",   value: "—" },
              ].map(item => (
                <div key={item.label} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </button>
        ))}

        {/* Card Consolidado Grupo */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Consolidado Grupo</p>
            <p className="text-xs text-slate-400 mt-1">Soma de todas as 5 empresas</p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {["Faturamento", "Lucro", "A Receber", "Saldo Caixa"].map(label => (
              <div key={label} className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-800">—</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalhe da empresa selecionada */}
      {empresa && (
        <div className="rounded-2xl border-2 p-6 space-y-4 transition-all" style={{ borderColor: empresa.cor, background: empresa.cor + "06" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: empresa.cor }}>{empresa.inicial}</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ESQMT {empresa.nome}</h2>
              <p className="text-xs text-slate-500">CNPJ: {empresa.cnpj}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Faturamento Mensal",   value: "—", desc: "Aguardando dados" },
              { label: "Custo Operacional",    value: "—", desc: "Aguardando dados" },
              { label: "Lucro do Mês",         value: "—", desc: "Aguardando dados" },
              { label: "Saldo em Conta",       value: "—", desc: "Aguardando dados" },
              { label: "Postos Ativos",        value: "—", desc: "Aguardando dados" },
              { label: "Profissionais",        value: "—", desc: "Aguardando dados" },
              { label: "Contratos Ativos",     value: "—", desc: "Aguardando dados" },
              { label: "Inadimplência",        value: "—", desc: "Aguardando dados" },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{item.value}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed p-4 text-center" style={{ borderColor: empresa.cor + "60" }}>
            <p className="text-sm font-semibold" style={{ color: empresa.cor }}>
              🚀 Conecte os dados reais desta empresa para ativar todos os indicadores.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">Como funciona o consolidado multi-empresa</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cada empresa tem seu próprio centro de custo e contas bancárias. Os KPIs consolidados somam automaticamente 
              os dados de todas as 5 empresas. Para ativar, conecte o Supabase com os dados reais de cada CNPJ — 
              as tabelas já estão preparadas para receber os lançamentos por empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"operacoes" | "financeiro" | "grupo">("operacoes");

  const tabs = [
    { id: "operacoes",  label: "Operações",  icon: Shield },
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
    { id: "grupo",      label: "Grupo",      icon: Layers },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8">

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Executivo</h1>
          <p className="mt-1 text-sm text-slate-500">Inteligência estratégica e monitoramento em tempo real.</p>
        </div>

        <div className="flex items-center gap-1 mb-6 bg-slate-200/60 p-1 rounded-2xl w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
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
