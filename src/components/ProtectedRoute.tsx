import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, profile, loading, signOut } = useAuth();

  if (loading) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300 p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro de Perfil</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Não foi possível carregar seu perfil de usuário.</p>
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair do sistema
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'financeiro') {
      return <Navigate to="/financeiro" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
