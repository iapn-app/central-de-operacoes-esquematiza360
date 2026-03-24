import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import logoHorizontal from "../assets/logos/logo-horizontal.png";
import { supabase } from "../lib/supabase";

type SidebarItem = {
  name: string;
  path: string;
  icon?: any;
};

export function Sidebar() {
  const location = useLocation();
  const [modules, setModules] = useState<SidebarItem[]>([]);

  useEffect(() => {
    async function loadSidebar() {
      const { data, error } = await supabase.rpc(
        "get_my_sidebar_modules"
      );

      if (!error && data) {
        setModules(data);
      }
    }

    loadSidebar();
  }, []);

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
