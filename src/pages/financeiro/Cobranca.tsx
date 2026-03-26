import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, AlertCircle, RefreshCw, CheckCircle, DollarSign } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, ActionButton, PageHeader } from './components/FinanceComponents';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const STAGES = ['AVISO', 'COBRANÇA', 'NEGOCIAÇÃO', 'JURÍDICO', 'BAIXA'] as const;

const STAGE_COLORS: Record<string, string> = {
  'AVISO':      'bg-amber-500',
  'COBRANÇA':   'bg-orange-500',
  'NEGOCIAÇÃO': 'bg-blue-500',
  'JURÍDICO':   'bg-purple-500',
  'BAIXA':      'bg-gray-500',
};

export function Cobranca() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await financeService.getAccountsReceivable({ status: 'overdue' });
        if (mounted) setReceivables(data || []);
      } catch { if (mounted) setReceivables([]); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const totalAberto     = receivables.reduce((a, r) => a + (r.amount || 0), 0);
  const vence7dias      = receivables.filter(r => {
    const diff = (new Date(r.due_date).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 7;
  }).reduce((a, r) => a + (r.amount || 0), 0);
  const emCobranca      = receivables.filter(r => r.stage && r.stage !== 'BAIXA').reduce((a, r) => a + (r.amount || 0), 0);
  const recuperado      = receivables.filter(r => r.stage === 'BAIXA').reduce((a, r) => a + (r.amount || 0), 0);

  const kpis = [
    { title: 'Total em Aberto',      value: fmt(totalAberto), icon: AlertCircle,  color: 'text-red-500' },
    { title: 'Vence em 7 dias',      value: fmt(vence7dias),  icon: Clock,        color: 'text-amber-500' },
    { title: 'Em Cobrança Ativa',    value: fmt(emCobranca),  icon: RefreshCw,    color: 'text-blue-500' },
    { title: 'Recuperado no Mês',    value: fmt(recuperado),  icon: CheckCircle,  color: 'text-emerald-500' },
  ];

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
        {kpis.map((kpi, i) => <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />)}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Carregando...</div>
      ) : receivables.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <DollarSign className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-gray-500 font-semibold">Nenhum título em cobrança.</p>
          <p className="text-gray-400 text-xs">Quando houver faturas vencidas, elas aparecerão aqui organizadas por estágio.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const items = receivables.filter(r => (r.stage || 'AVISO') === stage);
            return (
              <div key={stage} className="min-w-[280px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 inline-block ${STAGE_COLORS[stage]}`}>
                  {stage}
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-sm font-medium text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      Nenhum título
                    </div>
                  ) : items.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm mb-1">{r.client_name || r.cliente}</div>
                      <div className="text-rose-600 font-black">{fmt(r.amount || 0)}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000))} dias de atraso
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
