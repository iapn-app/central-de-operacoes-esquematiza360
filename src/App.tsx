import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// FINANCEIRO
import FinanceiroLayout from "./pages/financeiro/FinanceiroLayout";
import FinanceiroDashboard from "./pages/financeiro/FinanceiroDashboard";
import Lancamentos from "./pages/financeiro/Lancamentos";
import ContasReceber from "./pages/financeiro/ContasReceber";
import ContasPagar from "./pages/financeiro/ContasPagar";
import FluxoCaixa from "./pages/financeiro/FluxoCaixa";
import Relatorios from "./pages/financeiro/Relatorios";

// OUTRAS PÁGINAS (mantém as tuas)
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* DASHBOARD PRINCIPAL */}
          <Route index element={<Dashboard />} />

          {/* FINANCEIRO CORRIGIDO */}
          <Route path="financeiro" element={<FinanceiroLayout />}>
            <Route index element={<FinanceiroDashboard />} />
            <Route path="lancamentos" element={<Lancamentos />} />
            <Route path="receber" element={<ContasReceber />} />
            <Route path="pagar" element={<ContasPagar />} />
            <Route path="fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="relatorios" element={<Relatorios />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
