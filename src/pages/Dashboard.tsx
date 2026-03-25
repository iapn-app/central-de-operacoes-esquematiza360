import { useState } from "react";
import {
  Activity, AlertTriangle, Building2, Car, CheckCircle2,
  Clock3, FileText, Shield, Users, Settings, X, Eye, EyeOff,
} from "lucide-react";

const ALL_KPIS = [
  { id: "postos",      title: "Postos Ativos",           icon: Building2,    color: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "vigilantes",  title: "Vigilantes em Escala",    icon: Users,        color: "bg-blue-50",    iconColor: "text-blue-600" },
  { id: "ocorrencias", title: "Ocorrências Hoje",        icon: AlertTriangle,color: "bg-amber-50",   iconColor: "text-amber-600" },
  { id: "frota",       title: "Frota Operacional",       icon: Car,          color: "bg-violet-50",  iconColor: "text-violet-600" },
  { id: "cobertura",   title: "Cobertura Operacional",   icon: Shield,       color: "bg-teal-50",    iconColor: "text-teal-600" },
  { id: "resposta",    title: "Tempo Médio Resposta",    icon: Clock3,       color: "bg-sky-50",     iconColor: "text-sky-600" },
  { id: "alertas",     title: "Alertas Críticos",        icon: AlertTriangle,color: "bg-red-50",     iconColor: "text-red-600" },
  { id: "relatorios",  title: "Relatórios Emitidos",     icon: FileText,     color: "bg-indigo-50",  iconColor: "text-indigo-600" },
];

const DEFAULT_VISIBLE = ["postos", "vigilantes", "ocorrencias", "frota", "cobertura", "resposta", "alertas", "relatorios"];

// ─── KPI Card compacto ─────────────────────────────────────────────────────

function KpiCard({ title, icon: Icon, color, iconColor }: {
  title: string; icon: React.ElementType; color: string; iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
        <h3 className="text-xl font-bold text-slate-900">—</h3>
        <p className="text-xs text-slate-400 truncate">Aguardando dados</p>
      </div>
    </div>
  );
}

// ─── Status Item ───────────────────────────────────────────────────────────

function StatusItem({ label, value, status = "neutral" }: {
  label: string; value: string; status?: "ok" | "alert" | "neutral";
}) {
  const cls = status === "ok"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "alert"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cls}`}>{value}</span>
    </div>
  );
}

// ─── Painel lateral ────────────────────────────────────────────────────────

function KpiCustomizerPanel({ visible, onToggle, onClose }: {
  visible: string[]; onToggle: (id: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Personalizar Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ative ou desative os KPIs</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {ALL_KPIS.map((kpi) => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.id}
                onClick={() => onToggle(kpi.id)}
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
          <p className="text-xs text-slate-400 text-center">{visible.length} de {ALL_KPIS.length} KPIs visíveis</p>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dashboard_kpis");
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE;
    } catch { return DEFAULT_VISIBLE; }
  });
  const [showCustomizer, setShowCustomizer] = useState(false);

  function toggleKpi(id: string) {
    setVisibleKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem("dashboard_kpis", JSON.stringify(next));
      return next;
    });
  }

  const visibleCards = ALL_KPIS.filter(k => visibleKpis.includes(k.id));

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Executivo</h1>
            <p className="mt-1 text-sm text-slate-500">Inteligência estratégica e monitoramento operacional em tempo real.</p>
          </div>
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition flex-shrink-0"
          >
            <Settings className="w-4 h-4" /> Personalizar
          </button>
        </div>

        {/* KPI Grid compacto — 4 por linha em telas grandes */}
        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
            {visibleCards.map((kpi) => (
              <KpiCard key={kpi.id} title={kpi.title} icon={kpi.icon} color={kpi.color} iconColor={kpi.iconColor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center mb-6">
            <Settings className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Nenhum KPI selecionado.</p>
            <button onClick={() => setShowCustomizer(true)} className="mt-2 text-sm text-emerald-600 font-semibold hover:underline">
              Clique para personalizar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Resumo Operacional */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Resumo Operacional</h2>
                <p className="text-xs text-slate-500">Indicadores principais da central</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Activity className="h-4 w-4 text-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Cobertura Operacional",  icon: Shield,       color: "bg-emerald-50", iconColor: "text-emerald-600" },
                { label: "Tempo Médio de Resposta", icon: Clock3,       color: "bg-blue-50",    iconColor: "text-blue-600" },
                { label: "Alertas Críticos",        icon: AlertTriangle,color: "bg-amber-50",   iconColor: "text-amber-600" },
                { label: "Relatórios Emitidos",     icon: FileText,     color: "bg-violet-50",  iconColor: "text-violet-600" },
              ].map(({ label, icon: Icon, color, iconColor }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <h3 className="text-xl font-bold text-slate-900">—</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status da Operação */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Status da Operação</h2>
                <p className="text-xs text-slate-500">Panorama rápido da central</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <CheckCircle2 className="h-4 w-4 text-slate-700" />
              </div>
            </div>
            <div className="space-y-2">
              <StatusItem label="Centro de Operações"    value="—" />
              <StatusItem label="Rondas Programadas"     value="—" />
              <StatusItem label="Escalas do Dia"         value="—" />
              <StatusItem label="Ocorrências Pendentes"  value="—" />
              <StatusItem label="Frota"                  value="—" />
              <StatusItem label="Compliance"             value="—" />
            </div>
          </div>
        </div>

        {/* Aviso implantação */}
        <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-emerald-700 font-semibold text-sm">
            🚀 Sistema pronto para implantação. Conecte o Supabase para exibir dados reais em tempo real.
          </p>
        </div>

      </div>

      {showCustomizer && (
        <KpiCustomizerPanel
          visible={visibleKpis}
          onToggle={toggleKpi}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  );
}
