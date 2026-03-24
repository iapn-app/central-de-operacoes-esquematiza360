import { useEffect } from "react";
import { motion } from "framer-motion";
import logoSymbol from "../assets/logos/logo-symbol.png";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinish();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ scale: [0.9, 1.1, 0.95], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute w-56 h-56 rounded-full border border-emerald-500/15"
        animate={{ scale: [0.8, 1.25], opacity: [0.45, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />

      <motion.div
        className="absolute w-72 h-72 rounded-full border border-emerald-500/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-28 h-28 rounded-[28px] border border-emerald-500/35 bg-black/70 shadow-[0_0_40px_rgba(16,185,129,0.16)] backdrop-blur-sm flex items-center justify-center"
        >
          <motion.img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-14 h-14 object-contain"
            animate={{ opacity: [0.82, 1, 0.82] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-7 text-[11px] tracking-[0.42em] text-emerald-400 uppercase"
        >
          Central 360° de Operações
        </motion.p>
      </div>
    </div>
  );
}
