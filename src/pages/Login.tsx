import { useState } from "react";
import logoSymbol from "../assets/logos/logo-symbol.png";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn, loading, authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) return;

    await signIn(email, password);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-20 h-20 object-contain mb-4"
          />

          <h1 className="text-[20px] md:text-[22px] font-extrabold text-slate-900 text-center">
            GRUPO ESQUEMATIZA
          </h1>

          <p className="text-[11px] tracking-[0.35em] text-emerald-600 text-center mt-2">
            CENTRAL 360° DE OPERAÇÕES
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail Corporativo
              </label>
              <input
                type="email"
                placeholder="seuemail@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                <span>Lembrar acesso</span>
              </label>

              <button
                type="button"
                className="text-emerald-600 font-medium hover:opacity-80 transition"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold tracking-wide shadow-[0_8px_20px_rgba(16,185,129,0.18)] hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "ENTRANDO..." : "ENTRAR NO SISTEMA →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          © 2024 Grupo Esquematiza Segurança Patrimonial. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
