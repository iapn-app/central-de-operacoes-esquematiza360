import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";

// Operações
import { CentroOperacoes } from "./pages/CentroOperacoes";
import { Rondas } from "./pages/Rondas";
import { Ocorrencias } from "./pages/Ocorrencias";
import { Escalas } from "./pages/Escalas";
import { Vigilantes } from "./pages/Vigilantes";
import { PostosClientes } from "./pages/PostosClientes";
import { Frota } from "./pages/Frota";
import { PortalCliente } from "./pages/PortalCliente";

// Financeiro
import { PainelFinanceiro } from "./pages/financeiro/PainelFinanceiro";
import { Lancamentos } from "./pages/financeiro/Lancamentos";
import { ContasReceber } from "./pages/financeiro/ContasReceber";
import { ContasPagar } from "./pages/financeiro/ContasPagar";
import { FluxoCaixa } from "./pages/financeiro/FluxoCaixa";
import { Cobranca } from "./pages/financeiro/Cobranca";
import { RelatoriosFinanceiros } from "./pages/financeiro/RelatoriosFinanceiros";

// Inteligência
import { InteligenciaOperacional } from "./pages/InteligenciaOperacional";
import MapaRisco from "./pages/MapaRisco";
import Performance from "./pages/Performance";
import { SimuladorRiscoCliente } from "./pages/SimuladorRiscoCliente";

// Admin
import { Contratos } from "./pages/Contratos";
import { Configuracoes } from "./pages/Configuracoes";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Se já visitou antes nesta sessão, pula o splash
    if (sessionStorage.getItem("splashShown")) {
      setShowSplash(false);
    }
  }, []);

  function handleSplashFinish() {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas dentro do Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Operações */}
            <Route path="operacoes" element={<CentroOperacoes />} />
            <Route path="rondas" element={<Rondas />} />
            <Route path="ocorrencias" element={<Ocorrencias />} />
            <Route path="escalas" element={<Escalas />} />
            <Route path="vigilantes" element={<Vigilantes />} />
            <Route path="postos" element={<PostosClientes />} />
            <Route path="frota" element={<Frota />} />
            <Route path="portal-cliente" element={<PortalCliente />} />

            {/* Financeiro */}
            <Route path="financeiro" element={<PainelFinanceiro />} />
            <Route path="financeiro/lancamentos" element={<Lancamentos />} />
            <Route path="financeiro/receber" element={<ContasReceber />} />
            <Route path="financeiro/pagar" element={<ContasPagar />} />
            <Route path="financeiro/cobranca" element={<Cobranca />} />
            <Route path="financeiro/fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="financeiro/relatorios" element={<RelatoriosFinanceiros />} />

            {/* Inteligência */}
            <Route path="inteligencia-operacional" element={<InteligenciaOperacional />} />
            <Route path="mapa-risco" element={<MapaRisco />} />
            <Route path="performance" element={<Performance />} />
            <Route path="simulador-risco" element={<SimuladorRiscoCliente />} />

            {/* Admin */}
            <Route path="contratos" element={<Contratos />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
