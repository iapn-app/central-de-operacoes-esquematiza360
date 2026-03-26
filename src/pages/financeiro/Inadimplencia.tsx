import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, RefreshCw, Send } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function Inadimplencia() {
  const [inadimplentes, setInadimplentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca]     = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await financeService.getInadimplencia();
    setInadimplentes(data);
    setLoading(false);
  }

  const filtrados = inadimplentes.filter(i =>
    (i.description ?? '').toLowerCase().includes(busca.toLowerCase()) ||
    (i.empresa_nome ?? '').toLowerCase().includes(busca.toLowerCase())
  );

  const totalInadimplente = filtrados.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clientes em Atraso"
        subtitle="Monitoramento de inadimplência — lançamentos de receita vencidos"
        actions={
          <ActionButton variant="secondary" onClick={load}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </ActionButton>
        }
      />

      {/* KPI resumo */}
      {filtrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total Inadimplente</p>
            <p className="text-2xl font-black text-red-700">{fmt(totalInadimplente)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Clientes em atraso</p>
            <p className="text-2xl font-black text-amber-700">{filtrados.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 col-span-2 md:col-span-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Média por atraso</p>
            <p className="text-2xl font-black text-gray-700">
              {filtrados.length > 0 ? fmt(totalInadimplente / filtrados.length) : 'R$ 0,00'}
            </p>
          </div>
        </div>
      )}

      <SectionCard>
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por cliente ou empresa..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Carregando...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <AlertTriangle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">
              {busca ? 'Nenhum resultado para a busca.' : 'Nenhum cliente em atraso. 🎉'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Receitas pendentes com vencimento passado aparecem aqui automaticamente.
            </p>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Descrição / Cliente</Th>
                <Th>Empresa</Th>
                <Th>Valor Vencido</Th>
                <Th>Vencimento</Th>
                <Th>Dias de Atraso</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item, i) => (
                <Tr key={item.id ?? i}>
                  <Td className="font-bold">{item.description}</Td>
                  <Td className="text-gray-500 text-sm">{item.empresa_nome || '—'}</Td>
                  <Td className="font-black text-rose-600">{fmt(item.amount)}</Td>
                  <Td className="text-red-500 font-medium">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '—'}
                  </Td>
                  <Td>
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                      {item.dias_atraso} dias
                    </span>
                  </Td>
                  <Td className="text-right">
                    <button className="flex items-center gap-1 text-amber-600 font-bold text-xs hover:underline px-2 py-1 rounded-lg hover:bg-amber-50 transition">
                      <Send className="w-3 h-3" /> Cobrar
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
