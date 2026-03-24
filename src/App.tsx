import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Header } from "./components/Layout";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./pages/Login";
import { UpdatePassword } from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import { Vigilantes } from "./pages/Vigilantes";
import { Rondas } from "./pages/Rondas";
import { Ocorrencias } from "./pages/Ocorrencias";
import { Financeiro } from "./pages/Financeiro";
import { CentroOperacoes } from "./pages/CentroOperacoes";
import { Escalas } from "./pages/Escalas";
import { PostosClientes } from "./pages/PostosClientes";
import { GestaoCrise } from "./pages/GestaoCrise";
import { RHCompliance } from "./pages/RHCompliance";
import { EquipamentosAtivos } from "./pages/EquipamentosAtivos";
import { Frota } from "./pages/Frota";
import { PortalCliente } from "./pages/PortalCliente";
import { AppVigilante } from "./pages/AppVigilante";
import { RotasInteligentes } from "./pages/RotasInteligentes";
import { InventarioEstoque } from "./pages/InventarioEstoque";
import { SimuladorContratos } from "./pages/SimuladorContratos";
import { SimuladorRiscoCliente } from "./pages/SimuladorRiscoCliente";
import { Auditoria } from "./pages/Auditoria";
import { RelatoriosInteligencia } from "./pages/RelatoriosInteligencia";
import { MonitoramentoCameras } from "./pages/MonitoramentoCameras";
import { InteligenciaOperacional } from "./pages/InteligenciaOperacional";
import Performance from "./pages/Performance";
import CustosOperacionais from "./pages/CustosOperacionais";
import { Inadimplencia } from "./pages/financeiro/Inadimplencia";
import MapaRisco from "./pages/MapaRisco";
import { EscalasInteligentes } from "./pages/EscalasInteligentes";
import { PainelSupervisor } from "./pages/PainelSupervisor";
import { FinanceiroOperacional } from "./pages/FinanceiroOperacional";
import { ContasPagar } from "./pages/financeiro/ContasPagar";
import { ContasReceber } from "./pages/financeiro/ContasReceber";
import { AdminModules } from "./pages/AdminModules";
import { AdminSidebar } from "./pages/AdminSidebar";
import { DebugPermissoes } from "./pages/DebugPermissoes";
import { Configuracoes } from "./pages/Configuracoes";
import { CaixaBancos } from "./pages/financeiro/CaixaBancos";
import { ResultadoMes } from "./pages/financeiro/ResultadoMes";
import { FluxoCaixa } from "./pages/financeiro/FluxoCaixa";
import { Importacao } from "./pages/financeiro/Importacao";
import { RelatoriosFinanceiros } from "./pages/financeiro/RelatoriosFinanceiros";
import { AjustesFinanceiros } from "./pages/financeiro/AjustesFinanceiros";
import { PanicButton } from "./components/PanicButton";
import { PergunteCentral } from "./components/AssistantChat";
import { Siren, AlertTriangle } from "lucide-react";
import {
  Building2,
  FileText,
  UserRound,
  GraduationCap,
  TrendingUp,
  FileSignature,
  Target,
  UserCog,
} from "lucide-react";
import { PagePlaceholder } from "./components/PagePlaceholder";
import { Contratos } from "./pages/Contratos";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SplashScreen } from "./components/SplashScreen";
import { AnimatePresence } from "motion/react";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import logoSymbol from "./assets/logos/logo-symbol.png";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-[28px] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-100 flex items-center justify-center mb-5">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-14 h-14 object-contain"
          />
        </div>

        <div className="w-10 h-10 rounded-full border-[3px] border-emerald-200 border-t-emerald-600 animate-spin mb-4" />

        <p className="text-slate-900 font-semibold text-lg">
          Inicializando sistema...
        </p>
      </div>
    </div>
  );
}

function FullScreenError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Erro de Autenticação
        </h1>

        <p className="text-slate-600 mb-6">{error}</p>

        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

function GlobalAuthLogger() {
  const { session, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (loading) return;

    if (!session) {
      if (location.pathname !== "/login") {
        console.log("APP redirect login");
      }
    } else {
      console.log("APP session found");
    }
  }, [session, loading, location.pathname]);

  return null;
}

