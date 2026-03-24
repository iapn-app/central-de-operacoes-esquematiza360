import React, { useState } from 'react';
import {
  Plus, Search, AlertCircle, CalendarClock, CheckCircle2,
  MoreVertical, Building2, ArrowUpRight, X, Tag, Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr
} from './financeiro/components/FinanceComponents';

// ─── Dados demo ────────────────────────────────────────────────────────────

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

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const STATUS_FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'vence_hoje', label: 'Vence hoje' },
  { id: 'vence_amanha', label: 'Amanhã' },
  { id: 'programado', label: 'Programado' },
  { id: 'pago', label: 'Recebido' },
  { id: 'em_atraso', label: 'Em atraso' },
];

// ─── Badge de status ───────────────────────────────────────────────────────

function ReceitaStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'vence_hoje':
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">Vence hoje</span>;
    case 'vence_amanha':
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">Vence amanhã</span>;
    case 'programado':
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Programado</span>;
    case 'pago':
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Recebido</span>;
    case 'em_atraso':
      return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400">Em atraso</span>;
    default:
      return null;
  }
}

// ─── Componente principal ──────────────────────────────────────────────────

export function ContasReceber() {
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [busca, setBusca] = useState('');

  const totalReceber = MOCK_CONTAS_RECEBER.filter(c => c.status !== 'pago').reduce((a, c) => a + c.valor, 0);
  const totalAtraso = MOCK_CONTAS_RECEBER.filter(c => c.status === 'em_atraso').reduce((a, c) => a + c.valor, 0);
  const totalHoje = MOCK_CONTAS_RECEBER.filter(c => c.status === 'vence_hoje').reduce((a, c) => a + c.valor, 0);
  const totalRecebido = MOCK_CONTAS_RECEBER.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0);

  const contasFiltradas = MOCK_CONTAS_RECEBER.filter(c => {
    const matchStatus = filtroStatus === 'todas' || c.status === filtroStatus;
    const matchBusca = busca === '' || c.cliente.toLowerCase().includes(busca.toLowerCase()) || c.contrato.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const kpis = [
    { title: 'Total a receber', value: fmt(totalReceber), subtitle: 'No mês corrente', icon: ArrowUpRight, colorClass: 'text-blue-500' },
    { title: 'Previsto hoje', value: fmt(totalHoje), subtitle: '1 cliente', icon: CalendarClock, colorClass: 'text-amber-500' },
    { title: 'Em atraso', value: fmt(totalAtraso), subtitle: 'Necessário acionar cobrança', icon: AlertCircle, colorClass: 'text-rose-500' },
    { title: 'Já recebido', value: fmt(totalRecebido), subtitle: `${MOCK_CONTAS_RECEBER.filter(c => c.status === 'pago').length} clientes`, icon: CheckCircle2, colorClass: 'text-emerald-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Contas a Receber"
        subtitle="Gestão de recebíveis e prevenção de inadimplência"
        actions={
          <>
            <ActionButton variant="secondary">
              <Download className="w-4 h-4" /> Exportar
            </ActionButton>
            <ActionButton>
              <Plus className="w-4 h-4" /> Novo recebível
            </ActionButton>
          </>
        }
      />

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.colorClass} />
        ))}
      </div>

      {/* ── Layout principal ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Coluna esquerda (70%) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Alerta de inadimplência */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-t-4 border-t-red-500 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">Atenção: recebíveis em atraso</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Impacto alto no fluxo de caixa — ação necessária</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total em risco</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{fmt(totalAtraso)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-4 border border-red-100 dark:border-red-500/20">
                <p className="text-xs font-bold text-red-600 uppercase mb-1">1 a 15 dias</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-500">1 cliente</p>
                <p className="text-sm text-red-600/80 dark:text-red-400 font-medium mt-1">{fmt(totalAtraso)}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">+15 dias</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-500">0 clientes</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400 font-medium mt-1">R$ 0,00</p>
              </div>
            </div>

            <div className="flex gap-3">
              <ActionButton className="flex-1">
                <AlertCircle className="w-4 h-4" /> Acionar régua de cobrança
              </ActionButton>
              <ActionButton variant="secondary">Ver detalhes</ActionButton>
            </div>
          </div>

          {/* Tabela de contas */}
          <SectionCard>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFiltroStatus(f.id)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                      filtroStatus === f.id
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <Table>
              <thead>
                <tr>
                  <Th>Cliente</Th>
                  <Th>Contrato</Th>
                  <Th>Valor</Th>
                  <Th>Vencimento</Th>
                  <Th>Forma</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Ação</Th>
                </tr>
              </thead>
              <tbody>
                {contasFiltradas.map((conta) => (
                  <Tr key={conta.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-bold">{conta.cliente}</span>
                      </div>
                    </Td>
                    <Td className="text-gray-500 font-medium">{conta.contrato}</Td>
                    <Td className="font-black">{fmt(conta.valor)}</Td>
                    <Td className="font-medium">{conta.vencimento}</Td>
                    <Td>
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <Tag className="w-3 h-3" /> {conta.forma}
                      </span>
                    </Td>
                    <Td><ReceitaStatusBadge status={conta.status} /></Td>
                    <Td className="text-right">
                      <button className={cn(
                        'text-xs font-bold hover:underline',
                        conta.status === 'em_atraso' ? 'text-rose-600' :
                        conta.status === 'pago' ? 'text-blue-600' : 'text-emerald-600'
                      )}>
                        {conta.acao}
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            {/* Subtotal */}
            <div className="flex justify-end items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-bold text-gray-500">{contasFiltradas.length} registros</span>
              <span className="text-base font-black text-gray-900 dark:text-white">
                Total: {fmt(contasFiltradas.reduce((a, c) => a + c.valor, 0))}
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Coluna direita (30%) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Recebimentos hoje */}
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CalendarClock className="w-24 h-24 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Recebimentos hoje</h3>
              </div>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400 mb-1">{fmt(totalHoje)}</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-500 mb-5">
                {MOCK_CONTAS_RECEBER.filter(c => c.status === 'vence_hoje').length} cliente(s) previsto(s)
              </p>
              {MOCK_CONTAS_RECEBER.filter(c => c.status === 'vence_hoje').map((c, i) => (
                <div key={i} className="flex justify-between text-sm mb-2">
                  <span className="text-blue-800/70 dark:text-blue-300/70 font-medium">{c.cliente}</span>
                  <span className="font-bold text-blue-900 dark:text-blue-300">{fmt(c.valor)}</span>
                </div>
              ))}
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3 border border-blue-200/50 dark:border-blue-500/20 mt-4">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 text-center">
                  Acompanhe a liquidação bancária em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Risco de inadimplência */}
          <SectionCard title="Risco de inadimplência">
            <div className="space-y-3">
              {MOCK_CONTAS_RECEBER.filter(c => c.risco === 'critico' || c.risco === 'alto').map((c, i) => (
                <div key={i} className={cn(
                  'p-3 rounded-xl border',
                  c.risco === 'critico'
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
                )}>
                  <p className={cn(
                    'text-sm font-bold mb-1',
                    c.risco === 'critico' ? 'text-red-800 dark:text-red-400' : 'text-amber-800 dark:text-amber-400'
                  )}>
                    {c.cliente}
                  </p>
                  <p className={cn(
                    'text-xs font-medium',
                    c.risco === 'critico' ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300'
                  )}>
                    {fmt(c.valor)} · Vencimento: {c.vencimento}
                  </p>
                </div>
              ))}
            </div>
            <ActionButton className="w-full mt-4" variant="secondary">
              <AlertCircle className="w-4 h-4" /> Ver relatório de inadimplência
            </ActionButton>
          </SectionCard>

          {/* Taxa de inadimplência */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Taxa de inadimplência</p>
            <p className="text-3xl font-black text-rose-600 mb-2">8,5%</p>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-2">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '8.5%' }} />
            </div>
            <p className="text-xs text-gray-500 font-medium">Meta: abaixo de 5%</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
