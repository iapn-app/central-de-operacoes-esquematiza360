import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Settings,
  Users,
  LogOut
} from "lucide-react";

import logoHorizontal from "@/assets/logos/logo-horizontal.png";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Visão Geral",
      icon: LayoutDashboard,
      path: "/dashboard"
    },
    {
      name: "Centro de Comando",
      icon: Shield,
      path: "/centro-comando"
    },
    {
      name: "Clientes",
      icon: Users,
      path: "/clientes"
    },
    {
      name: "Configurações",
      icon: Settings,
      path: "/configuracoes"
    }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col justify-between">
      
      {/* TOPO */}
      <div>
        <div className="flex items-center justify-center h-20 border-b">
          <img
            src={logoHorizontal}
            alt="Esquematiza"
            className="h-10 object-contain"
          />
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 text-gray-600 hover:text-red-500">
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
