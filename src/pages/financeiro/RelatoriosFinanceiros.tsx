import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, BarChart3, TrendingUp, Calendar, Filter, ChevronRight } from 'lucide-react';
import { ActionButton, SectionCard, PageHeader } from './components/FinanceComponents';
import { Modal } from '../../components/Modal';

const REPORTS = [
  { id: 'dre', title: 'DRE Gerencial', description: 'Demonstrativo de Resultados do Exercício com detalhamento de receitas, custos e despesas.', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'fluxo', title: 'Fluxo de Caixa', description: 'Relatório de entradas e saídas financeiras, com projeções e saldos bancários.', icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'rentabilidade', title: 'Rentabilidade por Contrato', description: 'Análise detalhada da margem de contribuição e lucratividade de cada cliente/operação.', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'inadimplencia', title: 'Relatório de Inadimplência', description: 'Listagem de clientes com faturas em atraso, dias de atraso e valores devidos.', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
];

export function RelatoriosFinanceiros() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleExportClick = (reportId: string) => {
    setSelectedReport(reportId);
    setIsExportModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader 
        title="Central de Relatórios" 
        subtitle="Exportação e análise de dados financeiros"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((report) => (
          <div key={report.id} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.bg} ${report.color}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-soft-black dark:text-white mb-2 group-hover:text-brand-green transition-colors">{report.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{report.description}</p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleExportClick(report.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-brand-green hover:text-white dark:hover:bg-brand-green transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-brand-green hover:bg-brand-green/10 transition-colors">
                    Visualizar
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Exportar: ${REPORTS.find(r => r.id === selectedReport)?.title || 'Relatório'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Período</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="current_month">Mês Atual</option>
                <option value="last_month">Mês Anterior</option>
                <option value="q1">1º Trimestre</option>
                <option value="ytd">Acumulado do Ano (YTD)</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Formato do Arquivo</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-brand-green bg-brand-green/5 text-brand-green font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                  <FileText className="w-4 h-4" />
                  Excel (XLSX)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsExportModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                setTimeout(() => setIsExportModalOpen(false), 800);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              <Download className="w-4 h-4" />
              Baixar Arquivo
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
