import { useState } from "react";
import logoSymbol from "@/assets/logos/logo-symbol.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login:", email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        
        {/* LOGO + TÍTULO */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoSymbol}
            alt="Esquematiza"
            className="w-20 h-20 object-contain mb-4"
          />

          <h1 className="text-2xl font-bold text-gray-900">
            GRUPO ESQUEMATIZA
          </h1>

          <p className="text-xs tracking-[0.35em] text-emerald-600 mt-1 text-center">
            CENTRAL 360° DE OPERAÇÕES
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="text-sm text-gray-600">
              E-mail Corporativo
            </label>
            <input
              type="email"
              placeholder="seuemail@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Senha de Acesso
            </label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Lembrar acesso
            </label>

            <button
              type="button"
              className="text-emerald-600 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            ENTRAR NO SISTEMA →
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Grupo Esquematiza Segurança Patrimonial
        </p>
      </div>
    </div>
  );
}
