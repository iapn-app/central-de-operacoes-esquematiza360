import { useState } from "react";
import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logoHorizontal from "../assets/logos/logo-horizontal.png";

type SidebarItem = {
  label: string;
  route: string;
  icon: keyof typeof Icons;
};

type SidebarGroup = {
  category: string;
  items: SidebarItem[];
};

const groupedModules: SidebarGroup[] = [
  {
    category: "VISÃO GERAL",
    items: [{ label: "Dashboard", route: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    category: "OPERAÇÕES",
    items: [
      { label: "Centro de Operações", route: "/operacoes", icon: "Shield" },
      { label: "Rondas", route: "/rondas", icon: "Route" },
      { label: "Ocorrências", route: "/ocorrencias", icon: "AlertTriangle" },
      { label: "Escalas", route: "/escalas", icon: "CalendarClock" },
      { label: "Vigilantes", route: "/vigilantes", icon: "Users" },
      { label: "Postos", route: "/postos", icon: "MapPinned" },
      { label: "Frota", route: "/frota", icon: "Car" },
      { label: "Portal do Cliente", route: "/portal-cliente", icon: "Briefcase" },
    ],
  },
  {
    category: "FINANCEIRO",
    items: [
      { label: "Dashboard Financeiro", route: "/financeiro", icon: "DollarSign" },
      { label: "Lançamentos", route: "/financeiro/lancamentos", icon: "Receipt" },
      { label: "Contas a Receber", route: "/financeiro/receber", icon: "Wallet" },
      { label: "Contas a Pagar", route: "/financeiro/pagar", icon: "BadgeDollarSign" },
      { label: "Cobrança", route: "/financeiro/cobranca", icon: "HandCoins" },
      { label: "Fluxo de Caixa", route: "/financeiro/fluxo-caixa", icon: "BarChart3" },
      { label: "Relatórios", route: "/financeiro/relatorios", icon: "FileText" },
    ],
  },
  {
    category: "INTELIGÊNCIA",
    items: [
      { label: "Inteligência Operacional", route: "/inteligencia-operacional", icon: "Brain" },
      { label: "Mapa de Risco", route: "/mapa-risco", icon: "Map" },
      { label: "Performance", route: "/performance", icon: "TrendingUp" },
      { label: "Simulador de Risco", route: "/simulador-risco", icon: "Radar" },
    ],
  },
  {
    category: "ADMIN",
    items: [
      { label: "Contratos", route: "/contratos", icon: "FileSignature" },
      { label: "Configurações", route: "/configuracoes", icon: "Settings" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[90px]" : "w-[260px]"
      }`}
    >
      {/* HEADER */}
      <div className="h-[70px] flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <>
            <img
              src={logoHorizontal}
              alt="Esquematiza"
              className="w-[180px] object-contain"
            />

            <button
              onClick={() => setCollapsed(true)}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-10 h-10 mx-auto rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-6">
          {groupedModules.map((group) => (
            <div key={group.category}>
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase mb-2">
                  {group.category}
                </h3>
              )}

              {group.items.map((item) => {
                const IconComponent = Icons[item.icon] || Icons.Circle;

                return (
                  <NavLink
                    key={item.route}
                    to={item.route}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-sm font-medium mb-1 transition ${
                        collapsed
                          ? "justify-center py-3"
                          : "justify-between px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-[#333a56] text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                          <IconComponent className="w-4 h-4" />
                          {!collapsed && <span>{item.label}</span>}
                        </div>

                        {!collapsed && isActive && (
                          <ChevronRight className="w-4 h-4 opacity-80" />
                        )}
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
        <button
          className={`flex items-center w-full text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 text-sm ${
            collapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Encerrar</span>}
        </button>
      </div>
    </aside>
  );
}
