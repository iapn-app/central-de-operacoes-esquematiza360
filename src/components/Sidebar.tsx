import { useLocation, Link } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";
import logoHorizontal from "../assets/logos/logo-horizontal.png";

type SidebarItem = {
  label: string;
  route: string;
  icon: any;
};

export function Sidebar() {
  const location = useLocation();

  const modules: SidebarItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: LayoutDashboard },
    { label: "Operações", route: "/operacoes", icon: Shield },
    { label: "Financeiro", route: "/financeiro", icon: DollarSign },
    { label: "RH", route: "/rh", icon: Users },
    { label: "Configurações", route: "/configuracoes", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between">
      <div>
        <div className="h-20 border-b border-slate-100 flex items-center px-4">
          <img
            src={logoHorizontal}
            alt="Esquematiza"
            className="w-[160px] h-auto object-contain"
          />
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {modules.map((item) => {
            const active = location.pathname === item.route;
            const Icon = item.icon;

            return (
              <Link
                key={item.route}
                to={item.route}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-500 transition">
          <LogOut size={18} />
          <span className="text-sm font-medium">Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
