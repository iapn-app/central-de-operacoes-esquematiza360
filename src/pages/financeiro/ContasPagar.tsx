import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, Filter, CheckCircle2, XCircle, AlertTriangle, Calendar, CheckSquare } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function ContasPagar() {
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'paid'>('pending');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const statusMap = { pending: 'pending', approved: 'approved', paid: 'paid' };
        const data = await financeService.getAccountsPayable({ status: statusMap[activeTab] });
        setPayables(data || []);
      } catch (error) {
        console.error('Error fetching payables:', error);
        setPayables([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  const tabs = [
    { id: 'pending', label: 'Aguardando Aprovação' },
    { id: 'approved', label: 'Aprovados' },
    { id: 'paid', label: 'Pagos' },
  ] as const;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');

  const kpis = [
    { title: 'Vencidas', value: 'R$ 12.400', subtitle: '2 contas', icon: AlertTriangle, color: 'text-rose-500' },
    { title: 'Vence esta semana', value: 'R$ 68.320', subtitle: 'INSS + FGTS', icon: Calendar, color: 'text-amber-500' },
    { title: 'Vence este mês', value: 'R$ 610.900', subtitle: '28 lançamentos', icon: DollarSign, color: 'text-blue-500' },
    { title: 'Liquidadas (mar)', value: 'R$ 186.200', subtitle: '18 pagas', icon: CheckSquare, color: 'text-emerald-500' },
  ];

  const mockContas = [
    { fornecedor: 'INSS + FGTS — Março', categoria: 'Encargos', vencimento: '20/03', valor: 'R$ 48.320', status: 'Pendente', acao: 'Pagar' },
    { fornecedor: 'Unifardome — Uniformes lote 03', categoria: 'Material', vencimento: '22/03', valor: 'R$ 8.750', status: 'Pendente', acao: 'Pagar' },
    { fornecedor: 'TecnoSegur — Manutenção', categoria: 'Manutenção', vencimento: '25/03', valor: 'R$ 12.400', status: 'Pendente', acao: 'Pagar' },
    { fornecedor: 'Seguro Responsabilidade Civil', categoria: 'Seguro', vencimento: '10/03', valor: 'R$ 12.400', status: 'Vencida', acao: 'Urgente' },
  ];

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Contas a Pagar" 
        subtitle="Gestão de obrigações financeiras"
        actions={
          <>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="2026-03">Março 2026</option>
              <option value="2026-04">Abril 2026</option>
            </select>
            <ActionButton onClick={() => setIsModalOpen(true)}>
              + Nova conta
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Novo Pagamento</h2>
            <p className="mb-8 text-gray-500 dark:text-gray-400">Formulário de cadastro aqui...</p>
            <div className="flex justify-end gap-3">
              <ActionButton variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</ActionButton>
              <ActionButton variant="danger" onClick={() => setIsModalOpen(false)}>Salvar</ActionButton>
            </div>
          </div>
        </div>
      )}

      <SectionCard title="Lista de Contas a Pagar">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium">Carregando dados...</div>
        ) : payables.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-medium">Nenhuma conta encontrada para este filtro.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Fornecedor</Th>
                <Th>Categoria</Th>
                <Th>Vencimento</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th className="text-right">Ação</Th>
              </tr>
            </thead>
            <tbody>
              {mockContas.map((item, idx) => (
                <Tr key={idx}>
                  <Td className="font-bold">{item.fornecedor}</Td>
                  <Td>{item.categoria}</Td>
                  <Td>{item.vencimento}</Td>
                  <Td className="font-black">{item.valor}</Td>
                  <Td>{getStatusBadge(item.status)}</Td>
                  <Td className="text-right">
                    <button className={`text-xs font-bold hover:underline ${item.acao === 'Urgente' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.acao}
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
