import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import logoSymbol from "@/assets/logos/logo-symbol.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Login:", { email, password });
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-20 h-20 object-contain mb-5"
          />

          <h1 className="text-[2.1rem] font-extrabold text-slate-900 text-center leading-none">
            GRUPO ESQUEMATIZA
          </h1>

          <p className="text-[0.72rem] tracking-[0.42em] text-emerald-600 text-center mt-3 uppercase">
            CENTRAL 360° DE OPERAÇÕES
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                E-mail Corporativo
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-slate-100/80 border border-slate-200 pl-12 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Senha de Acesso
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-slate-100/80 border border-slate-200 pl-12 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Lembrar acesso</span>
              </label>

              <button
                type="button"
                className="text-emerald-600 font-medium hover:text-emerald-700 transition"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-slate-300 text-white font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.18)] hover:bg-emerald-600 transition"
            >
              <span>ENTRAR NO SISTEMA</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          © 2024 Grupo Esquematiza Segurança Patrimonial. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
