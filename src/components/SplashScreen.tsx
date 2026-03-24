import { useEffect } from "react";
import logoSymbol from "../assets/logos/logo-symbol.png";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onFinish();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <img
        src={logoSymbol}
        alt="Esquematiza"
        className="w-24 h-24 object-contain opacity-95"
      />
    </div>
  );
}
