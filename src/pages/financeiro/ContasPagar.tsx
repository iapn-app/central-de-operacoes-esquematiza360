import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Plus, CheckCircle2, AlertTriangle,
  Calendar, CheckSquare, MoreVertical, Building2, Landmark,
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const CATEGORIAS_PAGAR = [
  'Encargos (INSS/FGTS)', 'Folha de Pagamento', 'Fornecedores',
  'Manutenção', 'Impostos', 'Seguros', 'Aluguel', 'Frota', 'TI', 'Outros',
];

export function ContasPagar() {
  const [payables, setPayables]     = useState<any[]>([]);
  const [empresas, setEmpresas]     = useState<any[]>([]);
  const [contas, setContas]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [busca, setBusca]           = useState('');
  const [activeTab, setActiveTab]   = useState<'pending'|'overdue'|'paid'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    descricao: '', valor: '', categoria: '', vencimento: '',
    empresa_id: '', conta_id: '',
  });

  useEffect(() => { load(); loadEmpresas(); }, [activeTab]);
  useEffect(() => {
    if (form.empresa_id) loadContas(form.empresa_id);
    else setContas([]);
  }, [form.empresa_id]);

  async function load() {
    setLoading(true);
    const data = await financeService.getAccountsPayable({ status: activeTab });
    setPayables(data ?? []);
    setLoading(false);
  }

  async function loadEmpresas() {
    const { data } = await supabase.from('empresas').select('id, nome').order('nome');
    setEmpresas(data ?? []);
  }

  async function loadContas(eId: string) {
    const { data } = await supabase
      .from('contas_bancarias').select('id, banco_nome, agencia, conta')
      .eq('empresa_id', eId);
    setContas(data ?? []);
  }

  async function salvar() {
    if (!form.descricao || !form.valor || !form.empresa_id || !form.conta_id) return;
    setSaving(true);
    try {
      await financeService.createFinancialEntry({
        description: form.descricao, amount: form.valor,
        type: 'expense', category: form.categoria || 'Outros',
        status: 'pendente', due_date: form.vencimento,
        empresa_id: form.empresa_id, conta_id: form.conta_id,
      });
      setIsModalOpen(false);
      setForm({ descricao: '', valor: '', categoria: '', vencimento: '', empresa_id: '', conta_id: '' });
      load();
    } finally { setSaving(false); }
  }

  const filtrados = payables.filter(p =>
    (p.description ?? '').toLowerCase().includes(busca.toLowerCase())
  );

  const vencidas    = payables.filter(p => p.status === 'overdue');
  const semana      = payables.filter(p => p.status === 'due_soon');
  const totalVenc   = vencidas.reduce((a, p) => a + p.amount, 0);
  const totalSem    = semana.reduce((a, p) => a + p.amount, 0);
  const totalMes    = payables.reduce((a, p) => a + p.amount, 0);
  const totalPagas  = payables.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);

  const kpis = [
    { title: 'Vencidas',          value: fmt(totalVenc), subtitle: `${vencidas.length} contas`,      icon: AlertTriangle, color: 'text-rose-500' },
    { title: 'Vence esta semana', value: fmt(totalSem),  subtitle: 'A vencer em 7 dias',             icon: Calendar,      color: 'text-amber-500' },
    { title: 'Total do mês',      value: fmt(totalMes),  subtitle: `${payables.length} lançamentos`, icon: DollarSign,    color: 'text-blue-500' },
    { title: 'Liquidadas',        value: fmt(totalPagas),subtitle: 'Pagas no período',               icon: CheckSquare,   color: 'text-emerald-500' },
  ];

  const tabs = [
    { id: 'pending',  label: 'A Vencer' },
    { id: 'overdue',  label: 'Vencidas' },
    { id: 'paid',     label: 'Pagas' },
  ] as const;

  const inputCls = 'w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contas a Pagar"
        subtitle="Gestão de obrigações financeiras do Grupo Esquematiza"
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 w-48" />
            </div>
            <ActionButton onClick={() => setIsModalOpen(true)}>+ Nova conta</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <SectionCard>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap active:scale-95 ${
                activeTab === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-500 font-semibold">Nenhuma conta cadastrada.</p>
            <button onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Cadastrar conta
            </button>
          </div>
        ) : (
          <Table>
            <thead><tr>
              <Th>Descrição</Th><Th>Empresa</Th><Th>Categoria</Th>
              <Th>Vencimento</Th><Th>Valor</Th><Th>Status</Th>
              <Th className="text-right">Ação</Th>
            </tr></thead>
            <tbody>
              {filtrados.map((item, idx) => (
                <Tr key={item.id ?? idx}>
                  <Td className="font-bold">{item.description}</Td>
                  <Td className="text-gray-500 text-sm">{item.empresa_nome || '—'}</Td>
                  <Td className="text-gray-500">{item.category}</Td>
                  <Td className={item.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                    {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '—'}
                  </Td>
                  <Td className="font-black text-rose-700">{fmt(item.amount)}</Td>
                  <Td>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      item.status === 'paid'    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                      item.status === 'due_soon'? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {item.status === 'paid' ? 'Pago' : item.status === 'overdue' ? 'Vencida' : item.status === 'due_soon' ? 'Vence em breve' : 'A vencer'}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition active:scale-95">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5 text-slate-900">Nova Conta a Pagar</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Fornecedor / Descrição *" className={inputCls}
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              <input type="number" placeholder="Valor (R$) *" className={inputCls} min="0" step="0.01"
                value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
              <select className={inputCls} value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Categoria</option>
                {CATEGORIAS_PAGAR.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Empresa *
                </label>
                <select className={inputCls} value={form.empresa_id}
                  onChange={e => setForm({ ...form, empresa_id: e.target.value, conta_id: '' })}>
                  <option value="">Selecione</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1">
                  <Landmark className="w-3 h-3" /> Conta bancária *
                </label>
                <select className={inputCls} value={form.conta_id} disabled={!form.empresa_id}
                  onChange={e => setForm({ ...form, conta_id: e.target.value })}>
                  <option value="">Selecione</option>
                  {contas.map(c => <option key={c.id} value={c.id}>{c.banco_nome} Ag {c.agencia} — {c.conta}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Vencimento</label>
                <input type="date" className={inputCls}
                  value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
              <button onClick={salvar}
                disabled={saving || !form.descricao || !form.valor || !form.empresa_id || !form.conta_id}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
