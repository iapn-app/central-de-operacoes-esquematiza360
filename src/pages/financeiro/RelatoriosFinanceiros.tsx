import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, BarChart3, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import { ActionButton, PageHeader } from './components/FinanceComponents';
import { Modal } from '../../components/Modal';

const REPORTS = [
  {
    id: 'dre',
    title: 'DRE Gerencial',
    description: 'Demonstrativo de Resultados do Exercício com detalhamento de receitas, custos e despesas.',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 'fluxo',
    title: 'Fluxo de Caixa',
    description: 'Relatório de entradas e saídas financeiras, com projeções e saldos bancários.',
    icon: BarChart3,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    id: 'rentabilidade',
    title: 'Rentabilidade por Contrato',
    description: 'Análise detalhada da margem de contribuição e lucratividade de cada cliente/operação.',
    icon: TrendingUp,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    id: 'inadimplencia',
    title: 'Relatório de Inadimplência',
    description: 'Listagem de clientes com faturas em atraso, dias de atraso e valores devidos.',
    icon: FileText,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    id: 'multiempresa',
    title: 'Consolidado do Grupo',
    description: 'Visão unificada das 5 empresas: receita, custo, margem e saldo por CNPJ.',
    icon: BarChart3,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    id: 'recorrente',
    title: 'Receita Recorrente',
    description: 'Histórico de faturamento recorrente por contrato, mês a mês.',
    icon: TrendingUp,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
  },
];

export function RelatoriosFinanceiros() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [formato, setFormato] = useState<'pdf' | 'xlsx'>('pdf');

  function handleExport(id: string) {
    setSelectedReport(id);
    setIsExportModalOpen(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader
        title="Central de Relatórios"
        subtitle="Exportação e análise de dados financeiros do Grupo Esquematiza"
        actions={
          <ActionButton variant="secondary">
            <Calendar className="w-4 h-4" /> Março 2026
          </ActionButton>
        }
      />

      {/* Aviso dados */}
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Aguardando dados reais</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Os relatórios serão gerados automaticamente assim que os dados forem conectados ao Supabase.
            A estrutura de exportação (PDF/Excel) já está pronta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORTS.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${report.bg}`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 line-clamp-2">{report.description}</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleExport(report.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-emerald-600 hover:text-white transition-colors">
                      <Download className="w-4 h-4" /> Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                      Visualizar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={`Exportar: ${REPORTS.find(r => r.id === selectedReport)?.title ?? 'Relatório'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Período</label>
            <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="current_month">Mês Atual</option>
              <option value="last_month">Mês Anterior</option>
              <option value="q1">1º Trimestre</option>
              <option value="ytd">Acumulado do Ano (YTD)</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
            <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="todas">Todas as empresas (Consolidado)</option>
              {['Vigilância e Segurança', 'Serviços de Monitoramento', 'Patrimonial e Eventos', 'Prevenção de Perdas', 'Inteligência e Treinamentos'].map(e =>
                <option key={e} value={e}>ESQMT {e}</option>
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Formato</label>
            <div className="grid grid-cols-2 gap-3">
              {(['pdf', 'xlsx'] as const).map(f => (
                <button key={f} onClick={() => setFormato(f)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition ${
                    formato === f
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}>
                  <FileText className="w-4 h-4" />
                  {f === 'pdf' ? 'PDF' : 'Excel (XLSX)'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsExportModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button onClick={() => { setTimeout(() => setIsExportModalOpen(false), 600); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm">
              <Download className="w-4 h-4" /> Baixar {formato.toUpperCase()}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
