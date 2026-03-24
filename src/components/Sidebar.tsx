import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import logoHorizontal from "../assets/logos/logo-horizontal.png";

export function Sidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Visão Geral",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Centro de Comando",
      icon: Shield,
      path: "/centro-comando",
    },
    {
      name: "Clientes",
      icon: Users,
      path: "/clientes",
    },
    {
      name: "Configurações",
      icon: Settings,
      path: "/configuracoes",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col justify-between">
      <div>
        <div className="h-20 border-b border-slate-100 flex items-center px-5">
          <img
            src={logoHorizontal}
            alt="Esquematiza"
            className="h-8 w-auto object-contain"
          />
        </div>

        <nav className="p-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
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
