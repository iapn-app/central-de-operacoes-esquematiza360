import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";

import { CentroOperacoes } from "./pages/CentroOperacoes";
import { Rondas } from "./pages/Rondas";
import { Ocorrencias } from "./pages/Ocorrencias";
import { Escalas } from "./pages/Escalas";
import { Vigilantes } from "./pages/Vigilantes";
import { PostosClientes } from "./pages/PostosClientes";
import { Frota } from "./pages/Frota";
import { PortalCliente } from "./pages/PortalCliente";

import { PainelFinanceiro } from "./pages/financeiro/PainelFinanceiro";
import { Lancamentos } from "./pages/financeiro/Lancamentos";
import { ContasReceber } from "./pages/financeiro/ContasReceber";
import { ContasPagar } from "./pages/financeiro/ContasPagar";
import { FluxoCaixa } from "./pages/financeiro/FluxoCaixa";
import { Cobranca } from "./pages/financeiro/Cobranca";
import { RelatoriosFinanceiros } from "./pages/financeiro/RelatoriosFinanceiros";
import { CaixaBancos } from "./pages/financeiro/CaixaBancos";
import { Inadimplencia as FinanceiroInadimplencia } from "./pages/financeiro/Inadimplencia";
import { ResultadoMes } from "./pages/financeiro/ResultadoMes";

import { InteligenciaOperacional } from "./pages/InteligenciaOperacional";
import MapaRisco from "./pages/MapaRisco";
import Performance from "./pages/Performance";
import { SimuladorRiscoCliente } from "./pages/SimuladorRiscoCliente";

import { Contratos } from "./pages/Contratos";
import { FolhaPagamento } from "./pages/FolhaPagamento";
import { NotasFiscais } from "./pages/NotasFiscais";
import { OrcamentoRealizado } from "./pages/financeiro/OrcamentoRealizado";
import { OpenFinance } from "./pages/financeiro/OpenFinance";
import { Configuracoes } from "./pages/Configuracoes";

function LoginGuard() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const last = localStorage.getItem("splashDate");
    const today = new Date().toDateString();
    return last !== today;
  });

  function handleSplashFinish() {
    localStorage.setItem("splashDate", new Date().toDateString());
    setShowSplash(false);
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="operacoes" element={<CentroOperacoes />} />
            <Route path="rondas" element={<Rondas />} />
            <Route path="ocorrencias" element={<Ocorrencias />} />
            <Route path="escalas" element={<Escalas />} />
            <Route path="vigilantes" element={<Vigilantes />} />
            <Route path="postos" element={<PostosClientes />} />
            <Route path="frota" element={<Frota />} />
            <Route path="portal-cliente" element={<PortalCliente />} />
            <Route path="financeiro" element={<PainelFinanceiro />} />
            <Route path="financeiro/lancamentos" element={<Lancamentos />} />
            <Route path="financeiro/receber" element={<ContasReceber />} />
            <Route path="financeiro/pagar" element={<ContasPagar />} />
            <Route path="financeiro/cobranca" element={<Cobranca />} />
            <Route path="financeiro/fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="financeiro/relatorios" element={<RelatoriosFinanceiros />} />
            <Route path="financeiro/caixa-bancos" element={<CaixaBancos />} />
            <Route path="financeiro/inadimplencia" element={<FinanceiroInadimplencia />} />
            <Route path="financeiro/dre" element={<ResultadoMes />} />
            <Route path="inteligencia-operacional" element={<InteligenciaOperacional />} />
            <Route path="mapa-risco" element={<MapaRisco />} />
            <Route path="performance" element={<Performance />} />
            <Route path="simulador-risco" element={<SimuladorRiscoCliente />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="folha-pagamento" element={<FolhaPagamento />} />
            <Route path="notas-fiscais" element={<NotasFiscais />} />
            <Route path="financeiro/orcamento" element={<OrcamentoRealizado />} />
            <Route path="financeiro/open-finance" element={<OpenFinance />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
