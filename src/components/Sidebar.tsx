import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import {
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react";
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
    items: [
      { label: "Dashboard", route: "/dashboard", icon: "LayoutDashboard" },
    ],
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
  return (
    <aside className="fixed left-0 top-0 z-40 w-72 h-screen bg-white border-r border-slate-200 flex flex-col justify-between overflow-hidden">
      <div>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={logoHorizontal}
              alt="Esquematiza"
              className="w-[150px] h-auto object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {groupedModules.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {group.category}
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = Icons[item.icon] || Icons.Circle;

                  return (
                    <NavLink
                      key={item.route}
                      to={item.route}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-opacity ${
                              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-red-600 transition-all rounded-xl hover:bg-red-50 font-medium text-sm">
          <LogOut className="w-5 h-5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
