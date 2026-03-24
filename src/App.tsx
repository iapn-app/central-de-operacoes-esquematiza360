import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

import { PainelFinanceiro } from "./pages/financeiro/PainelFinanceiro";
import { Lancamentos } from "./pages/financeiro/Lancamentos";
import { ContasReceber } from "./pages/financeiro/ContasReceber";
import { ContasPagar } from "./pages/financeiro/ContasPagar";
import { FluxoCaixa } from "./pages/financeiro/FluxoCaixa";
import { Cobranca } from "./pages/financeiro/Cobranca";
import { RelatoriosFinanceiros } from "./pages/financeiro/RelatoriosFinanceiros";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="financeiro" element={<PainelFinanceiro />} />
          <Route path="financeiro/lancamentos" element={<Lancamentos />} />
          <Route path="financeiro/receber" element={<ContasReceber />} />
          <Route path="financeiro/pagar" element={<ContasPagar />} />
          <Route path="financeiro/cobranca" element={<Cobranca />} />
          <Route path="financeiro/fluxo-caixa" element={<FluxoCaixa />} />
          <Route path="financeiro/relatorios" element={<RelatoriosFinanceiros />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
