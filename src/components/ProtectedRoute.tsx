import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock } from 'lucide-react';
import logoSymbol from '../assets/logos/logo-symbol.png';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-8">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-24 h-24 object-contain"
          />
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#333A56]" />
            <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">
              Verificando acesso...
            </p>
          </div>
        </div>
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
