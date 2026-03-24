import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, DollarSign, Wallet, AlertTriangle, Target, BarChart3, Copy, CheckCircle2, Search } from 'lucide-react';
import { financeiroImportService } from '../../services/financeiroImportService';
import { contextService } from '../../services/contextService';
import { getFinanceKPIs } from '../../services/dashboardService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function PainelFinanceiro() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openModal, setOpenModal] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);

  useEffect(() => {
    let mounted = true;

    async function loadKPIs() {
      try {
        const data = await getFinanceKPIs();
        
        console.log('KPIs carregados:', data);

        if (mounted) {
          setKpis(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar KPIs:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadKPIs();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!kpis) return <div>Erro ao carregar dados</div>;

  const handleCopyContext = async () => {
    try {
      const context = await contextService.getProjectContext();
      const text = contextService.buildChatContextText(context);
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao copiar contexto:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const cards = [
    { title: 'Saldo Total', value: formatCurrency(kpis?.total_balance ?? 0), icon: Wallet, color: 'text-blue-500' },
    { title: 'Entrou Hoje', value: formatCurrency(kpis?.entered_today ?? 0), icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Saiu Hoje', value: formatCurrency(kpis?.exited_today ?? 0), icon: DollarSign, color: 'text-rose-500' },
    { title: 'Em Atraso', value: formatCurrency(kpis?.overdue_receivables ?? 0), icon: AlertTriangle, color: 'text-amber-500' },
    { title: 'Previsto 7 Dias', value: formatCurrency(kpis?.previsto_7d ?? 0), icon: Target, color: 'text-indigo-500' },
    { title: 'Previsto 30 Dias', value: formatCurrency(kpis?.previsto_30d ?? 0), icon: BarChart3, color: 'text-purple-500' },
  ];

  const despesasPorCentro = [
    { nome: 'Mão de Obra (folha + encargos)', percentual: 72 },
    { nome: 'Impostos & Taxas', percentual: 8 },
    { nome: 'Equipamentos & Tecnologia', percentual: 9 },
    { nome: 'Uniformes & EPI', percentual: 5 },
    { nome: 'Administrativo & Outros', percentual: 6 },
  ];

  const indicadoresFinanceiros = [
    { label: 'Receita por vigilante/mês', value: 'R$ 3.284' },
    { label: 'Custo médio por vigilante', value: 'R$ 2.680' },
    { label: 'Ticket médio por contrato', value: 'R$ 24.917' },
    { label: 'Prazo médio recebimento', value: '28 dias' },
    { label: 'Inadimplência (% receita)', value: '5,1%' },
    { label: 'Liquidez corrente', value: '1,42' },
    { label: 'EBITDA', value: 'R$ 178.320' },
  ];

  const topContratos = [
    { cliente: 'Petrobras Duque', servico: 'Vigilância Armada', func: 28, valor: 'R$ 92.400', status: 'Ativo', vencimento: 'Dez/2026' },
    { cliente: 'Banco do Brasil RJ', servico: 'Vigilância Armada', func: 18, valor: 'R$ 64.800', status: 'Ativo', vencimento: 'Jun/2026' },
    { cliente: 'Shopping Tijuca', servico: 'Vigilância + Portaria', func: 22, valor: 'R$ 58.200', status: 'Renovar', vencimento: 'Abr/2026' },
    { cliente: 'Condomínio Barra Sul', servico: 'Portaria 24h', func: 12, valor: 'R$ 28.800', status: 'Ativo', vencimento: 'Out/2026' },
    { cliente: 'Bradesco Ipanema', servico: 'Vigilância Armada', func: 8, valor: 'R$ 24.800', status: 'Inadimplente', vencimento: 'Ago/2026' },
  ];

  const notasFiscais = [
    { nf: 'NF-3241', cliente: 'Petrobras Duque', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 92.400', status: 'Emitida', acao: 'Ver' },
    { nf: 'NF-3242', cliente: 'Banco do Brasil RJ', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 64.800', status: 'Emitida', acao: 'Ver' },
    { nf: 'NF-3243', cliente: 'Shopping Tijuca', emissao: '01/03/2026', vencimento: '31/03/2026', valor: 'R$ 58.200', status: 'Pendente', acao: 'Ver' },
    { nf: 'NF-3220', cliente: 'Bradesco Ipanema', emissao: '01/02/2026', vencimento: '28/02/2026', valor: 'R$ 18.400', status: 'Vencida', acao: 'Cobrar' },
  ];

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Painel do Dia" 
        subtitle="Visão geral e indicadores financeiros"
        actions={
          <>
            <ActionButton 
              variant="secondary"
              onClick={handleCopyContext}
              className={copyStatus === 'success' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : copyStatus === 'error' ? 'text-rose-600 border-rose-200 bg-rose-50' : ''}
            >
              {copyStatus === 'success' ? <><CheckCircle2 className="w-4 h-4" /> Contexto copiado</> : copyStatus === 'error' ? 'Erro ao copiar' : <><Copy className="w-4 h-4" /> Copiar contexto</>}
            </ActionButton>
            <ActionButton onClick={() => setOpenModal(true)}>
              + Novo Lançamento
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <KpiCard key={i} title={card.title} value={card.value} icon={card.icon} colorClass={card.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Despesas por Centro de Custo">
            <div className="space-y-5">
              {despesasPorCentro.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.nome}</span>
                    <span className="text-gray-900 dark:text-white font-black">{item.percentual}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 group-hover:bg-emerald-400" style={{ width: `${item.percentual}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Indicadores Financeiros">
            <div className="space-y-4">
              {indicadoresFinanceiros.map((ind, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{ind.label}</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{ind.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard 
        title="Top Contratos por Receita"
        action={<ActionButton variant="ghost" className="text-emerald-600 hover:text-emerald-700">+ Lançamento</ActionButton>}
      >
        <Table>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Serviço</Th>
              <Th className="text-center">Func.</Th>
              <Th>Valor/Mês</Th>
              <Th>Status</Th>
              <Th>Vencimento</Th>
            </tr>
          </thead>
          <tbody>
            {topContratos.map((contrato, idx) => (
              <Tr key={idx}>
                <Td className="font-bold">{contrato.cliente}</Td>
                <Td>{contrato.servico}</Td>
                <Td className="text-center">{contrato.func}</Td>
                <Td className="font-black">{contrato.valor}</Td>
                <Td>{getStatusBadge(contrato.status)}</Td>
                <Td>{contrato.vencimento}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      <SectionCard 
        title="Notas Fiscais — Março 2026"
        action={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar NF ou cliente..." 
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <ActionButton className="w-full sm:w-auto whitespace-nowrap">+ Emitir NF</ActionButton>
          </div>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>NF</Th>
              <Th>Cliente</Th>
              <Th>Emissão</Th>
              <Th>Vencimento</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th className="text-right">Ação</Th>
            </tr>
          </thead>
          <tbody>
            {notasFiscais.map((nf, idx) => (
              <Tr key={idx}>
                <Td className="font-black">{nf.nf}</Td>
                <Td className="font-bold">{nf.cliente}</Td>
                <Td>{nf.emissao}</Td>
                <Td>{nf.vencimento}</Td>
                <Td className="font-black">{nf.valor}</Td>
                <Td>{getStatusBadge(nf.status)}</Td>
                <Td className="text-right">
                  <button className={`text-xs font-bold hover:underline ${nf.acao === 'Cobrar' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {nf.acao}
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[400px] border border-gray-200 dark:border-gray-800 shadow-xl">
            
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Novo Lançamento
            </h2>

            <input
              placeholder="Descrição"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />

            <input
              placeholder="Valor"
              type="number"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />

            <select className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 mb-6 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
            </select>

            <div className="flex justify-end gap-3">
              <ActionButton variant="secondary" onClick={() => setOpenModal(false)}>
                Cancelar
              </ActionButton>
              <ActionButton>
                Salvar
              </ActionButton>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
