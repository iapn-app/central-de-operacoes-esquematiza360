import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Download,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Modal } from '../../components/Modal';

// Mock data for initial MVP
const MOCK_FATURAS = [
  {
    id: 'FAT-2026-001',
    cliente: 'Condomínio Alto Padrão',
    contrato_id: '1',
    valor: 45000,
    vencimento: '2026-03-10',
    status: 'PAGO',
    data_pagamento: '2026-03-09',
    dias_atraso: 0
  },
  {
    id: 'FAT-2026-002',
    cliente: 'Shopping Center Sul',
    contrato_id: '2',
    valor: 120000,
    vencimento: '2026-03-15',
    status: 'A VENCER',
    data_pagamento: null,
    dias_atraso: 0
  },
  {
    id: 'FAT-2026-003',
    cliente: 'Hospital Santa Maria',
    contrato_id: '3',
    valor: 85000,
    vencimento: '2026-03-05',
    status: 'VENCIDO',
    data_pagamento: null,
    dias_atraso: 16
  },
  {
    id: 'FAT-2026-004',
    cliente: 'Indústria Tech Corp',
    contrato_id: '4',
    valor: 62000,
    vencimento: '2026-03-20',
    status: 'A VENCER',
    data_pagamento: null,
    dias_atraso: 0
  }
];

export function ContasReceber() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isFaturarModalOpen, setIsFaturarModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredFaturas = MOCK_FATURAS.filter(f => {
    const matchesSearch = f.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'TODOS' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalReceber = MOCK_FATURAS.filter(f => f.status !== 'PAGO').reduce((acc, curr) => acc + curr.valor, 0);
  const totalVencido = MOCK_FATURAS.filter(f => f.status === 'VENCIDO').reduce((acc, curr) => acc + curr.valor, 0);
  const totalPagoMes = MOCK_FATURAS.filter(f => f.status === 'PAGO').reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="text-white w-7 h-7" />
            </div>
            Contas a Receber
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Acompanhamento de faturas, inadimplência e régua de cobrança.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFaturarModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Gerar Faturamento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">A Receber (Mês)</p>
          </div>
          <p className="text-3xl font-black text-soft-black dark:text-white">{formatCurrency(totalReceber)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Inadimplência</p>
          </div>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 relative z-10">{formatCurrency(totalVencido)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recebido (Mês)</p>
          </div>
          <p className="text-3xl font-black text-soft-black dark:text-white">{formatCurrency(totalPagoMes)}</p>
        </motion.div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou fatura..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="A VENCER">A Vencer</option>
              <option value="VENCIDO">Vencido</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Fatura</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredFaturas.map((fatura) => (
                <tr key={fatura.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-gray-600 dark:text-gray-300">{fatura.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-soft-black dark:text-white">{fatura.cliente}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-soft-black dark:text-white">
                      {formatCurrency(fatura.valor)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={cn(
                        "text-sm font-medium",
                        fatura.status === 'VENCIDO' ? "text-red-600 dark:text-red-400" : "text-soft-black dark:text-white"
                      )}>
                        {new Date(fatura.vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                        fatura.status === 'PAGO' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : 
                        fatura.status === 'VENCIDO' ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20" :
                        "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
                      )}>
                        {fatura.status}
                      </span>
                      {fatura.status === 'VENCIDO' && fatura.dias_atraso > 5 && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {fatura.dias_atraso} dias de atraso
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {fatura.status === 'VENCIDO' && (
                        <button title="Enviar Cobrança" className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Baixar Boleto/NF" className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFaturas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Gerar Faturamento */}
      <Modal
        isOpen={isFaturarModalOpen}
        onClose={() => setIsFaturarModalOpen(false)}
        title="Gerar Faturamento em Lote"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Esta ação irá gerar as faturas para todos os contratos ativos com vencimento no mês selecionado.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mês de Referência</label>
            <input type="month" defaultValue="2026-03" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsFaturarModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setIsFaturarModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
            >
              Gerar Faturas
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
