import React, { useState } from 'react';
import { Settings, Sliders, ShieldCheck } from 'lucide-react';
import { PagePlaceholder } from '../components/PagePlaceholder';
import { SecurityCompliancePanel } from '../components/configuracoes/SecurityCompliancePanel';
import { cn } from '../lib/utils';

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState<'geral' | 'preferencias' | 'seguranca'>('seguranca');

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'preferencias', label: 'Preferências', icon: Sliders },
    { id: 'seguranca', label: 'Segurança e Compliance', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <Settings className="text-white w-7 h-7" />
            </div>
            Configurações do Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Gestão de parâmetros, preferências e governança da plataforma.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2",
              activeTab === tab.id
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'geral' && (
          <PagePlaceholder 
            title="Configurações Gerais" 
            description="Gestão de usuários, permissões e parâmetros do sistema." 
            icon={Settings} 
          />
        )}
        {activeTab === 'preferencias' && (
          <PagePlaceholder 
            title="Preferências" 
            description="Ajustes de interface, notificações e personalização." 
            icon={Sliders} 
          />
        )}
        {activeTab === 'seguranca' && (
          <SecurityCompliancePanel />
        )}
      </div>
    </div>
  );
}
