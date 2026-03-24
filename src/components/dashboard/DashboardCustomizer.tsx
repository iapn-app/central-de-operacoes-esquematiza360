import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Modal } from '../Modal';

export const availableKPIs = [
  "Saldo Total",
  "Entrou Hoje",
  "Saiu Hoje",
  "Em Atraso",
  "Previsto 7 Dias",
  "Previsto 30 Dias",
  "Faturamento Mensal",
  "Taxa de Inadimplência",
  "Contratos Ativos",
  "Ticket Médio",
  "Ocorrências do Dia",
  "Alertas Críticos",
  "Postos Monitorados",
  "Disponibilidade da Frota",
  "Score Operacional"
];

interface DashboardCustomizerProps {
  onSave: (kpis: string[]) => void;
  currentKPIs: string[];
}

export function DashboardCustomizer({ onSave, currentKPIs }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(currentKPIs);

  useEffect(() => {
    setSelectedKPIs(currentKPIs);
  }, [currentKPIs]);

  const toggleKPI = (kpi: string) => {
    if (selectedKPIs.includes(kpi)) {
      setSelectedKPIs(selectedKPIs.filter(k => k !== kpi));
    } else {
      setSelectedKPIs([...selectedKPIs, kpi]);
    }
  };

  const save = () => {
    onSave(selectedKPIs);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green-dark transition-all"
      >
        <Plus size={16} />
        Personalizar Dashboard
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Personalizar KPIs" maxWidth="max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Selecione os KPIs que deseja visualizar:</p>
          <div className="space-y-2">
            {availableKPIs.map(kpi => (
              <label key={kpi} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={selectedKPIs.includes(kpi)}
                  onChange={() => toggleKPI(kpi)}
                  className="accent-brand-green"
                />
                <span className="text-sm font-bold text-soft-black dark:text-white">{kpi}</span>
              </label>
            ))}
          </div>
          <button
            onClick={save}
            className="w-full py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green-dark transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </Modal>
    </>
  );
}
