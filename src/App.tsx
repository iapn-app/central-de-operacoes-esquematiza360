import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/Login';
import { UpdatePassword } from './pages/UpdatePassword';
import { Dashboard } from './pages/Dashboard';
import { Vigilantes } from './pages/Vigilantes';
import { Rondas } from './pages/Rondas';
import { Ocorrencias } from './pages/Ocorrencias';
import { Financeiro } from './pages/Financeiro';
import { CentroOperacoes } from './pages/CentroOperacoes';
import { Escalas } from './pages/Escalas';
import { PostosClientes } from './pages/PostosClientes';
import { GestaoCrise } from './pages/GestaoCrise';
import { RHCompliance } from './pages/RHCompliance';
import { EquipamentosAtivos } from './pages/EquipamentosAtivos';
import { Frota } from './pages/Frota';
import { PortalCliente } from './pages/PortalCliente';
import { AppVigilante } from './pages/AppVigilante';
import { RotasInteligentes } from './pages/RotasInteligentes';
import { InventarioEstoque } from './pages/InventarioEstoque';
import { SimuladorContratos } from './pages/SimuladorContratos';
import { SimuladorRiscoCliente } from './pages/SimuladorRiscoCliente';
import { Auditoria } from './pages/Auditoria';
import { RelatoriosInteligencia } from './pages/RelatoriosInteligencia';
import { MonitoramentoCameras } from './pages/MonitoramentoCameras';
import { InteligenciaOperacional } from './pages/InteligenciaOperacional';
import Performance from './pages/Performance';
import CustosOperacionais from './pages/CustosOperacionais';
import { Inadimplencia } from './pages/financeiro/Inadimplencia';
import MapaRisco from './pages/MapaRisco';
import { EscalasInteligentes } from './pages/EscalasInteligentes';
import { PainelSupervisor } from './pages/PainelSupervisor';
import { FinanceiroOperacional } from './pages/FinanceiroOperacional';
import { ContasPagar } from './pages/financeiro/ContasPagar';
import { ContasReceber } from './pages/financeiro/ContasReceber';
import { AdminModules } from './pages/AdminModules';
import { AdminSidebar } from './pages/AdminSidebar';
import { DebugPermissoes } from './pages/DebugPermissoes';
import { Configuracoes } from './pages/Configuracoes';
import { CaixaBancos } from './pages/financeiro/CaixaBancos';
import { ResultadoMes } from './pages/financeiro/ResultadoMes';
import { FluxoCaixa } from './pages/financeiro/FluxoCaixa';
import { Importacao } from './pages/financeiro/Importacao';
import { RelatoriosFinanceiros } from './pages/financeiro/RelatoriosFinanceiros';
import { AjustesFinanceiros } from './pages/financeiro/AjustesFinanceiros';
import { PanicButton } from './components/PanicButton';
import { PergunteCentral } from './components/AssistantChat';
import { Siren, Shield, AlertTriangle } from 'lucide-react';
import { 
  Building2, 
  FileText, 
  UserRound, 
  GraduationCap, 
  TrendingUp, 
  FileSignature, 
  Target, 
  UserCog
} from 'lucide-react';
import { PagePlaceholder } from './components/PagePlaceholder';
import { Contratos } from './pages/Contratos';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';
import { AppErrorBoundary } from './components/AppErrorBoundary';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-xl animate-pulse"></div>
        <Shield className="w-16 h-16 text-brand-green animate-bounce relative z-10" />
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mb-4"></div>
      <p className="text-gray-800 dark:text-gray-200 font-bold tracking-wide">Inicializando sistema...</p>
    </div>
  );
}

