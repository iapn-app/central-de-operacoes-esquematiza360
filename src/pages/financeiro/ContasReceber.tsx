import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, Search, Plus, Building2, Calendar,
  AlertCircle, CheckCircle2, Clock, MoreVertical, Download, Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/Modal';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type StatusFatura = 'PAGO' | 'A VENCER' | 'VENCIDO';

function calcStatus(vencimento: string, pago: boolean): StatusFatura {
  if (pago) return 'PAGO';
  return new Date(vencimento) < new Date() ? 'VENCIDO' : 'A VENCER';
}

export function ContasReceber() {
  const [faturas, setFaturas]       = useState<any[]>([]);
  const [empresas, setEmpresas]     = useState<any[]>([]);
  const [contas, setContas]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    descricao: '', valor: '', empresa_id: '', conta_id: '', vencimento: '',
  });

  useEffect(() => { load(); loadEmpresas(); }, []);
  useEffect(() => {
    if (form.empresa_id) loadContas(form.empresa_id);
    else setContas([]);
  }, [form.empresa_id]);

  async function load() {
    setLoading(true);
    const data = await financeService.getAccountsReceivable();
    setFaturas(data);
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
        type: 'income', category: 'Serviço Prestado', status: 'pendente',
        due_date: form.vencimento, empresa_id: form.empresa_id, conta_id: form.conta_id,
      });
      setIsModalOpen(false);
      setForm({ descricao: '', valor: '', empresa_id: '', conta_id: '', vencimento: '' });
      load();
    } finally { setSaving(false); }
  }

  const filtered = faturas.filter(f => {
    const st = calcStatus(f.due_date, f.status === 'pago');
    const matchSearch = (f.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'TODOS' || st === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalReceber = faturas.filter(f => f.status !== 'pago').reduce((a, f) => a + f.amount, 0);
  const totalVencido = faturas.filter(f => calcStatus(f.due_date, false) === 'VENCIDO').reduce((a, f) => a + f.amount, 0);
  const totalPago    = faturas.filter(f => f.status === 'pago').reduce((a, f) => a + f.amount, 0);

  const inputCls = 'w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            Contas a Receber
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Acompanhamento de faturas, inadimplência e régua de cobrança.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition shadow-sm">
          <Plus className="w-4 h-4" /> Novo Recebimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'A Receber', value: fmt(totalReceber), icon: Clock,        bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Inadimplência', value: fmt(totalVencido), icon: AlertCircle, bg: 'bg-red-50',  cor: 'text-red-600' },
          { label: 'Recebido', value: fmt(totalPago),     icon: CheckCircle2, bg: 'bg-emerald-50', cor: 'text-emerald-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${item.bg} rounded-lg`}><Icon className={`w-5 h-5 ${item.cor}`} /></div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
              </div>
              <p className="text-3xl font-black text-slate-900">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODOS">Todos</option>
              <option value="A VENCER">A Vencer</option>
              <option value="VENCIDO">Vencido</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-500 font-semibold">Nenhuma conta a receber.</p>
            <p className="text-gray-400 text-xs">Registre os valores que seus clientes devem pagar.</p>
            <button onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Cadastrar recebimento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['Descrição', 'Empresa', 'Valor', 'Vencimento', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((f, i) => {
                  const st = calcStatus(f.due_date, f.status === 'pago');
                  return (
                    <tr key={f.id ?? i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-sm">{f.description}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-slate-600">{f.empresa_nome || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-700 text-sm">{fmt(f.amount)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={cn('text-sm font-medium', st === 'VENCIDO' ? 'text-red-600' : 'text-slate-700')}>
                            {f.due_date ? new Date(f.due_date).toLocaleDateString('pt-BR') : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border',
                          st === 'PAGO'    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          st === 'VENCIDO' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        )}>{st}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {st === 'VENCIDO' && (
                            <button className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition" title="Cobrar">
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Recebimento" maxWidth="max-w-md">
        <div className="space-y-4">
          <input type="text" placeholder="Descrição / Cliente *" className={inputCls}
            value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          <input type="number" placeholder="Valor (R$) *" className={inputCls} min="0" step="0.01"
            value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Empresa *</label>
            <select className={inputCls} value={form.empresa_id}
              onChange={e => setForm({ ...form, empresa_id: e.target.value, conta_id: '' })}>
              <option value="">Selecione</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Conta bancária *</label>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
            <button onClick={salvar} disabled={saving || !form.descricao || !form.valor || !form.empresa_id || !form.conta_id}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
