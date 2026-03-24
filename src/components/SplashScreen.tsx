import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);
  const [scanText, setScanText] = useState("INICIANDO PROTOCOLOS...");

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 4000);
    const t3 = setTimeout(() => onFinish(), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  useEffect(() => {
    if (stage !== 1) return;
    const t1 = setTimeout(() => setScanText("VERIFICANDO CRIPTOGRAFIA..."), 1000);
    const t2 = setTimeout(() => setScanText("AUTENTICAÇÃO BIOMÉTRICA..."), 2000);
    const t3 = setTimeout(() => setScanText("ACESSO LIBERADO"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stage]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* STAGE 1 — Biometric Security Scan */}
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            key="biometric"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.6 } }}
            transition={{ duration: 0.5 }}
          >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Central Scanner */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Rotating outer rings */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-emerald-500/20 border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border border-emerald-500/10 border-dotted"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-8 rounded-full border border-emerald-500/5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Fingerprint */}
              <div className="relative w-24 h-24">
                <Fingerprint className="w-full h-full text-emerald-900/40" strokeWidth={1} />
                
                {/* Glowing Fingerprint revealed by scanner */}
                <motion.div 
                  className="absolute inset-0 overflow-hidden"
                  animate={{ height: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Fingerprint className="w-full h-full text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" strokeWidth={1} />
                </motion.div>

                {/* Laser line */}
                <motion.div 
                  className="absolute left-[-20%] right-[-20%] h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,1)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Status Text & Progress */}
            <div className="mt-12 flex flex-col items-center gap-4 z-10">
              <motion.div 
                key={scanText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "font-mono text-xs tracking-[0.3em] flex items-center gap-2",
                  scanText === "ACESSO LIBERADO" ? "text-emerald-400 font-bold" : "text-emerald-500/70"
                )}
              >
                {scanText === "ACESSO LIBERADO" && <CheckCircle2 className="w-4 h-4" />}
                {scanText === "VERIFICANDO CRIPTOGRAFIA..." && <Lock className="w-3 h-3" />}
                {scanText}
              </motion.div>
              
              <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                />
              </div>
            </div>
            
            {/* HUD Elements */}
            <div className="absolute top-8 left-8 text-emerald-500/40 font-mono text-[10px] tracking-widest space-y-1">
              <p>SYS.VER: 3.0.4</p>
              <p>SEC.LEVEL: MAXIMUM</p>
              <p>NODE: ALPHA-7</p>
            </div>
            <div className="absolute bottom-8 right-8 text-emerald-500/40 font-mono text-[10px] tracking-widest text-right space-y-1">
              <p>ENCRYPTION: AES-256</p>
              <p>NETWORK: SECURE</p>
              <p>STATUS: ONLINE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE 2 — Logo */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.div
            key="logo"
            className="relative z-10 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <motion.div
              className="bg-brand-green w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative"
              style={{ boxShadow: '0 0 60px rgba(16,185,129,0.5)' }}
              initial={{ rotate: -180, opacity: 0, y: 40 }}
              animate={{ rotate: 0, opacity: 1, y: 0 }}
              transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
            >
              <div
                className="absolute inset-0 rounded-3xl border-2 border-emerald-400/30 animate-ping"
                style={{ animationDuration: '3s' }}
              />
              <Shield className="text-white w-12 h-12" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
                ESQUEMATIZA
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 tracking-[0.3em] mb-6">
                CENTRAL 360
              </h2>
            </motion.div>

            <motion.div
              className="h-[1px] w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-6"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />

            <motion.p
              className="text-gray-400 text-sm md:text-base uppercase tracking-[0.4em] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Sistema Inteligente de Gestão Operacional
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
