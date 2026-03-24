import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between">
          <h1 className="text-lg font-semibold">
            ESQUEMATIZA CENTRAL 360
          </h1>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
