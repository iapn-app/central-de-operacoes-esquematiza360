import React, { useState, useEffect } from 'react';
import { Building2, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Landmark } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';
import { supabase } from '../../lib/supabase';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const COR_BANCO: Record<string, string> = {
  'Itaú': '#EC6625', 'Bradesco': '#CC0000', 'Inter': '#FF7A00',
  'Santander': '#EC0000', 'Caixa': '#005CA9',
};

export function CaixaBancos() {
  const [accounts, setAccounts]         = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contaSel, setContaSel]         = useState<string>('');
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    supabase
      .from('contas_bancarias')
      .select('id, banco_nome, agencia, conta, saldo_atual, empresa_id, empresas(nome)')
      .order('banco_nome')
      .then(({ data }) => {
        if (!alive) return;
        setAccounts((data ?? []).map((c: any) => ({
          id:             c.id,
          bank_name:      c.banco_nome ?? '',
          agency:         c.agencia    ?? '',
          account_number: c.conta      ?? '',
          balance:        Number(c.saldo_atual ?? 0),
          empresa_nome:   c.empresas?.nome ?? '',
          name:           `${c.banco_nome} — ${c.conta}`,
        })));
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (contaSel) loadTrans(contaSel);
    else loadTrans();
  }, [contaSel]);

  async function load() {
    // reload
    setLoading(true);
    const { data } = await supabase
      .from('contas_bancarias')
      .select('id, banco_nome, agencia, conta, saldo_atual, empresa_id, empresas(nome)')
      .order('banco_nome');
    setAccounts((data ?? []).map((c: any) => ({
      id: c.id, bank_name: c.banco_nome ?? '', agency: c.agencia ?? '',
      account_number: c.conta ?? '', balance: Number(c.saldo_atual ?? 0),
      empresa_nome: c.empresas?.nome ?? '', name: `${c.banco_nome} — ${c.conta}`,
    })));
    setLoading(false);
  }

  async function loadTrans(contaId?: string) {
    const data = await financeService.getBankTransactions(contaId);
    setTransactions(data);
  }

  const saldoTotal = accounts.reduce((s, a) => s + a.balance, 0);

  if (loading) return (
    <div className="py-16 text-center">
      <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Caixa e Bancos"
        subtitle="Saldos e movimentações das 10 contas bancárias"
        actions={
          <ActionButton variant="secondary" onClick={load}>
            <RefreshCw className="w-4 h-4" /> Atualizar
          </ActionButton>
        }
      />

      {/* Saldo consolidado */}
      <div className="bg-gradient-to-r from-[#333A56] to-[#252c44] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium mb-1">Saldo consolidado — todas as contas</p>
          <p className="text-4xl font-black">{fmt(saldoTotal)}</p>
          <p className="text-white/50 text-xs mt-1">{accounts.length} contas bancárias ativas</p>
        </div>
        <Landmark className="w-12 h-12 text-white/20" />
      </div>

      {/* Cards das contas */}
      {accounts.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-gray-500 font-semibold text-sm">Nenhuma conta bancária cadastrada.</p>
          <p className="text-gray-400 text-xs">Execute o SQL de schema para inserir as 10 contas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((acc, i) => {
            const cor = COR_BANCO[acc.bank_name] ?? '#333A56';
            const sel = contaSel === acc.id;
            return (
              <button key={acc.id ?? i} onClick={() => setContaSel(sel ? '' : acc.id)}
                className={`text-left rounded-2xl border-2 p-5 transition-all ${sel ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-white hover:border-gray-200'} shadow-sm`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: cor }}>
                    {acc.bank_name?.[0] ?? 'B'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{acc.bank_name}</p>
                    <p className="text-xs text-gray-400 truncate">Ag {acc.agency} — {acc.account_number}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-1">{acc.empresa_nome}</p>
                <p className={`text-xl font-black ${acc.balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {fmt(acc.balance)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Extrato */}
      <SectionCard
        title={contaSel ? `Movimentações — ${accounts.find(a => a.id === contaSel)?.name ?? ''}` : 'Últimas movimentações (todas as contas)'}
        action={
          contaSel ? (
            <button onClick={() => setContaSel('')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline">
              Ver todas
            </button>
          ) : undefined
        }
      >
        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <ArrowUpRight className="w-8 h-8 text-gray-200 mx-auto" />
            <p className="text-gray-400 text-sm font-medium">
              Nenhuma movimentação paga registrada.
            </p>
            <p className="text-gray-400 text-xs">
              As movimentações aparecem quando lançamentos são marcados como "pago".
            </p>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Descrição</Th>
                <Th>Data</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <Tr key={t.id ?? i}>
                  <Td className="font-bold">{t.description}</Td>
                  <Td className="text-gray-500 font-medium">
                    {t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '—'}
                  </Td>
                  <Td>
                    {t.type === 'credit'
                      ? <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs"><ArrowUpRight className="w-3 h-3" />Entrada</span>
                      : <span className="flex items-center gap-1 text-rose-600 font-semibold text-xs"><ArrowDownLeft className="w-3 h-3" />Saída</span>
                    }
                  </Td>
                  <Td className={`font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
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
