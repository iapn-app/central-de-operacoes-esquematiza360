import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Shield, X, AlertTriangle, ChevronRight, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSidebar } from '../hooks/useSidebar';

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const { groupedModules, loading } = useSidebar();

  const categories = Object.entries(groupedModules);
  console.log('DEBUG: Rendering categories:', categories);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen overflow-hidden transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-green p-2 rounded-lg shadow-lg shadow-brand-green/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-soft-black dark:text-white leading-tight tracking-tight text-sm">ESQUEMATIZA</h1>
              <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Central 360°</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center p-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum módulo disponível.</p>
            </div>
          ) : (
            categories.map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    // Filter out "Financeiro" item
                    if (item.label === 'Financeiro') return null;
                    
                    // Override routes for Financeiro
                    let route = item.route;
                    if (category === 'FINANCEIRO') {
                      if (item.label === 'Dashboard Financeiro') route = '/financeiro';
                      else if (item.label === 'Lançamentos') route = '/financeiro/lancamentos';
                      else if (item.label === 'Contas a Receber') route = '/financeiro/receber';
                      else if (item.label === 'Contas a Pagar') route = '/financeiro/pagar';
                      else if (item.label === 'Cobrança') route = '/financeiro/cobranca';
                      else if (item.label === 'Fluxo de Caixa') route = '/financeiro/fluxo-caixa';
                      else if (item.label === 'Relatórios') route = '/financeiro/relatorios';
                    }

                    const IconComponent = (Icons as any)[item.icon] || Icons.LayoutDashboard;
                    return (
                      <NavLink
                        key={route}
                        to={route}
                        onClick={onClose}
                        className={({ isActive }) => cn(
                          "flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-all group",
                          isActive 
                            ? "bg-brand-green text-white shadow-md shadow-brand-green/20" 
                            : "text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green hover:bg-brand-green/5 dark:hover:bg-brand-green/10"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <IconComponent className={cn("w-4 h-4", !isActive && "group-hover:scale-110 transition-transform")} />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 transition-opacity", !isActive && "group-hover:opacity-50")} />
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
}
