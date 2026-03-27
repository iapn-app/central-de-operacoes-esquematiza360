import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { PergunteCentral } from "./AssistantChat";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ChevronDown, Shield, Camera, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const EMAIL_ADMIN_MASTER = "mellaurj@gmail.com";

function getRoleInfo(role: string | undefined, email: string | undefined) {
  if (role === 'admin_master' && email === EMAIL_ADMIN_MASTER)
    return { label: "Administrador Master", cor: "bg-purple-100 text-purple-700" };
  if (role === 'admin_master')
    return { label: "Diretor", cor: "bg-blue-100 text-blue-700" };
  if (role === 'financeiro')
    return { label: "Financeiro", cor: "bg-amber-100 text-amber-700" };
  return { label: role ?? "Usuário", cor: "bg-slate-100 text-slate-600" };
}

// ─── Modal de edição de perfil ─────────────────────────────────────────────

function ModalPerfil({ onClose, avatarUrl, onAvatarChange }: {
  onClose: () => void;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}) {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      setErro("Imagem muito grande. Máximo 2MB.");
      return;
    }

    setUploading(true);
    setErro(null);

    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${profile.id}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('profiles').getPublicUrl(path);
      const url = data.publicUrl + '?t=' + Date.now();
      onAvatarChange(url);
      localStorage.setItem(`avatar_${profile.id}`, url);
    } catch (err: any) {
      setErro("Erro ao enviar foto. Tente novamente.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const iniciais = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Meu Perfil</h2>
          <button onClick={onClose} style={{ cursor: "pointer" }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Avatar + upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#333a56] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {iniciais}
                </div>
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{ cursor: "pointer" }}
                className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow transition"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
            <p className="text-xs text-slate-400">
              {uploading ? "Enviando..." : "Clique na câmera para trocar a foto"}
            </p>
            {erro && <p className="text-xs text-red-500">{erro}</p>}
          </div>

          {/* Dados do perfil */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Nome</p>
              <p className="text-sm font-semibold text-slate-800">{profile?.nome ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">E-mail</p>
              <p className="text-sm text-slate-600">{profile?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Perfil de acesso</p>
              <p className="text-sm text-slate-600">{getRoleInfo(profile?.role, profile?.email).label}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} style={{ cursor: "pointer" }}
            className="w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Menu do usuário no header ─────────────────────────────────────────────

function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (!profile?.id) return null;
    return localStorage.getItem(`avatar_${profile.id}`);
  });
  const ref = useRef<HTMLDivElement>(null);

  // Carrega avatar salvo quando profile chega
  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(`avatar_${profile.id}`);
      if (saved) setAvatarUrl(saved);
    }
  }, [profile?.id]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roleInfo = getRoleInfo(profile?.role, profile?.email);

  const iniciais = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const Avatar = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const cls = size === "lg"
      ? "w-10 h-10 text-sm"
      : "w-8 h-8 text-xs";
    return avatarUrl ? (
      <img src={avatarUrl} alt="Avatar" className={`${cls} rounded-full object-cover flex-shrink-0 border-2 border-white shadow`} />
    ) : (
      <div className={`${cls} rounded-full bg-[#333a56] flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {iniciais}
      </div>
    );
  };

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          style={{ cursor: "pointer", pointerEvents: "auto" }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
        >
          <Avatar size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {profile?.nome ?? "Carregando..."}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">{profile?.email ?? ""}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {/* Cabeçalho */}
            <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <Avatar size="lg" />
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
            <div className="p-2 space-y-1">
              <button
                onClick={() => { setOpen(false); setShowModal(true); }}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition text-left"
              >
                <Camera className="w-4 h-4 text-slate-400" />
                Meu perfil / Trocar foto
              </button>
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

      {showModal && (
        <ModalPerfil
          onClose={() => setShowModal(false)}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
        />
      )}
    </>
  );
}

// ─── Layout principal ──────────────────────────────────────────────────────

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
