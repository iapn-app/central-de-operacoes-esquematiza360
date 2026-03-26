import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, AlertCircle, RefreshCw, CheckCircle, DollarSign } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, ActionButton, PageHeader } from './components/FinanceComponents';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const STAGES = ['AVISO', 'COBRANÇA', 'NEGOCIAÇÃO', 'JURÍDICO', 'BAIXA'] as const;

const STAGE_COLORS: Record<string, string> = {
  'AVISO':      'bg-amber-500',
  'COBRANÇA':   'bg-orange-500',
  'NEGOCIAÇÃO': 'bg-blue-500',
  'JURÍDICO':   'bg-purple-500',
  'BAIXA':      'bg-gray-500',
};

function diasAtraso(due_date: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(due_date).getTime()) / 86400000));
}

function autoStage(dias: number): string {
  if (dias <= 5)  return 'AVISO';
  if (dias <= 15) return 'COBRANÇA';
  if (dias <= 30) return 'NEGOCIAÇÃO';
  if (dias <= 60) return 'JURÍDICO';
  return 'BAIXA';
}

export function Cobranca() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000); // fallback
    load().finally(() => clearTimeout(timeoutId));
  }, []);

  async function load() {
    setLoading(true);
    try {
    const data = await financeService.getInadimplencia();
    // Atribui estágio automaticamente baseado nos dias de atraso
    const comStage = (data ?? []).map((r: any) => ({
      ...r,
      stage: r.stage ?? autoStage(r.dias_atraso ?? 0),
    }));
    setReceivables(comStage);
    setLoading(false);
  }

  const totalAberto  = receivables.reduce((a, r) => a + r.amount, 0);
  const vence7dias   = receivables.filter(r => (r.dias_atraso ?? 0) <= 7).reduce((a, r) => a + r.amount, 0);
  const emCobranca   = receivables.filter(r => r.stage !== 'BAIXA').reduce((a, r) => a + r.amount, 0);
  const recuperado   = receivables.filter(r => r.stage === 'BAIXA').reduce((a, r) => a + r.amount, 0);

  const kpis = [
    { title: 'Total em Aberto',   value: fmt(totalAberto), icon: AlertCircle, color: 'text-red-500' },
    { title: 'Até 7 dias',        value: fmt(vence7dias),  icon: Clock,       color: 'text-amber-500' },
    { title: 'Em Cobrança Ativa', value: fmt(emCobranca),  icon: RefreshCw,   color: 'text-blue-500' },
    { title: 'Encaminhado Baixa', value: fmt(recuperado),  icon: CheckCircle, color: 'text-gray-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader
        title="Gestão de Cobrança"
        subtitle="Régua automática — estágios por dias de atraso"
        actions={
          <ActionButton variant="secondary" onClick={load}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      {/* Legenda régua */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { stage: 'AVISO', desc: '1–5 dias', cor: 'bg-amber-100 text-amber-700' },
          { stage: 'COBRANÇA', desc: '6–15 dias', cor: 'bg-orange-100 text-orange-700' },
          { stage: 'NEGOCIAÇÃO', desc: '16–30 dias', cor: 'bg-blue-100 text-blue-700' },
          { stage: 'JURÍDICO', desc: '31–60 dias', cor: 'bg-purple-100 text-purple-700' },
          { stage: 'BAIXA', desc: '60+ dias', cor: 'bg-gray-100 text-gray-600' },
        ].map(s => (
          <span key={s.stage} className={`px-3 py-1 rounded-full font-semibold ${s.cor}`}>
            {s.stage}: {s.desc}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      ) : receivables.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <DollarSign className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-gray-500 font-semibold">Nenhum título em cobrança. 🎉</p>
          <p className="text-gray-400 text-xs">Receitas vencidas e pendentes aparecem aqui automaticamente.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const items = receivables.filter(r => r.stage === stage);
            return (
              <div key={stage} className="min-w-[280px] bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-shrink-0">
                <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 inline-flex items-center gap-2 ${STAGE_COLORS[stage]}`}>
                  {stage}
                  {items.length > 0 && (
                    <span className="bg-white/30 px-1.5 py-0.5 rounded-full">{items.length}</span>
                  )}
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-sm font-medium text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      Nenhum título
                    </div>
                  ) : items.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
                      <div className="font-bold text-slate-900 text-sm mb-1 truncate">{r.description}</div>
                      <div className="text-xs text-gray-400 mb-2">{r.empresa_nome}</div>
                      <div className="text-rose-600 font-black text-base">{fmt(r.amount)}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {r.dias_atraso} dias de atraso
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
