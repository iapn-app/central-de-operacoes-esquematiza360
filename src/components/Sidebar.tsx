import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logoHorizontal from "../assets/logos/logo-horizontal.png";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

type SidebarItem = {
  id: string;
  label: string;
  route: string;
  icon: keyof typeof Icons;
};

type SidebarGroup = {
  category: string;
  items: SidebarItem[];
};

const ALL_MODULES: SidebarGroup[] = [
  {
    category: "VISÃO GERAL",
    items: [
      { id: "dashboard", label: "Dashboard", route: "/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    category: "OPERAÇÕES",
    items: [
      { id: "operacoes",      label: "Centro de Operações", route: "/operacoes",      icon: "Shield" },
      { id: "rondas",         label: "Rondas",              route: "/rondas",         icon: "Route" },
      { id: "ocorrencias",    label: "Ocorrências",         route: "/ocorrencias",    icon: "AlertTriangle" },
      { id: "escalas",        label: "Escalas",             route: "/escalas",        icon: "CalendarClock" },
      { id: "vigilantes",     label: "Vigilantes",          route: "/vigilantes",     icon: "Users" },
      { id: "postos",         label: "Postos",              route: "/postos",         icon: "MapPinned" },
      { id: "frota",          label: "Frota",               route: "/frota",          icon: "Car" },
      { id: "portal-cliente", label: "Portal do Cliente",   route: "/portal-cliente", icon: "Briefcase" },
    ],
  },
  {
    category: "FINANCEIRO",
    items: [
      { id: "financeiro",     label: "Dashboard Financeiro", route: "/financeiro",               icon: "DollarSign" },
      { id: "lancamentos",    label: "Lançamentos",          route: "/financeiro/lancamentos",   icon: "Receipt" },
      { id: "receber",        label: "Contas a Receber",     route: "/financeiro/receber",       icon: "Wallet" },
      { id: "pagar",          label: "Contas a Pagar",       route: "/financeiro/pagar",         icon: "BadgeDollarSign" },
      { id: "inadimplencia",  label: "Inadimplência",        route: "/financeiro/inadimplencia", icon: "AlertTriangle" },
      { id: "cobranca",       label: "Cobrança",             route: "/financeiro/cobranca",      icon: "HandCoins" },
      { id: "caixa-bancos",   label: "Caixa e Bancos",       route: "/financeiro/caixa-bancos",  icon: "Landmark" },
      { id: "fluxo-caixa",    label: "Fluxo de Caixa",       route: "/financeiro/fluxo-caixa",   icon: "BarChart3" },
      { id: "dre",            label: "DRE Gerencial",        route: "/financeiro/dre",           icon: "PieChart" },
      { id: "relatorios-fin",   label: "Relatórios",           route: "/financeiro/relatorios",    icon: "FileText" },
      { id: "rentabilidade",      label: "Rentabilidade",        route: "/financeiro/rentabilidade", icon: "TrendingUp" },
    ],
  },
  {
    category: "INTELIGÊNCIA",
    items: [
      { id: "inteligencia-operacional", label: "Inteligência Operacional", route: "/inteligencia-operacional", icon: "Brain" },
      { id: "mapa-risco",               label: "Mapa de Risco",            route: "/mapa-risco",               icon: "Map" },
      { id: "performance",              label: "Performance",              route: "/performance",              icon: "TrendingUp" },
      { id: "simulador-risco",          label: "Simulador de Risco",       route: "/simulador-risco",          icon: "Radar" },
    ],
  },
  {
    category: "ADMIN",
    items: [
      { id: "contratos",     label: "Contratos",     route: "/contratos",     icon: "FileSignature" },
      { id: "configuracoes", label: "Configurações", route: "/configuracoes", icon: "Settings" },
    ],
  },
];

// ─── Módulos visíveis por role ─────────────────────────────────────────────
const MODULOS_FINANCEIRO = [
  "dashboard",
  "financeiro", "lancamentos", "receber", "pagar",
  "inadimplencia", "cobranca", "caixa-bancos", "fluxo-caixa", "dre", "relatorios-fin",
];

// Único email com acesso total incluindo Configurações
const EMAIL_ADMIN_MASTER = "mellaurj@gmail.com";

function filtrarModulosPorRole(role: string | undefined, email: string | undefined, modulosAtivos: Record<string, boolean>): SidebarGroup[] {
  const temConfiguracoes = Object.keys(modulosAtivos).length > 0;
  const isAdminMaster = role === 'admin_master' && email === EMAIL_ADMIN_MASTER;

  return ALL_MODULES
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Financeiro: só vê módulos financeiros
        if (role === 'financeiro') return MODULOS_FINANCEIRO.includes(item.id);
        // Admin master real (Mellau): acesso total + respeita toggles
        if (isAdminMaster) {
          if (!temConfiguracoes) return true;
          return modulosAtivos[item.id] !== false;
        }
        // Demais (Douglas, Panza, William): tudo exceto configuracoes
        return item.id !== 'configuracoes';
      }),
    }))
    .filter(group => group.items.length > 0);
}

const STORAGE_KEY = 'esquematiza_modulos_ativos';

function lerModulosAtivos(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const [modulosAtivos, setModulosAtivos] = useState<Record<string, boolean>>(lerModulosAtivos);

  useEffect(() => {
    function handleAtualizar() { setModulosAtivos(lerModulosAtivos()); }
    window.addEventListener('modulos-atualizados', handleAtualizar);
    window.addEventListener('focus', handleAtualizar);
    return () => {
      window.removeEventListener('modulos-atualizados', handleAtualizar);
      window.removeEventListener('focus', handleAtualizar);
    };
  }, []);

  const grupos = filtrarModulosPorRole(profile?.role, profile?.email, modulosAtivos);

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${collapsed ? "w-[90px]" : "w-[260px]"}`}>

      {/* HEADER */}
      <div className="h-[70px] flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <>
            <img src={logoHorizontal} alt="Esquematiza" className="w-[180px] object-contain" />
            <button onClick={onToggle} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="w-10 h-10 mx-auto rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition">
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-6">
          {grupos.map((group) => (
            <div key={group.category}>
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase mb-2">{group.category}</h3>
              )}
              {group.items.map((item) => {
                const IconComponent = (Icons[item.icon] as React.ElementType) || Icons.Circle;
                return (
                  <NavLink
                    key={item.route}
                    to={item.route}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-sm font-medium mb-1 transition ${collapsed ? "justify-center py-3" : "justify-between px-3 py-2.5"} ${isActive ? "bg-[#333a56] text-white" : "text-slate-600 hover:bg-slate-100"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                          <IconComponent className="w-4 h-4" />
                          {!collapsed && <span>{item.label}</span>}
                        </div>
                        {!collapsed && isActive && <ChevronRight className="w-4 h-4 opacity-80" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-100">
        {!collapsed && profile?.nome && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-slate-700 truncate">{profile.nome}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile.email}</p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          className={`w-full flex items-center text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors ${collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Encerrar sessão</span>}
        </button>
      </div>
    </aside>
  );
}
