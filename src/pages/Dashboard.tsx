import {
  Activity,
  AlertTriangle,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  FileText,
  Shield,
  Users,
} from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
};

function KpiCard({ title, value, subtitle, icon: Icon }: KpiCardProps) {
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

type StatusItemProps = {
  label: string;
  value: string;
  status?: "ok" | "alert" | "neutral";
};

function StatusItem({ label, value, status = "neutral" }: StatusItemProps) {
  const statusClasses =
    status === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "alert"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
        {value}
      </span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Dashboard Executivo
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Inteligência estratégica e monitoramento operacional em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Postos Ativos"
            value="48"
            subtitle="Operações em andamento"
            icon={Building2}
          />
          <KpiCard
            title="Vigilantes em Escala"
            value="126"
            subtitle="Profissionais alocados hoje"
            icon={Users}
          />
          <KpiCard
            title="Ocorrências Hoje"
            value="07"
            subtitle="3 pendentes de validação"
            icon={AlertTriangle}
          />
          <KpiCard
            title="Frota Operacional"
            value="22"
            subtitle="18 veículos em rota"
            icon={Car}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Resumo Operacional
                </h2>
                <p className="text-sm text-slate-500">
                  Indicadores principais da central
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Activity className="h-5 w-5 text-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Cobertura Operacional
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900">96%</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                    <Clock3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Tempo Médio de Resposta
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900">08 min</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Alertas Críticos
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900">02</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Relatórios Emitidos
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900">14</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Status da Operação
                </h2>
                <p className="text-sm text-slate-500">
                  Panorama rápido da central
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>
            </div>

            <div className="space-y-3">
              <StatusItem label="Centro de Operações" value="Online" status="ok" />
              <StatusItem label="Rondas Programadas" value="18 ativas" status="neutral" />
              <StatusItem label="Escalas do Dia" value="Fechadas" status="ok" />
              <StatusItem label="Ocorrências Pendentes" value="3 em análise" status="alert" />
              <StatusItem label="Frota" value="4 alertas leves" status="alert" />
              <StatusItem label="Compliance" value="Sem pendências" status="ok" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Ocorrências Recentes
              </h2>
              <p className="text-sm text-slate-500">
                Últimos eventos registrados pela operação
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Acesso não autorizado
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Posto Alpha · Zona Norte
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    Crítico
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Ronda concluída com sucesso
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Condomínio Central Park
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Concluído
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Manutenção preventiva da viatura
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Frota · Unidade 07
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Atenção
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Prioridades do Dia
              </h2>
              <p className="text-sm text-slate-500">
                Itens com maior impacto operacional
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  Validar 3 ocorrências pendentes
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Revisão necessária pelo supervisor da central.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  Confirmar escalas do turno da noite
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ajustar cobertura de 2 postos com substituição.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  Revisar alertas de frota
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Verificar manutenção e consumo anormal.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  Consolidar relatório executivo
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Preparar visão resumida para diretoria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
