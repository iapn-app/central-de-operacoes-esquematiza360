import React from 'react';
import { Settings } from 'lucide-react';
import { ActionButton, SectionCard, PageHeader } from './components/FinanceComponents';

export function AjustesFinanceiros() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Ajustes Financeiros" 
        subtitle="Configurações e regras do módulo"
      />
      <SectionCard title="Configurações do Módulo">
        <p className="text-gray-500 dark:text-gray-400 mb-8">Gerencie as configurações de contas, categorias e regras financeiras.</p>
        <div className="flex justify-end">
          <ActionButton>Salvar Alterações</ActionButton>
        </div>
      </SectionCard>
    </div>
  );
}
