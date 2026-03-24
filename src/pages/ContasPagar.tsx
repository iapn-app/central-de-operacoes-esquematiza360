import React, { useState } from 'react';
import { Plus, Search, Filter, AlertCircle, CalendarClock, ShieldCheck, TrendingUp, ChevronDown, CheckCircle2, RefreshCw, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const MOCK_CONTAS_PAGAR = [
  { id: 1, conta: 'Aluguel Base Operacional', fornecedor: 'Imobiliária Sul', categoria: 'Infraestrutura', valor: 15000, vencimento: 'Hoje', status: 'vence_hoje', risco: 300, acao: 'Pagar Imediatamente', critico: false },
  { id: 2, conta: 'Link Dedicado (SOC)', fornecedor: 'Vivo Empresas', categoria: 'TI / Telecom', valor: 2500, vencimento: 'Hoje', status: 'vence_hoje', risco: 50, acao: 'Risco de Corte', critico: true },
  { id: 3, conta: 'Energia Elétrica', fornecedor: 'Enel', categoria: 'Consumo', valor: 4200, vencimento: 'Amanhã', status: 'vence_amanha', risco: 84, acao: 'Agendar Pagamento', critico: true },
  { id: 4, conta: 'Licença de Rádio', fornecedor: 'Anatel', categoria: 'Impostos/Taxas', valor: 1800, vencimento: 'Amanhã', status: 'vence_amanha', risco: 36, acao: 'Agendar Pagamento', critico: false },
  { id: 5, conta: 'Seguro Frota (10 VTRs)', fornecedor: 'Porto Seguro', categoria: 'Frota', valor: 8500, vencimento: 'Próx. 7 Dias', status: 'programado', risco: 170, acao: 'Aguardar', critico: false },
  { id: 6, conta: 'Sistema de CFTV Cloud', fornecedor: 'Intelbras', categoria: 'Tecnologia', valor: 3200, vencimento: 'Próx. 7 Dias', status: 'programado', risco: 64, acao: 'Aguardar', critico: false },
  { id: 7, conta: 'Telefonia Móvel (Táticos)', fornecedor: 'Claro Empresas', categoria: 'Telecom', valor: 1200, vencimento: 'Próx. 7 Dias', status: 'programado', risco: 24, acao: 'Aguardar', critico: false },
  { id: 8, conta: 'Software de Monitoramento', fornecedor: 'Sigma', categoria: 'Tecnologia', valor: 5000, vencimento: 'Ontem', status: 'pago', risco: 100, acao: 'Ver Comprovante', critico: false },
  { id: 9, conta: 'Manutenção Preventiva', fornecedor: 'Oficina Master', categoria: 'Frota', valor: 4500, vencimento: 'Dia 05', status: 'pago', risco: 90, acao: 'Ver Comprovante', critico: false },
  { id: 10, conta: 'Fornecedor de Uniformes', fornecedor: 'Tática Uniformes', categoria: 'Operacional', valor: 12000, vencimento: 'Dia 02', status: 'pago', risco: 240, acao: 'Ver Comprovante', critico: false },
];

export function ContasPagar() {
  const [filtroStatus, setFiltroStatus] = useState('todas');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vence_hoje':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">Vence Hoje</span>;
      case 'vence_amanha':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Vence Amanhã</span>;
      case 'programado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Programado</span>;
      case 'pago':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pago</span>;
      case 'vencido':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">Vencido</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contas a Pagar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestão de passivos e prevenção de juros.</p>
        </div>
        <button className="bg-brand-green hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-brand-green/20">
          <Plus className="w-4 h-4" />
          Nova Conta / Boleto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total a Pagar Hoje</p>
          <p className="text-2xl font-black text-red-600">R$ 17.500,00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total a Pagar (48h)</p>
          <p className="text-2xl font-black text-amber-600">R$ 23.500,00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contas Vencidas</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Programado (Mês)</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">R$ 145.800,00</p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Widget 48h */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 border-t-4 border-t-red-500 p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                <CalendarClock className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Atenção: Vencimentos Críticos (48h)</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total em Risco</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                R$ 23.500,00
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-4 border border-red-100 dark:border-red-500/20">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Vence Hoje</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-500">2 contas</p>
                <p className="text-sm text-red-600/80 dark:text-red-400 font-medium mt-1">
                  R$ 17.500,00
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">Vence Amanhã</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-500">2 contas</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400 font-medium mt-1">
                  R$ 6.000,00
                </p>
              </div>
            </div>

            <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">
              Risco imediato: R$ 470,00 em multas se não processado.
            </p>

            <div className="mt-auto flex gap-3">
              <button className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Processar Pagamentos de Hoje
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
                {['todas', 'vence_hoje', 'vence_amanha', 'programado', 'pago'].map((status) => (
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
                  placeholder="Buscar conta ou fornecedor..." 
                  className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 dark:text-white"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-bold">Conta</th>
                    <th className="px-4 py-3 font-bold">Fornecedor</th>
                    <th className="px-4 py-3 font-bold">Valor</th>
                    <th className="px-4 py-3 font-bold">Vencimento</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Risco (Multa)</th>
                    <th className="px-4 py-3 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {MOCK_CONTAS_PAGAR.filter(c => filtroStatus === 'todas' || c.status === filtroStatus).map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{conta.conta}</span>
                          {conta.critico && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{conta.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{conta.fornecedor}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{conta.vencimento}</td>
                      <td className="px-4 py-3">{getStatusBadge(conta.status)}</td>
                      <td className="px-4 py-3">
                        {conta.status === 'pago' ? (
                          <span className="text-emerald-600 font-bold text-xs">Evitou R$ {conta.risco.toFixed(2)}</span>
                        ) : (
                          <span className="text-red-600 font-bold text-xs">+ R$ {conta.risco.toFixed(2)}</span>
                        )}
                      </td>
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
          
          {/* Prejuízo Evitado Card */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24 text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Prejuízo Evitado (Mês)</h3>
              </div>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-2">
                R$ 4.250,00
              </p>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-500 mb-6">
                <TrendingUp className="w-4 h-4" />
                <span>15% mais eficiente que o mês passado</span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-800/70 dark:text-emerald-300/70 font-medium">Impostos</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">R$ 2.100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-800/70 dark:text-emerald-300/70 font-medium">Infraestrutura</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">R$ 1.500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-800/70 dark:text-emerald-300/70 font-medium">Frota</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">R$ 650</span>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-500/20">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 text-center">
                  Dinheiro salvo é margem garantida.
                </p>
              </div>
            </div>
          </div>

          {/* Alertas Laterais */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Radar de Risco Operacional
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                <p className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Link Dedicado (Vivo)</p>
                <p className="text-xs text-red-600 dark:text-red-300">Vence hoje. O corte derruba o monitoramento de 45 clientes.</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Energia Elétrica (Enel)</p>
                <p className="text-xs text-amber-600 dark:text-amber-300">Vence amanhã. Base operacional em risco.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
