import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, AlertTriangle, Calendar,
  CheckSquare, Plus, Download, RefreshCw,
  ChevronRight, X, Building2, Tag, Hash
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr
} from './components/FinanceComponents';

// ─── Dados demo ────────────────────────────────────────────────────────────

const mockContas = [
  { id: 1, fornecedor: 'INSS + FGTS — Março', categoria: 'Encargos', vencimento: '20/03/2026', valor: 48320, status: 'Pendente', prioridade: 'alta' },
  { id: 2, fornecedor: 'Unifardome — Uniformes lote 03', categoria: 'Material', vencimento: '22/03/2026', valor: 8750, status: 'Pendente', prioridade: 'normal' },
  { id: 3, fornecedor: 'TecnoSegur — Manutenção radios', categoria: 'Manutenção', vencimento: '25/03/2026', valor: 12400, status: 'Pendente', prioridade: 'normal' },
  { id: 4, fornecedor: 'Seguro Responsabilidade Civil', categoria: 'Seguro', vencimento: '10/03/2026', valor: 12400, status: 'Vencida', prioridade: 'urgente' },
  { id: 5, fornecedor: 'Aluguel — Sede administrativa', categoria: 'Infraestrutura', vencimento: '05/04/2026', valor: 18500, status: 'Aprovados', prioridade: 'normal' },
  { id: 6, fornecedor: 'Simples Nacional — Março', categoria: 'Impostos', vencimento: '31/03/2026', valor: 22180, status: 'Pendente', prioridade: 'alta' },
  { id: 7, fornecedor: 'AWS — Infraestrutura cloud', categoria: 'Tecnologia', vencimento: '01/04/2026', valor: 1840, status: 'Aprovados', prioridade: 'baixa' },
  { id: 8, fornecedor: 'Folha de pagamento — Março', categoria: 'Pessoal', vencimento: '30/03/2026', valor: 186400, status: 'Aprovados', prioridade: 'alta' },
];

const categorias = ['Encargos', 'Material', 'Manutenção', 'Seguro', 'Infraestrutura', 'Impostos', 'Tecnologia', 'Pessoal', 'Outros'];

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Modal novo pagamento ──────────────────────────────────────────────────

function ModalNovaConta({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    fornecedor: '', categoria: '', vencimento: '', valor: '', descricao: '', recorrente: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Novo Pagamento</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cadastre uma nova obrigação financeira</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Fornecedor / Descrição</label>
              <input name="fornecedor" value={form.fornecedor} onChange={handleChange} placeholder="Ex: INSS Março 2026" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} className={inputClass}>
                <option value="">Selecionar...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input name="valor" value={form.valor} onChange={handleChange} type="number" placeholder="0,00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de vencimento</label>
              <input name="vencimento" value={form.vencimento} onChange={handleChange} type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Centro de custo</label>
              <select name="centroCusto" className={inputClass}>
                <option value="">Selecionar...</option>
                <option>Operacional</option>
                <option>Administrativo</option>
                <option>RH</option>
                <option>Tecnologia</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Observação</label>
              <textarea name="descricao" rows={2} placeholder="Informações adicionais..." className={inputClass + ' resize-none'} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="recorrente" name="recorrente" checked={form.recorrente} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
              <label htmlFor="recorrente" className="text-sm font-medium text-gray-700 dark:text-gray-300">Lançamento recorrente (mensal)</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <ActionButton variant="secondary" onClick={onClose}>Cancelar</ActionButton>
          <ActionButton onClick={onClose}>Salvar pagamento</ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function ContasPagar() {
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'paid'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [busca, setBusca] = useState('');

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
    { id: 'pending', label: 'Aguardando aprovação' },
    { id: 'approved', label: 'Aprovados' },
    { id: 'paid', label: 'Pagos' },
  ] as const;

  const kpis = [
    { title: 'Vencidas', value: fmt(12400), subtitle: '1 conta em atraso', icon: AlertTriangle, colorClass: 'text-rose-500' },
    { title: 'Vence esta semana', value: fmt(68320), subtitle: 'INSS + FGTS + seguro', icon: Calendar, colorClass: 'text-amber-500' },
    { title: 'Vence este mês', value: fmt(290450), subtitle: '6 lançamentos', icon: DollarSign, colorClass: 'text-blue-500' },
    { title: 'Liquidadas (mar)', value: fmt(186200), subtitle: '3 pagas', icon: CheckSquare, colorClass: 'text-emerald-500' },
  ];

  // Filtra por aba e busca
  const tabStatusMap: Record<string, string[]> = {
    pending: ['Pendente', 'Vencida'],
    approved: ['Aprovados'],
    paid: ['Paga'],
  };

  const contasFiltradas = mockContas.filter(c => {
    const matchTab = tabStatusMap[activeTab]?.includes(c.status);
    const matchBusca = busca === '' || c.fornecedor.toLowerCase().includes(busca.toLowerCase()) || c.categoria.toLowerCase().includes(busca.toLowerCase());
    return matchTab && matchBusca;
  });

  const totalFiltrado = contasFiltradas.reduce((acc, c) => acc + c.valor, 0);

  const prioridadeConfig: Record<string, string> = {
    urgente: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
    alta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    normal: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    baixa: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  };

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Contas a Pagar"
        subtitle="Gestão de obrigações financeiras e agendamento de pagamentos"
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
            <ActionButton variant="secondary">
              <Download className="w-4 h-4" /> Exportar
            </ActionButton>
            <ActionButton onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nova conta
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

      {/* ── Alerta vencidas ──────────────────────────────────────────────── */}
      {activeTab === 'pending' && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-rose-800 dark:text-rose-300">1 conta vencida — Seguro Responsabilidade Civil</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Venceu em 10/03/2026 · R$ 12.400,00 · Risco de multa e juros</p>
          </div>
          <ActionButton variant="danger" className="text-xs whitespace-nowrap">
            Regularizar agora <ChevronRight className="w-3 h-3" />
          </ActionButton>
        </div>
      )}

      {/* ── Tabela principal ─────────────────────────────────────────────── */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
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
          {/* Busca */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar fornecedor..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {contasFiltradas.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400 font-medium">
            Nenhuma conta encontrada para este filtro.
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Fornecedor / Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Vencimento</Th>
                  <Th>Valor</Th>
                  <Th>Prioridade</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Ação</Th>
                </tr>
              </thead>
              <tbody>
                {contasFiltradas.map((item) => (
                  <Tr key={item.id}>
                    <Td className="font-bold">{item.fornecedor}</Td>
                    <Td>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Tag className="w-3 h-3" /> {item.categoria}
                      </span>
                    </Td>
                    <Td className="font-medium">{item.vencimento}</Td>
                    <Td className="font-black">{fmt(item.valor)}</Td>
                    <Td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${prioridadeConfig[item.prioridade]}`}>
                        {item.prioridade}
                      </span>
                    </Td>
                    <Td><StatusBadge status={item.status} /></Td>
                    <Td className="text-right">
                      <button className={`text-xs font-bold hover:underline ${item.status === 'Vencida' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.status === 'Vencida' ? 'Urgente' : item.status === 'Aprovados' ? 'Pagar' : 'Aprovar'}
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            {/* Subtotal */}
            <div className="flex justify-end items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                {contasFiltradas.length} lançamento{contasFiltradas.length !== 1 ? 's' : ''}
              </span>
              <span className="text-base font-black text-gray-900 dark:text-white">
                Total: {fmt(totalFiltrado)}
              </span>
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {isModalOpen && <ModalNovaConta onClose={() => setIsModalOpen(false)} />}

    </div>
  );
}