function LoginRoute() {
  const { session, profile, isRecoveryMode } = useAuth();

  if (isRecoveryMode) {
    return <UpdatePassword />;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (profile?.role === "financeiro") {
    return <Navigate to="/financeiro" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AppContent() {
  const { loading, authError } = useAuth();
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (authError) {
    return <FullScreenError error={authError} />;
  }

  const hideShell =
    location.pathname === "/login" || location.pathname === "/update-password";

  return (
    <>
      <GlobalAuthLogger />

      {!hideShell && (
        <>
          <Sidebar />
          <Header onMenuClick={() => {}} />
        </>
      )}

      <main
        className={
          !hideShell
            ? "ml-[290px] pt-20 min-h-screen bg-slate-50 transition-all duration-300"
            : ""
        }
      >
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/centro-comando"
            element={
              <ProtectedRoute>
                <CentroOperacoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operacoes"
            element={<Navigate to="/centro-comando" replace />}
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Clientes"
                  description="Módulo de clientes em evolução."
                  icon={Building2}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vigilantes"
            element={
              <ProtectedRoute>
                <Vigilantes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rondas"
            element={
              <ProtectedRoute>
                <Rondas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ocorrencias"
            element={
              <ProtectedRoute>
                <Ocorrencias />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro"
            element={
              <ProtectedRoute>
                <Financeiro />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/lancamentos"
            element={
              <ProtectedRoute>
                <Financeiro />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/receber"
            element={
              <ProtectedRoute>
                <ContasReceber />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/pagar"
            element={
              <ProtectedRoute>
                <ContasPagar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/cobranca"
            element={
              <ProtectedRoute>
                <Inadimplencia />
              </ProtectedRoute>
            }
          />

          <Route
            path="/escalas"
            element={
              <ProtectedRoute>
                <Escalas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/postos-clientes"
            element={
              <ProtectedRoute>
                <PostosClientes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/postos"
            element={
              <ProtectedRoute>
                <PostosClientes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestao-crise"
            element={
              <ProtectedRoute>
                <GestaoCrise />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rh-compliance"
            element={
              <ProtectedRoute>
                <RHCompliance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/equipamentos-ativos"
            element={
              <ProtectedRoute>
                <EquipamentosAtivos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/frota"
            element={
              <ProtectedRoute>
                <Frota />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal-cliente"
            element={
              <ProtectedRoute>
                <PortalCliente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app-vigilante"
            element={
              <ProtectedRoute>
                <AppVigilante />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rotas-inteligentes"
            element={
              <ProtectedRoute>
                <RotasInteligentes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario-estoque"
            element={
              <ProtectedRoute>
                <InventarioEstoque />
              </ProtectedRoute>
            }
          />

          <Route
            path="/simulador-contratos"
            element={
              <ProtectedRoute>
                <SimuladorContratos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/simulador-risco-cliente"
            element={
              <ProtectedRoute>
                <SimuladorRiscoCliente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/simulador-risco"
            element={
              <ProtectedRoute>
                <SimuladorRiscoCliente />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditoria"
            element={
              <ProtectedRoute>
                <Auditoria />
              </ProtectedRoute>
            }
          />

          <Route
            path="/relatorios-inteligencia"
            element={
              <ProtectedRoute>
                <RelatoriosInteligencia />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitoramento-cameras"
            element={
              <ProtectedRoute>
                <MonitoramentoCameras />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inteligencia-operacional"
            element={
              <ProtectedRoute>
                <InteligenciaOperacional />
              </ProtectedRoute>
            }
          />

          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/custos-operacionais"
            element={
              <ProtectedRoute>
                <CustosOperacionais />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/inadimplencia"
            element={
              <ProtectedRoute>
                <Inadimplencia />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mapa-risco"
            element={
              <ProtectedRoute>
                <MapaRisco />
              </ProtectedRoute>
            }
          />

          <Route
            path="/escalas-inteligentes"
            element={
              <ProtectedRoute>
                <EscalasInteligentes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/painel-supervisor"
            element={
              <ProtectedRoute>
                <PainelSupervisor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro-operacional"
            element={
              <ProtectedRoute>
                <FinanceiroOperacional />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/contas-pagar"
            element={
              <ProtectedRoute>
                <ContasPagar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/contas-receber"
            element={
              <ProtectedRoute>
                <ContasReceber />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/modules"
            element={
              <ProtectedRoute>
                <AdminModules />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sidebar"
            element={
              <ProtectedRoute>
                <AdminSidebar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/debug/permissoes"
            element={
              <ProtectedRoute>
                <DebugPermissoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/caixa-bancos"
            element={
              <ProtectedRoute>
                <CaixaBancos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/resultado-mes"
            element={
              <ProtectedRoute>
                <ResultadoMes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/fluxo-caixa"
            element={
              <ProtectedRoute>
                <FluxoCaixa />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/importacao"
            element={
              <ProtectedRoute>
                <Importacao />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/relatorios"
            element={
              <ProtectedRoute>
                <RelatoriosFinanceiros />
              </ProtectedRoute>
            }
          />

          <Route
            path="/financeiro/ajustes"
            element={
              <ProtectedRoute>
                <AjustesFinanceiros />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contratos"
            element={
              <ProtectedRoute>
                <Contratos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documentos"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Documentos"
                  description="Gestão documental em evolução."
                  icon={FileText}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/colaboradores"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Colaboradores"
                  description="Módulo de pessoas em evolução."
                  icon={UserRound}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/treinamentos"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Treinamentos"
                  description="Trilha de capacitação em evolução."
                  icon={GraduationCap}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/indicadores"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Indicadores"
                  description="Painel estratégico em evolução."
                  icon={TrendingUp}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assinaturas"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Assinaturas"
                  description="Fluxo de assinaturas em evolução."
                  icon={FileSignature}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/metas"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Metas"
                  description="Acompanhamento de metas em evolução."
                  icon={Target}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <PagePlaceholder
                  title="Usuários"
                  description="Gestão de acessos em evolução."
                  icon={UserCog}
                />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <button
        onClick={() => setIsPanicOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-pulse group transition-all hover:scale-110"
        title="Simular Botão de Pânico"
      >
        <Siren className="w-7 h-7" />
      </button>

      <AnimatePresence>
        {isPanicOpen && <PanicButton onClose={() => setIsPanicOpen(false)} />}
      </AnimatePresence>

      <PergunteCentral />
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AppErrorBoundary>
      {!splashDone && (
        <SplashScreen
          onFinish={() => {
            console.log("APP splash finished");
            setSplashDone(true);
          }}
        />
      )}

      {splashDone && (
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      )}
    </AppErrorBoundary>
  );
}
