import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { PergunteCentral } from "./AssistantChat";
import { useAuth } from "../hooks/useAuth";
import { LogOut, User, ChevronDown, Shield } from "lucide-react";

const EMAIL_ADMIN_MASTER = "mellaurj@gmail.com";

const ROLE_LABELS: Record<string, { label: string; cor: string }> = {
  admin_master: { label: "Administrador",  cor: "bg-purple-100 text-purple-700" },
  financeiro:   { label: "Financeiro",     cor: "bg-amber-100 text-amber-700" },
};

function getRoleInfo(role: string | undefined, email: string | undefined) {
  if (role === 'admin_master' && email === EMAIL_ADMIN_MASTER)
    return { label: "Administrador Master", cor: "bg-purple-100 text-purple-700" };
  if (role === 'admin_master')
    return { label: "Diretor", cor: "bg-blue-100 text-blue-700" };
  if (role === 'financeiro')
    return { label: "Financeiro", cor: "bg-amber-100 text-amber-700" };
  return { label: role ?? "Usuário", cor: "bg-slate-100 text-slate-600" };
}

function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roleInfo = getRoleInfo(profile?.role, profile?.email);

  // Iniciais do nome para o avatar
  const iniciais = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#333a56] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {iniciais}
        </div>

        {/* Nome + role */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {profile?.nome ?? "Carregando..."}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            {profile?.email ?? ""}
          </p>
        </div>

        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Cabeçalho do dropdown */}
          <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#333a56] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {iniciais}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{profile?.nome ?? "—"}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email ?? "—"}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${roleInfo.cor}`}>
                <Shield className="w-3 h-3" />
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left"
            >
              <LogOut className="w-4 h-4" />
              Encerrar sessão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="flex h-screen bg-gray-50 text-slate-900">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

        <div
          className="flex flex-col overflow-hidden transition-all duration-300"
          style={{ marginLeft: collapsed ? 90 : 260, flex: 1 }}
        >
          <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shadow-sm">
            <h1 className="text-lg font-semibold text-slate-800">
              ESQUEMATIZA CENTRAL 360
            </h1>
            <UserMenu />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <PergunteCentral />
    </>
  );
}
