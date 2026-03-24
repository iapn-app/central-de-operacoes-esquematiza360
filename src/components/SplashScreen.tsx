import { useEffect } from "react";
import logoSymbol from "@/assets/logos/logo-symbol.png";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <img
        src={logoSymbol}
        alt="Esquematiza"
        className="w-20 h-20 object-contain"
      />
    </div>
  );
}
