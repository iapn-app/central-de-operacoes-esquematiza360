import { useState } from "react";
import { PergunteCentral } from "./AssistantChat";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      
      {/* SIDEBAR — passa estado e setter para sincronizar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* CONTEÚDO — margem dinâmica acompanha a sidebar */}
      <div
        className="flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: collapsed ? 90 : 260, flex: 1 }}
      >

        {/* HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">
            ESQUEMATIZA CENTRAL 360
          </h1>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
    <PergunteCentral />
  );
}
