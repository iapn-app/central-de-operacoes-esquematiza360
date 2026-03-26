import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Wallet, Clock,
  Search, MoreVertical, Plus, Building2, Landmark,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { logAction } from '../../services/auditService';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr,
} from './components/FinanceComponents';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const CATEGORIAS = [
  'Operacional', 'RH', 'Infraestrutura', 'Impostos',
  'Frota', 'TI', 'Serviço Prestado', 'Aluguel', 'Outros',
];

export function Lancamentos() {
  const { user } = useAuth();
  const [entries, setEntries]       = useState<any[]>([]);
  const [empresas, setEmpresas]     = useState<any[]>([]);
  const [contas, setContas]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca]           = useState('');
  const [openModal, setOpenModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({
    description: '', amount: '', type: 'income',
    category: '', due_date: '', payment_date: '',
    empresa_id: '', conta_id: '',
  });

  useEffect(() => { loadEmpresas(); }, []);
  useEffect(() => { loadEntries(); }, [filtroTipo, filtroStatus, busca]);
  useEffect(() => {
    if (form.empresa_id) loadContas(form.empresa_id);
    else setContas([]);
  }, [form.empresa_id]);

  async function loadEmpresas() {
    const { data } = await supabase.from('empresas').select('id, nome').order('nome');
    setEmpresas(data ?? []);
  }

  async function loadContas(empresaId: string) {
    const { data } = await supabase
      .from('contas_bancarias')
      .select('id, banco_nome, agencia, conta')
      .eq('empresa_id', empresaId);
    setContas(data ?? []);
  }

  async function loadEntries() {
    setLoading(true);
    const data = await financeService.getFinancialEntries({
      type: filtroTipo, status: filtroStatus, search: busca,
    });
    setEntries(data);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.empresa_id || !form.conta_id) return;
    setSaving(true);
    try {
      await financeService.createFinancialEntry(form);
      await logAction(user?.id ?? 'unknown', 'CREATE_LANCAMENTO', {
        tabela: 'lancamentos', campo: 'valor',
        valor_depois: { valor: form.amount, empresa_id: form.empresa_id },
      });
      setOpenModal(false);
      setForm({ description: '', amount: '', type: 'income', category: '', due_date: '', payment_date: '', empresa_id: '', conta_id: '' });
      loadEntries();
    } finally {
      setSaving(false);
    }
  };

  const totalEntradas = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalSaidas   = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const saldoPeriodo  = totalEntradas - totalSaidas;
  const pendentes     = entries.filter(e => e.status === 'pendente').length;

  const inputCls = "w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader
        title="Lançamentos"
        subtitle="Registro de entradas e saídas financeiras — Grupo Esquematiza"
        actions={
          <ActionButton onClick={() => setOpenModal(true)}>
            <Plus className="w-4 h-4" /> Novo Lançamento
          </ActionButton>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Entradas',   value: loading ? '...' : fmt(totalEntradas), icon: TrendingUp,   color: 'text-emerald-500' },
          { title: 'Total Saídas',     value: loading ? '...' : fmt(totalSaidas),   icon: TrendingDown, color: 'text-rose-500' },
          { title: 'Saldo do Período', value: loading ? '...' : fmt(saldoPeriodo),  icon: Wallet,       color: 'text-blue-500' },
          { title: 'Pendentes',        value: loading ? '...' : String(pendentes),  icon: Clock,        color: 'text-amber-500' },
        ].map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      {/* Tabela */}
      <SectionCard>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            {['todos', 'income', 'expense'].map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={cn("px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all active:scale-95",
                  filtroTipo === t
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}>
                {t === 'income' ? 'Entradas' : t === 'expense' ? 'Saídas' : 'Todos'}
              </button>
            ))}
          </div>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
            {['todos', 'pago', 'pendente', 'cancelado'].map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos os status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar lançamentos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Descrição</Th>
              <Th>Empresa / Conta</Th>
              <Th>Categoria</Th>
              <Th>Tipo</Th>
              <Th>Valor</Th>
              <Th>Vencimento</Th>
              <Th>Pagamento</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm font-medium">Carregando lançamentos...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm font-medium">Nenhum lançamento encontrado. Clique em "+ Novo Lançamento" para começar.</td></tr>
            ) : entries.map((e) => (
              <Tr key={e.id}>
                <Td className="font-bold">{e.description || '—'}</Td>
                <Td>
                  <div className="text-xs">
                    {e.empresa_nome && <p className="font-semibold text-gray-700 dark:text-gray-300">{e.empresa_nome}</p>}
                    {e.conta_info   && <p className="text-gray-400">{e.conta_info}</p>}
                  </div>
                </Td>
                <Td className="text-gray-500 font-medium">{e.category || '—'}</Td>
                <Td>
                  <StatusBadge status={e.type === 'income' ? 'pago' : 'inadimplente'} label={e.type === 'income' ? 'Entrada' : 'Saída'} />
                </Td>
                <Td className={`font-black ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fmt(e.amount)}
                </Td>
                <Td className="text-gray-500 font-medium">{e.due_date || '—'}</Td>
                <Td className="text-gray-500 font-medium">{e.payment_date || '—'}</Td>
                <Td><StatusBadge status={e.status} /></Td>
                <Td className="text-right">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {/* Modal Novo Lançamento */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Novo Lançamento</h2>
            <div className="space-y-4">

              {/* Empresa */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Empresa *
                </label>
                <select className={inputCls} value={form.empresa_id}
                  onChange={e => setForm({ ...form, empresa_id: e.target.value, conta_id: '' })}>
                  <option value="">Selecione a empresa</option>
                  {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                </select>
              </div>

              {/* Conta */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Landmark className="w-3 h-3" /> Conta Bancária *
                </label>
                <select className={inputCls} value={form.conta_id} disabled={!form.empresa_id}
                  onChange={e => setForm({ ...form, conta_id: e.target.value })}>
                  <option value="">Selecione a conta</option>
                  {contas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.banco_nome} — Ag {c.agencia} / {c.conta}
                    </option>
                  ))}
                </select>
              </div>

              <input type="text" placeholder="Descrição *" className={inputCls}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              <input type="number" placeholder="Valor (R$) *" className={inputCls} min="0" step="0.01"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />

              <select className={inputCls} value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="income">Entrada (Receita)</option>
                <option value="expense">Saída (Despesa)</option>
              </select>

              <select className={inputCls} value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Vencimento</label>
                  <input type="date" className={inputCls} value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Pagamento</label>
                  <input type="date" className={inputCls} value={form.payment_date}
                    onChange={e => setForm({ ...form, payment_date: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <ActionButton variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</ActionButton>
              <ActionButton onClick={handleSave} disabled={saving || !form.description || !form.amount || !form.empresa_id || !form.conta_id}>
                {saving ? 'Salvando...' : 'Salvar Lançamento'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
