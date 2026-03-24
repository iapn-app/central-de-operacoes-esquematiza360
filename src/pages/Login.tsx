import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, isAuthenticated, profile, loading: authLoading, authError, isRecoveryMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth and profile to be fully loaded
    // Don't redirect if we are in recovery mode
    if (isAuthenticated && profile && !isRecoveryMode) {
      console.log('LOGIN: Redirecting based on role:', profile.role);
      if (profile.role === 'admin_master') {
        navigate('/');
      } else if (profile.role === 'financeiro') {
        navigate('/financeiro');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, profile, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email.trim(), password);
  }

  const isFormEmpty = !email || !password;
  const loading = authLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="bg-brand-green w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-green/20">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">GRUPO ESQUEMATIZA</h1>
          <p className="text-brand-green font-bold text-xs uppercase tracking-[0.3em] mt-1">Central 360° de Operações</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="admin@grupoesquematiza.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-brand-green focus:ring-brand-green bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" 
                  disabled={loading} 
                />
                <span className="text-gray-600 dark:text-gray-400">Lembrar acesso</span>
              </label>
              <a href="#" className="text-brand-green hover:underline font-medium">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit"
              disabled={isFormEmpty || loading}
              className="w-full bg-brand-green hover:bg-brand-green-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AUTENTICANDO...
                </>
              ) : (
                <>
                  ENTRAR NO SISTEMA
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-8">
          © 2024 Grupo Esquematiza Segurança Patrimonial. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
