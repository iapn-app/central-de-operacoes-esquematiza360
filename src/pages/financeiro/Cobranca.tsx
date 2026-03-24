import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Clock, AlertCircle, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { KpiCard, ActionButton, PageHeader } from './components/FinanceComponents';

export function Cobranca() {
  const [actions, setActions] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [actionsData, receivablesData] = await Promise.all([
      financeService.getCollectionActions(),
      financeService.getAccountsReceivable({ status: 'overdue' })
    ]);
    setActions(actionsData);
    setReceivables(receivablesData);
  }

  const kanbanStages = ['AVISO', 'COBRANÇA', 'NEGOCIAÇÃO', 'JURÍDICO', 'BAIXA'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader 
        title="Gestão de Cobrança" 
        subtitle="Régua de cobrança e recuperação"
        actions={
          <ActionButton>
            <Plus className="w-4 h-4 mr-2" /> Acionar Régua
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total em Aberto', value: 'R$ 50.000', icon: AlertCircle, color: 'text-red-500' },
          { title: 'Vence em 7 dias', value: 'R$ 10.000', icon: Clock, color: 'text-amber-500' },
          { title: 'Em Cobrança Ativa', value: 'R$ 25.000', icon: RefreshCw, color: 'text-blue-500' },
          { title: 'Recuperado no Mês', value: 'R$ 15.000', icon: CheckCircle, color: 'text-emerald-500' },
        ].map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {kanbanStages.map(stage => (
          <div key={stage} className="min-w-[280px] bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div className={cn(
              "text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm", 
              stage === 'AVISO' ? 'bg-amber-500' : 
              stage === 'COBRANÇA' ? 'bg-orange-500' : 
              stage === 'NEGOCIAÇÃO' ? 'bg-blue-500' : 
              stage === 'JURÍDICO' ? 'bg-purple-500' : 'bg-gray-500'
            )}>
              {stage}
            </div>
            <div className="space-y-3">
              {receivables.filter(r => r.stage === stage).map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="font-bold text-gray-900 dark:text-white mb-1">{r.client_name}</div>
                  <div className="text-rose-600 font-black text-lg">R$ {(r.amount || 0).toFixed(2)}</div>
                  <div className="flex items-center gap-2 mt-3 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <Clock className="w-3 h-3" />
                    Atraso: {Math.floor((new Date().getTime() - new Date(r.due_date).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </div>
                </div>
              ))}
              {receivables.filter(r => r.stage === stage).length === 0 && (
                <div className="text-center py-8 text-sm font-medium text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  Nenhum título
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
