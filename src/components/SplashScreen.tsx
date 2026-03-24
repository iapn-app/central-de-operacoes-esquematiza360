import { useEffect } from "react";
import logoSymbol from "../assets/logos/logo-symbol.png";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinish();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-3xl border border-emerald-500/40 bg-white/5 backdrop-blur-sm shadow-[0_0_40px_rgba(16,185,129,0.18)] flex items-center justify-center">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-16 h-16 object-contain"
          />
        </div>

        <p className="mt-5 text-[11px] tracking-[0.35em] text-emerald-400/90 uppercase">
          Central 360° de Operações
        </p>
      </div>
    </div>
  );
}
