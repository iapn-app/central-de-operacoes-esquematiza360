import { useEffect, useRef } from "react";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => onFinish(), 4200);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLS = Math.ceil(window.innerWidth / 60) + 1;
    const ROWS = Math.ceil(window.innerHeight / 60) + 1;

    const dots: any[] = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (Math.random() > 0.6) {
          dots.push({
            x: c * 60, y: r * 60,
            baseOpacity: Math.random() * 0.15 + 0.02,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.005,
          });
        }
      }
    }

    const floats: any[] = [];
    for (let i = 0; i < 60; i++) {
      floats.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0,255,157,0.04)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * 60, 0); ctx.lineTo(c * 60, canvas.height); ctx.stroke();
      }
      for (let r = 0; r < ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * 60); ctx.lineTo(canvas.width, r * 60); ctx.stroke();
      }

      dots.forEach(p => {
        const op = p.baseOpacity * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
        ctx.fillStyle = `rgba(0,255,157,${op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill();
      });

      floats.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const flicker = 0.6 + 0.4 * Math.sin(t * 0.05 + p.phase);
        ctx.fillStyle = `rgba(0,255,157,${p.opacity * flicker})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });

      const sweepY = (t * 0.4) % canvas.height;
      const grad = ctx.createLinearGradient(0, sweepY - 60, 0, sweepY + 4);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(0,255,157,0.04)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 60, canvas.width, 64);

      t++;
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", zIndex: 9999,
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    }}>
      {/* Google Fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;600;700&display=swap" />

      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)"
      }} />

      {/* HUD corner TL */}
      <div style={{ position: "absolute", top: 32, left: 32, zIndex: 10, animation: "fadeIn 0.4s 0.2s ease forwards", opacity: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="rgba(0,255,157,0.6)" strokeWidth="1.5"/>
          <path d="M2 12 L12 2" stroke="rgba(0,255,157,0.3)" strokeWidth="1"/>
          <circle cx="2" cy="2" r="2" fill="#00ff9d"/>
        </svg>
      </div>
      {/* HUD corner TR */}
      <div style={{ position: "absolute", top: 32, right: 32, zIndex: 10, transform: "scaleX(-1)", animation: "fadeIn 0.4s 0.3s ease forwards", opacity: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="rgba(0,255,157,0.6)" strokeWidth="1.5"/>
          <path d="M2 12 L12 2" stroke="rgba(0,255,157,0.3)" strokeWidth="1"/>
          <circle cx="2" cy="2" r="2" fill="#00ff9d"/>
        </svg>
      </div>
      {/* HUD corner BL */}
      <div style={{ position: "absolute", bottom: 32, left: 32, zIndex: 10, transform: "scaleY(-1)", animation: "fadeIn 0.4s 0.4s ease forwards", opacity: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="rgba(0,255,157,0.6)" strokeWidth="1.5"/>
          <circle cx="2" cy="2" r="2" fill="#00ff9d"/>
        </svg>
      </div>
      {/* HUD corner BR */}
      <div style={{ position: "absolute", bottom: 32, right: 32, zIndex: 10, transform: "scale(-1)", animation: "fadeIn 0.4s 0.5s ease forwards", opacity: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M2 30 L2 2 L30 2" stroke="rgba(0,255,157,0.6)" strokeWidth="1.5"/>
          <circle cx="2" cy="2" r="2" fill="#00ff9d"/>
        </svg>
      </div>

      {/* Status bars */}
      <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", zIndex: 10, fontSize: 10, color: "#00ff9d", letterSpacing: "0.15em", animation: "fadeIn 0.4s 0.6s ease forwards", opacity: 0, whiteSpace: "nowrap" }}>
        SISTEMA // CENTRAL DE OPERAÇÕES 360° // VERSÃO 4.1.0
      </div>
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 10, fontSize: 10, color: "rgba(0,255,157,0.5)", letterSpacing: "0.15em", animation: "fadeIn 0.4s 0.7s ease forwards", opacity: 0, whiteSpace: "nowrap" }}>
        © GRUPO ESQUEMATIZA SEGURANÇA PATRIMONIAL — ACESSO RESTRITO
      </div>
      <div style={{ position: "absolute", left: 40, top: "50%", transform: "translateY(-50%) rotate(-90deg)", zIndex: 10, fontSize: 10, color: "rgba(0,255,157,0.35)", letterSpacing: "0.12em", animation: "fadeIn 0.4s 0.8s ease forwards", opacity: 0, whiteSpace: "nowrap" }}>
        LAT -22.9068 // LON -43.1729 // UTC-3
      </div>
      <div style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%) rotate(90deg)", zIndex: 10, fontSize: 10, color: "rgba(0,255,157,0.35)", letterSpacing: "0.12em", animation: "fadeIn 0.4s 0.9s ease forwards", opacity: 0, whiteSpace: "nowrap" }}>
        CRIPTOGRAFIA AES-256 // ATIVA
      </div>

      {/* Center content */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Emblem */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48, animation: "emblemIn 1s 0.5s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }}>
          {[180, 140, 100].map((size, i) => (
            <div key={i} style={{
              position: "absolute", width: size, height: size, borderRadius: "50%",
              border: "1px solid rgba(0,255,157,0.12)",
              animation: `spin${i % 2 === 0 ? "Fwd" : "Rev"} ${[20, 12, 8][i]}s linear infinite`,
              borderTopColor: i === 0 ? "rgba(0,255,157,0.6)" : undefined,
              borderRightColor: i === 1 ? "rgba(0,255,157,0.4)" : undefined,
              borderBottomColor: i === 2 ? "rgba(0,255,157,0.25)" : undefined,
            }} />
          ))}
          <div style={{
            position: "relative", width: 72, height: 72, zIndex: 2,
            background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.3)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div style={{ textAlign: "center", animation: "slideUp 0.8s 0.9s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.4em", color: "rgba(0,255,157,0.5)", marginBottom: 12, fontFamily: "'Share Tech Mono', monospace" }}>
            GRUPO ESQUEMATIZA
          </div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, letterSpacing: "0.08em", color: "#fff", lineHeight: 1 }}>
            CENTRAL <span style={{ color: "#00ff9d" }}>360°</span>
          </div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, letterSpacing: "0.35em", color: "rgba(0,255,157,0.7)", marginTop: 10 }}>
            PLATAFORMA DE OPERAÇÕES INTEGRADAS
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "32px 0", width: 320, animation: "fadeIn 0.6s 1.2s ease forwards", opacity: 0 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(0,255,157,0.2)" }} />
          <div style={{ width: 6, height: 6, background: "#00ff9d", transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, height: 1, background: "rgba(0,255,157,0.2)" }} />
        </div>

        {/* Load bar */}
        <div style={{ width: 320, animation: "fadeIn 0.6s 1.3s ease forwards", opacity: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(0,255,157,0.4)", letterSpacing: "0.15em", marginBottom: 8 }}>
            <span id="splash-label">INICIALIZANDO MÓDULOS</span>
            <span id="splash-pct">0%</span>
          </div>
          <div style={{ height: 2, background: "rgba(0,255,157,0.1)", position: "relative", overflow: "hidden" }}>
            <div id="splash-fill" style={{ height: "100%", background: "#00ff9d", width: "0%", boxShadow: "0 0 8px rgba(0,255,157,0.8)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Status grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", marginTop: 28, width: 320, animation: "fadeIn 0.6s 1.6s ease forwards", opacity: 0 }}>
          {[
            { label: "BANCO DE DADOS", online: true },
            { label: "AUTENTICAÇÃO", online: true },
            { label: "MÓDULOS ATIVOS", online: true },
            { label: "IA OPERACIONAL", online: false },
          ].map(({ label, online }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: online ? "#00ff9d" : "#fbbf24",
                boxShadow: online ? "0 0 6px rgba(0,255,157,0.8)" : "0 0 6px rgba(251,191,36,0.8)",
              }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes emblemIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes spinFwd { to { transform: rotate(360deg); } }
        @keyframes spinRev { to { transform: rotate(-360deg); } }
      `}</style>

      <LoadingScript />
    </div>
  );
}

function LoadingScript() {
  useEffect(() => {
    const labels = ["INICIALIZANDO MÓDULOS", "VERIFICANDO CREDENCIAIS", "CARREGANDO OPERAÇÕES", "SINCRONIZANDO DADOS", "SISTEMA PRONTO"];
    const steps = [
      { target: 12, delay: 1500 },
      { target: 38, delay: 2000 },
      { target: 65, delay: 2600 },
      { target: 83, delay: 3200 },
      { target: 100, delay: 3800 },
    ];

    let pct = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        const labelEl = document.getElementById("splash-label");
        if (labelEl) labelEl.textContent = labels[i];
        const interval = setInterval(() => {
          if (pct >= step.target) { clearInterval(interval); return; }
          pct++;
          const pctEl = document.getElementById("splash-pct");
          const fillEl = document.getElementById("splash-fill");
          if (pctEl) pctEl.textContent = pct + "%";
          if (fillEl) fillEl.style.width = pct + "%";
        }, 20);
        timers.push(interval as any);
      }, step.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return null;
}
