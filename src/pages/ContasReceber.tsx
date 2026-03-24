import React, { useState } from 'react';
import { Plus, Search, Filter, AlertCircle, CalendarClock, ShieldCheck, TrendingUp, ChevronDown, CheckCircle2, RefreshCw, MoreVertical, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const MOCK_CONTAS_RECEBER = [
  { id: 1, cliente: 'Condomínio Reserva', contrato: 'CT-2023-045', valor: 45000, vencimento: 'Hoje', status: 'vence_hoje', forma: 'Boleto', risco: 'alto', acao: 'Cobrar' },
  { id: 2, cliente: 'Shopping Center Sul', contrato: 'CT-2022-112', valor: 120000, vencimento: 'Ontem', status: 'em_atraso', forma: 'Transferência', risco: 'critico', acao: 'Notificar' },
  { id: 3, cliente: 'Indústria Metalúrgica', contrato: 'CT-2024-001', valor: 85000, vencimento: 'Amanhã', status: 'vence_amanha', forma: 'Boleto', risco: 'baixo', acao: 'Aguardar' },
  { id: 4, cliente: 'Rede de Farmácias', contrato: 'CT-2023-088', valor: 32000, vencimento: 'Próx. 7 Dias', status: 'programado', forma: 'Pix', risco: 'baixo', acao: 'Aguardar' },
  { id: 5, cliente: 'Hospital São Lucas', contrato: 'CT-2021-055', valor: 95000, vencimento: 'Dia 05', status: 'pago', forma: 'Transferência', risco: 'nulo', acao: 'Ver Recibo' },
  { id: 6, cliente: 'Transportadora Rápida', contrato: 'CT-2024-012', valor: 28000, vencimento: 'Dia 10', status: 'programado', forma: 'Boleto', risco: 'medio', acao: 'Aguardar' },
  { id: 7, cliente: 'Escola Internacional', contrato: 'CT-2022-034', valor: 42000, vencimento: 'Dia 15', status: 'programado', forma: 'Pix', risco: 'baixo', acao: 'Aguardar' },
  { id: 8, cliente: 'Construtora Alpha', contrato: 'CT-2023-099', valor: 65000, vencimento: 'Dia 02', status: 'pago', forma: 'Transferência', risco: 'nulo', acao: 'Ver Recibo' },
];

export function ContasReceber() {
  const [filtroStatus, setFiltroStatus] = useState('todas');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vence_hoje':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">Vence Hoje</span>;
      case 'vence_amanha':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Vence Amanhã</span>;
      case 'programado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Programado</span>;
      case 'pago':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Recebido</span>;
      case 'em_atraso':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">Em Atraso</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contas a Receber</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestão de recebíveis e prevenção de inadimplência.</p>
        </div>
        <button className="bg-brand-green hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-brand-green/20">
          <Plus className="w-4 h-4" />
          Novo Recebível
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total a Receber (Mês)</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">R$ 512.000,00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Previsto Hoje</p>
          <p className="text-2xl font-black text-amber-600">R$ 45.000,00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Em Atraso</p>
          <p className="text-2xl font-black text-red-600">R$ 120.000,00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Taxa de Inadimplência</p>
          <p className="text-2xl font-black text-red-600">8.5%</p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Widget Atrasos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-red-500 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atenção: Recebíveis em Atraso</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total em Risco</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                R$ 120.000,00
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-4 border border-red-100 dark:border-red-500/20">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">1 a 15 Dias</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-500">1 cliente</p>
                <p className="text-sm text-red-600/80 dark:text-red-400 font-medium mt-1">
                  R$ 120.000,00
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">+15 Dias</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-500">0 clientes</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400 font-medium mt-1">
                  R$ 0,00
                </p>
              </div>
            </div>

            <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">
              Impacto no fluxo de caixa: Alto. Necessário acionar cobrança.
            </p>

            <div className="mt-auto flex gap-3">
              <button className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Acionar Régua de Cobrança
              </button>
              <button className="px-6 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors">
                Ver Detalhes
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                {['todas', 'vence_hoje', 'vence_amanha', 'programado', 'pago', 'em_atraso'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
                      filtroStatus === status
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente ou contrato..." 
                  className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 dark:text-white"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-bold">Cliente</th>
                    <th className="px-4 py-3 font-bold">Contrato</th>
                    <th className="px-4 py-3 font-bold">Valor</th>
                    <th className="px-4 py-3 font-bold">Vencimento</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {MOCK_CONTAS_RECEBER.filter(c => filtroStatus === 'todas' || c.status === filtroStatus).map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">{conta.cliente}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{conta.contrato}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{conta.vencimento}</td>
                      <td className="px-4 py-3">{getStatusBadge(conta.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-brand-green transition-colors rounded-lg hover:bg-brand-green/10">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recebimentos Hoje Card */}
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CalendarClock className="w-24 h-24 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-blue-900 dark:text-blue-300">Recebimentos Hoje</h3>
              </div>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400 mb-2">
                R$ 45.000,00
              </p>
              <div className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-500 mb-6">
                <span>1 cliente previsto</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800/70 dark:text-blue-300/70 font-medium">Condomínio Reserva</span>
                  <span className="font-bold text-blue-900 dark:text-blue-300">R$ 45.000</span>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3 border border-blue-200/50 dark:border-blue-500/20">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center">
                  Acompanhe a liquidação bancária.
                </p>
              </div>
            </div>
          </div>

          {/* Alertas Laterais */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Risco de Inadimplência
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                <p className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Shopping Center Sul</p>
                <p className="text-xs text-red-600 dark:text-red-300">Fatura de R$ 120.000,00 venceu ontem. Contato com financeiro pendente.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
