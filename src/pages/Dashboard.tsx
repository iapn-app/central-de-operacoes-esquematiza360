import { useState } from "react";
import {
  Activity, AlertTriangle, Building2, Car, CheckCircle2,
  Clock3, FileText, Shield, Users, Settings, X, Eye, EyeOff,
} from "lucide-react";

// ─── Definição de todos os KPIs disponíveis ────────────────────────────────

const ALL_KPIS = [
  { id: "postos",     title: "Postos Ativos",          value: "—",    subtitle: "Aguardando dados reais",     icon: Building2 },
  { id: "vigilantes", title: "Vigilantes em Escala",   value: "—",    subtitle: "Aguardando dados reais",     icon: Users },
  { id: "ocorrencias",title: "Ocorrências Hoje",       value: "—",    subtitle: "Aguardando dados reais",     icon: AlertTriangle },
  { id: "frota",      title: "Frota Operacional",      value: "—",    subtitle: "Aguardando dados reais",     icon: Car },
  { id: "cobertura",  title: "Cobertura Operacional",  value: "—",    subtitle: "Aguardando dados reais",     icon: Shield },
  { id: "resposta",   title: "Tempo Médio de Resposta",value: "—",    subtitle: "Aguardando dados reais",     icon: Clock3 },
  { id: "alertas",    title: "Alertas Críticos",       value: "—",    subtitle: "Aguardando dados reais",     icon: AlertTriangle },
  { id: "relatorios", title: "Relatórios Emitidos",    value: "—",    subtitle: "Aguardando dados reais",     icon: FileText },
];

const DEFAULT_VISIBLE = ["postos", "vigilantes", "ocorrencias", "frota"];

// ─── KPI Card ──────────────────────────────────────────────────────────────

function KpiCard({ title, value, subtitle, icon: Icon }: {
  title: string; value: string; subtitle: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
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
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{value}</span>
    </div>
  );
}

// ─── Painel lateral de personalização ─────────────────────────────────────

function KpiCustomizerPanel({ visible, onToggle, onClose }: {
  visible: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Painel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Personalizar Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Escolha quais KPIs exibir</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {ALL_KPIS.map((kpi) => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.id}
                onClick={() => onToggle(kpi.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                  active
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${active ? "bg-emerald-100" : "bg-slate-200"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${active ? "text-slate-900" : "text-slate-500"}`}>
                    {kpi.title}
                  </p>
                </div>
                <div className={`flex-shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`}>
                  {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            {visible.length} de {ALL_KPIS.length} KPIs visíveis
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────

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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Dashboard Executivo
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Inteligência estratégica e monitoramento operacional em tempo real.
            </p>
          </div>
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            Personalizar
          </button>
        </div>

        {/* KPI Cards dinâmicos */}
        {visibleCards.length > 0 ? (
          <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-${Math.min(visibleCards.length, 4)}`}>
            {visibleCards.map((kpi) => (
              <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum KPI selecionado.</p>
            <button onClick={() => setShowCustomizer(true)} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">
              Clique para personalizar
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Resumo Operacional */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Resumo Operacional</h2>
                <p className="text-sm text-slate-500">Indicadores principais da central</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Activity className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: "Cobertura Operacional", value: "—", icon: Shield, color: "bg-emerald-50", iconColor: "text-emerald-600" },
                { label: "Tempo Médio de Resposta", value: "—", icon: Clock3, color: "bg-blue-50", iconColor: "text-blue-600" },
                { label: "Alertas Críticos", value: "—", icon: AlertTriangle, color: "bg-amber-50", iconColor: "text-amber-600" },
                { label: "Relatórios Emitidos", value: "—", icon: FileText, color: "bg-violet-50", iconColor: "text-violet-600" },
              ].map(({ label, value, icon: Icon, color, iconColor }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status da Operação */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Status da Operação</h2>
                <p className="text-sm text-slate-500">Panorama rápido da central</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <div className="space-y-3">
              <StatusItem label="Centro de Operações" value="—" status="neutral" />
              <StatusItem label="Rondas Programadas" value="—" status="neutral" />
              <StatusItem label="Escalas do Dia" value="—" status="neutral" />
              <StatusItem label="Ocorrências Pendentes" value="—" status="neutral" />
              <StatusItem label="Frota" value="—" status="neutral" />
              <StatusItem label="Compliance" value="—" status="neutral" />
            </div>
          </div>
        </div>

        {/* Aviso dados reais */}
        <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-emerald-700 font-semibold text-sm">
            🚀 Sistema pronto para implantação. Conecte o Supabase para exibir dados reais em tempo real.
          </p>
        </div>

      </div>

      {/* Painel lateral */}
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
