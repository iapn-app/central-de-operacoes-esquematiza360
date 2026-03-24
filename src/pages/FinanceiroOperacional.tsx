import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Target, 
  Filter, 
  Download, 
  Search, 
  FileText,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function FinanceiroOperacional() {
  const [activeTab, setActiveTab] = useState<'postos' | 'contratos' | 'clientes'>('postos');
  const [data, setData] = useState<any>({
    postos: [],
    contratos: [],
    clientes: []
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-soft-black dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-brand-green" />
            Financeiro Operacional
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Análise detalhada de custos, margens e rentabilidade por unidade de negócio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">0% vs mês ant.</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Margem Média Geral</p>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">0%</h3>
        </div>

        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">0 Postos Ativos</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Custo Operacional Total</p>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">{formatCurrency(0)}</h3>
        </div>

        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">Meta: 30%</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rentabilidade Acumulada</p>
          <h3 className="text-2xl font-black text-soft-black dark:text-white">{formatCurrency(0)}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('postos')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'postos' ? "bg-white dark:bg-gray-800 text-brand-green shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Custo por Posto
        </button>
        <button 
          onClick={() => setActiveTab('contratos')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'contratos' ? "bg-white dark:bg-gray-800 text-brand-green shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Margem por Contrato
        </button>
        <button 
          onClick={() => setActiveTab('clientes')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'clientes' ? "bg-white dark:bg-gray-800 text-brand-green shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Rentabilidade por Cliente
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-soft-black dark:text-white">
            {activeTab === 'postos' && 'Análise de Custos por Posto'}
            {activeTab === 'contratos' && 'Análise de Margens por Contrato'}
            {activeTab === 'clientes' && 'Rentabilidade Consolidada por Cliente'}
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filtrar resultados..."
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
            <button className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-brand-green transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5">
                {activeTab === 'postos' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posto</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receita</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custo Operacional</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margem Bruta</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margem %</th>
                  </>
                )}
                {activeTab === 'contratos' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente / Contrato</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Mensal</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custos Diretos</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Impostos</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margem Líquida</th>
                  </>
                )}
                {activeTab === 'clientes' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receita Anual Est.</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custo Anual Est.</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rentabilidade %</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Nível de Lucro</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-xs italic">
                  Aguardando importação de dados financeiros para processamento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-soft-black to-gray-800 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <Zap className="w-8 h-8 text-brand-green mb-6" />
          <h3 className="text-xl font-bold mb-3">Insights de Rentabilidade (IA)</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Aguardando dados reais para gerar insights estratégicos sobre a operação.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold text-soft-black dark:text-white mb-6">Distribuição de Custos</h3>
          <div className="space-y-6">
            <p className="text-xs text-gray-400 italic text-center py-10">Dados insuficientes para gerar gráfico de distribuição.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
