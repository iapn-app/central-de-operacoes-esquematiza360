import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Plus, CheckCircle2, AlertTriangle,
  Calendar, CheckSquare, MoreVertical
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ContasPagar() {
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'paid'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: '', vencimento: '', fornecedor: '' });

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      setLoading(true);
      try {
        const data = await financeService.getAccountsPayable({ status: activeTab });
        if (mounted) setPayables(data || []);
      } catch { if (mounted) setPayables([]); }
      finally { if (mounted) setLoading(false); }
    }
    fetch();
    return () => { mounted = false; };
  }, [activeTab]);

  const tabs = [
    { id: 'pending',  label: 'Aguardando Aprovação' },
    { id: 'approved', label: 'Aprovados' },
    { id: 'paid',     label: 'Pagos' },
  ] as const;

  // KPIs calculados a partir dos dados reais
  const vencidas    = payables.filter(p => p.status === 'overdue');
  const semana      = payables.filter(p => p.status === 'due_soon');
  const totalVencidas = vencidas.reduce((a, p) => a + (p.amount || 0), 0);
  const totalSemana   = semana.reduce((a, p) => a + (p.amount || 0), 0);
  const totalMes      = payables.reduce((a, p) => a + (p.amount || 0), 0);
  const totalPagas    = payables.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0);

  const kpis = [
    { title: 'Vencidas',            value: fmt(totalVencidas), subtitle: `${vencidas.length} contas`,    icon: AlertTriangle, color: 'text-rose-500' },
    { title: 'Vence esta semana',   value: fmt(totalSemana),   subtitle: 'A vencer em 7 dias',           icon: Calendar,      color: 'text-amber-500' },
    { title: 'Vence este mês',      value: fmt(totalMes),      subtitle: `${payables.length} lançamentos`, icon: DollarSign,  color: 'text-blue-500' },
    { title: 'Liquidadas (mês)',    value: fmt(totalPagas),    subtitle: 'Pagas no período',             icon: CheckSquare,   color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contas a Pagar"
        subtitle="Gestão de obrigações financeiras"
        actions={
          <>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm">
              <option value="2026-03">Março 2026</option>
              <option value="2026-04">Abril 2026</option>
            </select>
            <ActionButton onClick={() => setIsModalOpen(true)}>+ Nova conta</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.color} />)}
      </div>

      <SectionCard title="Lista de Contas a Pagar">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Carregando...</div>
        ) : payables.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-500 font-semibold">Nenhuma conta a pagar cadastrada.</p>
            <p className="text-gray-400 text-xs">Registre as obrigações financeiras do grupo aqui.</p>
            <button onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Cadastrar conta
            </button>
          </div>
        ) : (
          <Table>
            <thead><tr>
              <Th>Fornecedor</Th><Th>Categoria</Th><Th>Vencimento</Th>
              <Th>Valor</Th><Th>Status</Th><Th className="text-right">Ação</Th>
            </tr></thead>
            <tbody>
              {payables.map((item, idx) => (
                <Tr key={idx}>
                  <Td className="font-bold">{item.description || item.fornecedor}</Td>
                  <Td>{item.category || item.categoria}</Td>
                  <Td>{item.due_date || item.vencimento}</Td>
                  <Td className="font-black">{fmt(item.amount || 0)}</Td>
                  <Td><StatusBadge status={item.status} /></Td>
                  <Td className="text-right">
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h2 className="text-lg font-bold mb-5 text-slate-900">Nova Conta a Pagar</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Fornecedor / Descrição"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={e => setForm({...form, descricao: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Valor (R$)"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={e => setForm({...form, valor: e.target.value})} />
                <input type="date"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={e => setForm({...form, vencimento: e.target.value})} />
              </div>
              <select className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={e => setForm({...form, categoria: e.target.value})}>
                <option value="">Categoria</option>
                {['Encargos (INSS/FGTS)', 'Folha de Pagamento', 'Fornecedores', 'Manutenção', 'Impostos', 'Seguros', 'Outros'].map(c =>
                  <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
