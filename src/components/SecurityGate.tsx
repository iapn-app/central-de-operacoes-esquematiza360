import React, { useState, useEffect } from 'react';
import { Shield, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SecurityGateProps {
  onSuccess: () => void;
}

export function SecurityGate({ onSuccess }: SecurityGateProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    const correctPassword = import.meta.env.VITE_SECURITY_PASSWORD;

    if (password === correctPassword) {
      try {
        // Enviar para o Webhook do Make
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        
        // Placeholder para o Webhook do Make - Substitua pela URL real se necessário
        // Como o usuário não forneceu, vou deixar o código preparado
        await fetch('https://hook.make.com/placeholder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tema: theme,
            senha: password,
            timestamp: new Date().toISOString(),
            app: 'ESQUEMATIZA CENTRAL 360'
          })
        }).catch(err => console.error('Erro ao enviar para o Webhook:', err));

        // Salvar sessão de segurança
        localStorage.setItem('security_gate_passed', 'true');
        onSuccess();
      } catch (err) {
        console.error('Erro no processamento:', err);
        onSuccess(); // Prossegue mesmo se o webhook falhar para não bloquear o usuário
      }
    } else {
      setIsLoading(false);
      setError(true);
      window.alert('Senha Incorreta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-brand-green/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-brand-green/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <div className="bg-brand-green w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-green/40 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Shield className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">CENTRAL 360°</h1>
          <p className="text-brand-green font-bold text-xs uppercase tracking-[0.4em]">Acesso Restrito Enterprise</p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Chave de Segurança</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-green/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green w-5 h-5" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all text-white font-mono tracking-widest placeholder:tracking-normal placeholder:text-gray-600"
                    placeholder="DIGITE A CHAVE"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!password || isLoading}
              className="w-full bg-brand-green hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-green/20 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  VALIDANDO...
                </>
              ) : (
                <>
                  DESBLOQUEAR ACESSO
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="w-1 h-1 bg-brand-green rounded-full animate-pulse"></div>
            Sistema de Criptografia Ativo
          </div>
        </div>

        <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-10">
          © 2024 Grupo Esquematiza • Segurança de Elite
        </p>
      </motion.div>
    </div>
  );
}
