import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, Clock, Search, MoreVertical, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function Lancamentos() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', type: 'income', category: '', due_date: '', payment_date: '', notes: '' });

  useEffect(() => {
    loadEntries();
  }, [filtroTipo, filtroStatus, busca]);

  async function loadEntries() {
    setLoading(true);
    const data = await financeService.getFinancialEntries({ type: filtroTipo, status: filtroStatus, search: busca });
    setEntries(data);
    setLoading(false);
  }

  const handleSave = async () => {
    await financeService.createFinancialEntry(form);
    setOpenModal(false);
    loadEntries();
  };

  const totalEntradas = entries.filter(e => e.type === 'income').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalSaidas = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const saldoPeriodo = totalEntradas - totalSaidas;
  const pendentes = entries.filter(e => e.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader 
        title="Lançamentos" 
        subtitle="Registro de entradas e saídas financeiras"
        actions={
          <ActionButton onClick={() => setOpenModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Entradas', value: `R$ ${totalEntradas.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500' },
          { title: 'Total Saídas', value: `R$ ${totalSaidas.toFixed(2)}`, icon: TrendingDown, color: 'text-rose-500' },
          { title: 'Saldo do Período', value: `R$ ${saldoPeriodo.toFixed(2)}`, icon: Wallet, color: 'text-blue-500' },
          { title: 'Pendentes', value: pendentes, icon: Clock, color: 'text-amber-500' },
        ].map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <SectionCard>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            {['todos', 'income', 'expense'].map(t => (
              <button 
                key={t} 
                onClick={() => setFiltroTipo(t)} 
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all", 
                  filtroTipo === t 
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                {t === 'income' ? 'Entradas' : t === 'expense' ? 'Saídas' : 'Todos'}
              </button>
            ))}
          </div>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)} 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {['todos', 'pago', 'pendente', 'cancelado'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
              placeholder="Buscar lançamentos..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
            />
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Descrição</Th>
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
            {entries.map((e) => (
              <Tr key={e.id}>
                <Td className="font-bold">{e.description}</Td>
                <Td className="text-gray-500 font-medium">{e.category}</Td>
                <Td>
                  <StatusBadge 
                    status={e.type === 'income' ? 'Pago' : 'Atrasado'} 
                    label={e.type === 'income' ? 'Entrada' : 'Saída'} 
                  />
                </Td>
                <Td className={`font-black ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  R$ {(e.amount || 0).toFixed(2)}
                </Td>
                <Td className="text-gray-500 font-medium">{e.due_date}</Td>
                <Td className="text-gray-500 font-medium">{e.payment_date}</Td>
                <Td>
                  <StatusBadge 
                    status={e.status === 'pago' ? 'Pago' : e.status === 'pendente' ? 'Pendente' : 'Cancelado'} 
                    label={e.status} 
                  />
                </Td>
                <Td className="text-right">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Novo Lançamento</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Descrição" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, description: e.target.value})} />
              <input type="number" placeholder="Valor" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, amount: e.target.value})} />
              <select className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, type: e.target.value})}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <select className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">Selecione uma categoria</option>
                {['Operacional', 'RH', 'Infraestrutura', 'Impostos', 'Frota', 'TI', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Vencimento</label>
                  <input type="date" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Pagamento</label>
                  <input type="date" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" onChange={e => setForm({...form, payment_date: e.target.value})} />
                </div>
              </div>
              <textarea placeholder="Notas adicionais" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[100px]" onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <ActionButton variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</ActionButton>
              <ActionButton onClick={handleSave}>Salvar Lançamento</ActionButton>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