function FullScreenError({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300 p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro de Autenticação</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-4 rounded-xl transition-colors"
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

  useEffect(() => {
    if (loading) return;
    
    if (!session) {
      console.log('APP no session');
      if (location.pathname !== '/login') {
        console.log('APP redirect login');
      }
    } else {
      console.log('APP session found');
    }
  }, [session, loading]);

  return null;
}

function LoginRoute() {
  const { session, profile, isRecoveryMode } = useAuth();
  
  if (isRecoveryMode) {
    return <Navigate to="/update-password" replace />;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (profile?.role === 'financeiro') {
    console.log('APP redirect financeiro');
    return <Navigate to="/financeiro" replace />;
  }

  console.log('APP redirect dashboard');
  return <Navigate to="/" replace />;
}

function AppContent() {
  const { loading, authError, signOut } = useAuth();
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (authError) {
    return <FullScreenError error={authError} />;
  }

  return (
    <Router>
      <GlobalAuthLogger />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
              <Sidebar 
                onLogout={signOut} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
              />
              
              <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuOpen={() => setIsSidebarOpen(true)} />
                
                <main className="flex-1 p-8 overflow-y-auto">
                  <Routes>
                    {/* DASHBOARD */}
                    <Route path="/" element={<ProtectedRoute allowedRoles={['admin_master']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/operacoes" element={<ProtectedRoute allowedRoles={['admin_master']}><CentroOperacoes /></ProtectedRoute>} />
                    <Route path="/portal-cliente" element={<ProtectedRoute allowedRoles={['admin_master']}><PortalCliente /></ProtectedRoute>} />
                    <Route path="/app-vigilante" element={<ProtectedRoute allowedRoles={['admin_master']}><AppVigilante /></ProtectedRoute>} />
                    <Route path="/rotas-inteligentes" element={<ProtectedRoute allowedRoles={['admin_master']}><RotasInteligentes /></ProtectedRoute>} />
                    <Route path="/inventario-estoque" element={<ProtectedRoute allowedRoles={['admin_master']}><InventarioEstoque /></ProtectedRoute>} />
                    <Route path="/simulador-contratos" element={<ProtectedRoute allowedRoles={['admin_master']}><SimuladorContratos /></ProtectedRoute>} />
                    <Route path="/simulador-risco" element={<ProtectedRoute allowedRoles={['admin_master']}><SimuladorRiscoCliente /></ProtectedRoute>} />
                    <Route path="/auditoria" element={<ProtectedRoute allowedRoles={['admin_master']}><Auditoria /></ProtectedRoute>} />

                    {/* OPERAÇÕES */}
                    <Route path="/vigilantes" element={<ProtectedRoute allowedRoles={['admin_master']}><Vigilantes /></ProtectedRoute>} />
                    <Route path="/escalas" element={<ProtectedRoute allowedRoles={['admin_master']}><Escalas /></ProtectedRoute>} />
                    <Route path="/escalas-inteligentes" element={<ProtectedRoute allowedRoles={['admin_master']}><EscalasInteligentes /></ProtectedRoute>} />
                    <Route path="/postos" element={<ProtectedRoute allowedRoles={['admin_master']}><PostosClientes /></ProtectedRoute>} />
                    <Route path="/rondas" element={<ProtectedRoute allowedRoles={['admin_master']}><Rondas /></ProtectedRoute>} />
                    <Route path="/ocorrencias" element={<ProtectedRoute allowedRoles={['admin_master']}><Ocorrencias /></ProtectedRoute>} />
                    <Route path="/crise" element={<ProtectedRoute allowedRoles={['admin_master']}><GestaoCrise /></ProtectedRoute>} />
                    <Route path="/cameras" element={<ProtectedRoute allowedRoles={['admin_master']}><MonitoramentoCameras /></ProtectedRoute>} />

                    {/* GESTÃO */}
                    <Route path="/clientes" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Clientes" description="Gestão da carteira de clientes do Grupo Esquematiza." icon={Building2} /></ProtectedRoute>} />
                    <Route path="/contratos" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><Contratos /></ProtectedRoute>} />
                    <Route path="/supervisao" element={<ProtectedRoute allowedRoles={['admin_master']}><PainelSupervisor /></ProtectedRoute>} />
                    <Route path="/ativos" element={<ProtectedRoute allowedRoles={['admin_master']}><EquipamentosAtivos /></ProtectedRoute>} />
                    <Route path="/frota" element={<ProtectedRoute allowedRoles={['admin_master']}><Frota /></ProtectedRoute>} />

                    {/* PESSOAS */}
                    <Route path="/funcionarios" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Funcionários" description="Gestão administrativa de todo o quadro de funcionários." icon={UserRound} /></ProtectedRoute>} />
                    <Route path="/treinamentos" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Treinamentos" description="Plataforma de capacitação e reciclagem técnica." icon={GraduationCap} /></ProtectedRoute>} />
                    <Route path="/compliance" element={<ProtectedRoute allowedRoles={['admin_master']}><RHCompliance /></ProtectedRoute>} />

                    {/* FINANCEIRO */}
                    <Route path="/financeiro" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><Financeiro /></ProtectedRoute>} />
                    <Route path="/financeiro/lancamentos" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><PagePlaceholder title="Lançamentos" description="Gestão de lançamentos financeiros." icon={FileText} /></ProtectedRoute>} />
                    <Route path="/financeiro/receber" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><ContasReceber /></ProtectedRoute>} />
                    <Route path="/financeiro/pagar" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><ContasPagar /></ProtectedRoute>} />
                    <Route path="/financeiro/cobranca" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><PagePlaceholder title="Cobrança" description="Gestão de cobranças." icon={FileText} /></ProtectedRoute>} />
                    <Route path="/financeiro/fluxo-caixa" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><FluxoCaixa /></ProtectedRoute>} />
                    <Route path="/financeiro/relatorios" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><RelatoriosFinanceiros /></ProtectedRoute>} />
                    <Route path="/financeiro/caixa-bancos" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><CaixaBancos /></ProtectedRoute>} />
                    <Route path="/financeiro/resultado" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><ResultadoMes /></ProtectedRoute>} />
                    <Route path="/financeiro/importacao" element={<ProtectedRoute allowedRoles={['admin_master']}><Importacao /></ProtectedRoute>} />
                    <Route path="/financeiro/inadimplencia" element={<ProtectedRoute allowedRoles={['admin_master', 'financeiro']}><Inadimplencia /></ProtectedRoute>} />
                    <Route path="/financeiro/ajustes" element={<ProtectedRoute allowedRoles={['admin_master']}><AjustesFinanceiros /></ProtectedRoute>} />

                    {/* INTELIGÊNCIA */}
                    <Route path="/inteligencia-operacional" element={<ProtectedRoute allowedRoles={['admin_master']}><InteligenciaOperacional /></ProtectedRoute>} />
                    <Route path="/inteligencia" element={<ProtectedRoute allowedRoles={['admin_master']}><RelatoriosInteligencia /></ProtectedRoute>} />
                    <Route path="/indicadores" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Indicadores" description="Painel de KPIs e métricas de performance." icon={Target} /></ProtectedRoute>} />
                    <Route path="/mapa-risco" element={<ProtectedRoute allowedRoles={['admin_master']}><MapaRisco /></ProtectedRoute>} />
                    <Route path="/performance" element={<ProtectedRoute allowedRoles={['admin_master']}><Performance /></ProtectedRoute>} />

                    {/* CONFIGURAÇÕES */}
                    <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Usuários" description="Gestão de usuários do sistema e acessos." icon={UserCog} /></ProtectedRoute>} />
                    <Route path="/perfis" element={<ProtectedRoute allowedRoles={['admin_master']}><PagePlaceholder title="Perfis" description="Definição de perfis de acesso e permissões." icon={Shield} /></ProtectedRoute>} />
                    <Route path="/configuracoes" element={<ProtectedRoute allowedRoles={['admin_master']}><Configuracoes /></ProtectedRoute>} />
                    <Route path="/configuracoes/menu-lateral" element={<ProtectedRoute allowedRoles={['admin_master']}><AdminSidebar /></ProtectedRoute>} />
                    <Route path="/configuracoes/debug-permissoes" element={<ProtectedRoute allowedRoles={['admin_master']}><DebugPermissoes /></ProtectedRoute>} />
                    <Route path="/admin/modulos" element={<ProtectedRoute allowedRoles={['admin_master']}><AdminModules /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>

              {/* Floating Panic Trigger for Demo */}
              <button 
                onClick={() => setIsPanicOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-pulse group transition-all hover:scale-110"
                title="Simular Botão de Pânico"
              >
                <Siren className="w-8 h-8" />
                <span className="absolute right-full mr-4 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  SIMULAR EMERGÊNCIA
                </span>
              </button>

              <PanicButton 
                isOpen={isPanicOpen} 
                onClose={() => setIsPanicOpen(false)} 
              />
              <PergunteCentral />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AnimatePresence>
          {!splashDone && (
            <SplashScreen 
              onFinish={() => {
                console.log('APP splash finished');
                setSplashDone(true);
              }} 
            />
          )}
        </AnimatePresence>
        {splashDone && <AppContent />}
      </AuthProvider>
    </AppErrorBoundary>
  );
}
