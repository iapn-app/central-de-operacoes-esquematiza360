import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, Search, Plus, Building2, Calendar,
  AlertCircle, CheckCircle2, Clock, MoreVertical, Download, Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Modal } from '../../components/Modal';

type Fatura = {
  id: string; cliente: string; valor: number;
  vencimento: string; status: 'PAGO' | 'A VENCER' | 'VENCIDO';
  data_pagamento: string | null; dias_atraso: number;
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ContasReceber() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Futuramente: buscar do Supabase
    // const { data } = await supabase.from('faturas').select('*')
    setFaturas([]);
    setLoading(false);
  }, []);

  const filtered = faturas.filter(f => {
    const matchSearch = f.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'TODOS' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalReceber = faturas.filter(f => f.status !== 'PAGO').reduce((a, f) => a + f.valor, 0);
  const totalVencido = faturas.filter(f => f.status === 'VENCIDO').reduce((a, f) => a + f.valor, 0);
  const totalPago    = faturas.filter(f => f.status === 'PAGO').reduce((a, f) => a + f.valor, 0);

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
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Gerar Faturamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'A Receber (Mês)', value: fmt(totalReceber), icon: Clock,         bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Inadimplência',   value: fmt(totalVencido), icon: AlertCircle,   bg: 'bg-red-50',     cor: 'text-red-600' },
          { label: 'Recebido (Mês)',  value: fmt(totalPago),    icon: CheckCircle2,  bg: 'bg-emerald-50', cor: 'text-emerald-600' },
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

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar por cliente ou fatura..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODOS">Todos os Status</option>
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
            <p className="text-gray-500 font-semibold">Nenhuma fatura cadastrada ainda.</p>
            <p className="text-gray-400 text-xs">As faturas geradas pelos contratos aparecerão aqui.</p>
            <button onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Gerar primeiro faturamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['Fatura', 'Cliente', 'Valor', 'Vencimento', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-gray-600 text-sm">{f.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{f.cliente}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-slate-900 text-sm">{fmt(f.valor)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={cn("text-sm font-medium", f.status === 'VENCIDO' ? "text-red-600" : "text-slate-700")}>
                          {new Date(f.vencimento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                        f.status === 'PAGO'    ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        f.status === 'VENCIDO' ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-blue-50 text-blue-700 border-blue-100"
                      )}>{f.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {f.status === 'VENCIDO' && (
                          <button className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"><Send className="w-4 h-4" /></button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><Download className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Gerar Faturamento em Lote" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">Gera faturas para todos os contratos ativos no mês selecionado.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Mês de Referência</label>
            <input type="month" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm">Gerar Faturas</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
