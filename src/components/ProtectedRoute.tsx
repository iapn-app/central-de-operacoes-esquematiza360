import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Rotas que o perfil 'financeiro' pode acessar
const ROTAS_FINANCEIRO = [
  '/financeiro',
  '/financeiro/lancamentos',
  '/financeiro/receber',
  '/financeiro/pagar',
  '/financeiro/cobranca',
  '/financeiro/fluxo-caixa',
  '/financeiro/relatorios',
  '/financeiro/caixa-bancos',
  '/financeiro/inadimplencia',
  '/financeiro/dre',
  '/dashboard',
];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <Shield className="w-16 h-16 text-emerald-600 relative z-10" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-4" />
        <p className="text-slate-600 font-semibold tracking-wide">Verificando acesso...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ── RBAC: perfil financeiro ──────────────────────────────────────────────
  if (profile?.role === 'financeiro') {
    const rotaAtual = location.pathname;
    const temAcesso = ROTAS_FINANCEIRO.some(r => rotaAtual === r || rotaAtual.startsWith(r + '/'));

    if (!temAcesso) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Acesso não autorizado para este perfil</h2>
            <p className="text-slate-500 text-sm">
              Seu perfil tem acesso somente ao módulo <strong>Financeiro</strong>.<br />
              Você será redirecionada automaticamente.
            </p>
            <Navigate to="/financeiro" replace />
          </div>
        </div>
      );
    }
  }

  // ── RBAC: roles explícitas ───────────────────────────────────────────────
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'financeiro') return <Navigate to="/financeiro" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
