import { supabase } from '../lib/supabase';

// ─── helpers ────────────────────────────────────────────────────────────────

const norm = (r: any) => ({
  ...r,
  description:   r.descricao    ?? '',
  amount:        Number(r.valor ?? 0),
  type:          r.tipo === 'receita' ? 'income' : 'expense',
  category:      r.categoria    ?? '',
  status:        r.status       ?? 'pendente',
  due_date:      r.data_vencimento ? r.data_vencimento.split('T')[0] : '',
  payment_date:  r.data_pagamento  ? r.data_pagamento.split('T')[0]  : '',
  empresa_nome:  r.empresas?.nome  ?? '',
  conta_info:    r.contas_bancarias
    ? `${r.contas_bancarias.banco_nome} — ${r.contas_bancarias.conta}`
    : '',
});

// ─── service ────────────────────────────────────────────────────────────────

export const financeService = {

  // Contas bancárias reais
  async getBankAccounts() {
    try {
      const { data } = await supabase
        .from('contas_bancarias')
        .select('id, banco_nome, agencia, conta, saldo_atual, empresa_id, empresas(nome)')
        .order('banco_nome');
      return (data ?? []).map((c: any) => ({
        ...c,
        name:            `${c.banco_nome} — ${c.conta}`,
        bank_name:       c.banco_nome,
        agency:          c.agencia,
        account_number:  c.conta,
        balance:         Number(c.saldo_atual ?? 0),
        current_balance: Number(c.saldo_atual ?? 0),
        empresa_nome:    c.empresas?.nome ?? '',
      }));
    } catch { return []; }
  },

  // Transações = lançamentos pagos da conta
  async getBankTransactions(contaId?: string) {
    try {
      let q = supabase
        .from('lancamentos')
        .select('id, descricao, valor, tipo, status, data_pagamento, data_vencimento, conta_id')
        .eq('status', 'pago')
        .order('data_pagamento', { ascending: false })
        .limit(100);
      if (contaId) q = q.eq('conta_id', contaId);
      const { data } = await q;
      return (data ?? []).map((r: any) => ({
        id:          r.id,
        description: r.descricao,
        date:        r.data_pagamento ?? r.data_vencimento,
        amount:      Number(r.valor),
        type:        r.tipo === 'receita' ? 'credit' : 'debit',
        balance:     0,
        reconciled:  true,
      }));
    } catch { return []; }
  },

  // Contas a receber = lancamentos receita pendente/vencido
  async getAccountsReceivable(filters?: any) {
    try {
      let q = supabase
        .from('lancamentos')
        .select('*, empresas(nome), contas_bancarias(banco_nome)')
        .eq('tipo', 'receita')
        .order('data_vencimento', { ascending: true });
      if (filters?.status && filters.status !== 'todos')
        q = q.eq('status', filters.status);
      else
        q = q.in('status', ['pendente', 'cancelado']);
      const { data } = await q;
      return (data ?? []).map((r: any) => ({
        ...norm(r),
        cliente:       r.descricao ?? '',
        client_name:   r.descricao ?? '',
        vencimento:    r.data_vencimento,
        dias_atraso:   r.data_vencimento
          ? Math.max(0, Math.floor((Date.now() - new Date(r.data_vencimento).getTime()) / 86400000))
          : 0,
      }));
    } catch { return []; }
  },

  // Contas a pagar = lancamentos despesa pendente
  async getAccountsPayable(filters?: any) {
    try {
      let q = supabase
        .from('lancamentos')
        .select('*, empresas(nome), contas_bancarias(banco_nome)')
        .eq('tipo', 'despesa')
        .order('data_vencimento', { ascending: true });
      if (filters?.status && !['todos','pending','approved','paid'].includes(filters.status))
        q = q.eq('status', filters.status);
      else if (filters?.status === 'paid')
        q = q.eq('status', 'pago');
      else
        q = q.in('status', ['pendente', 'cancelado']);
      const { data } = await q;
      const now = Date.now();
      return (data ?? []).map((r: any) => {
        const venc = r.data_vencimento ? new Date(r.data_vencimento).getTime() : 0;
        const diff = (venc - now) / 86400000;
        const autoStatus = r.status === 'pago' ? 'paid'
          : venc && venc < now ? 'overdue'
          : diff <= 7 ? 'due_soon' : 'pending';
        return { ...norm(r), status: autoStatus, fornecedor: r.descricao ?? '' };
      });
    } catch { return []; }
  },

  // Inadimplência = receitas vencidas há mais de 1 dia
  async getInadimplencia() {
    try {
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('lancamentos')
        .select('*, empresas(nome)')
        .eq('tipo', 'receita')
        .eq('status', 'pendente')
        .lt('data_vencimento', ontem)
        .order('data_vencimento', { ascending: true });
      return (data ?? []).map((r: any) => ({
        ...norm(r),
        client_name: r.descricao ?? '',
        customers:   { name: r.descricao ?? '' },
        due_date:    r.data_vencimento,
        stage:       'AVISO',
      }));
    } catch { return []; }
  },

  // Lançamentos genéricos
  async getFinancialEntries(filters?: { type?: string; status?: string; search?: string }) {
    try {
      let q = supabase
        .from('lancamentos')
        .select('*, empresas(nome), contas_bancarias(banco_nome, conta)')
        .order('created_at', { ascending: false });
      if (filters?.type && filters.type !== 'todos') {
        const tipo = filters.type === 'income' ? 'receita' : filters.type === 'expense' ? 'despesa' : filters.type;
        q = q.eq('tipo', tipo);
      }
      if (filters?.status && filters.status !== 'todos') q = q.eq('status', filters.status);
      if (filters?.search) q = q.ilike('descricao', `%${filters.search}%`);
      const { data, error } = await q;
      if (error) { console.error('getFinancialEntries:', error); return []; }
      return (data ?? []).map(norm);
    } catch { return []; }
  },

  async createFinancialEntry(entry: any) {
    const payload = {
      descricao:       entry.description ?? entry.descricao ?? '',
      valor:           Number(entry.amount ?? entry.valor ?? 0),
      tipo:            entry.type === 'income' ? 'receita' : entry.type === 'expense' ? 'despesa' : (entry.tipo ?? 'despesa'),
      categoria:       entry.category ?? entry.categoria ?? 'Outros',
      status:          entry.status ?? 'pendente',
      data_vencimento: entry.due_date      ?? entry.data_vencimento ?? null,
      data_pagamento:  entry.payment_date  ?? entry.data_pagamento  ?? null,
      empresa_id:      entry.empresa_id    ?? null,
      conta_id:        entry.conta_id      ?? null,
    };
    const { data, error } = await supabase.from('lancamentos').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  // Fluxo de caixa: agrupa lançamentos por semana do mês
  async getCashflowProjections() {
    try {
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const fim    = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0).toISOString().split('T')[0];
      const { data } = await supabase
        .from('lancamentos')
        .select('tipo, valor, data_vencimento, status')
        .gte('data_vencimento', inicio)
        .lte('data_vencimento', fim)
        .neq('status', 'cancelado');
      if (!data?.length) return [];
      const semanas: Record<string, { semana: string; entradas: number; saidas: number; saldo: number }> = {};
      data.forEach((r: any) => {
        const d = new Date(r.data_vencimento);
        const semNum = Math.ceil(d.getDate() / 7);
        const key = `S${semNum}`;
        if (!semanas[key]) semanas[key] = { semana: key, entradas: 0, saidas: 0, saldo: 0 };
        const v = Number(r.valor);
        if (r.tipo === 'receita') semanas[key].entradas += v;
        else semanas[key].saidas += v;
        semanas[key].saldo = semanas[key].entradas - semanas[key].saidas;
      });
      return Object.values(semanas).sort((a, b) => a.semana.localeCompare(b.semana));
    } catch { return []; }
  },

  // DRE real: agrupa lançamentos por categoria no período
  async getDRE(empresaId?: string, periodo?: string) {
    try {
      const [ano, mes] = (periodo ?? `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`).split('-');
      const inicio = `${ano}-${mes}-01`;
      const fim    = new Date(Number(ano), Number(mes), 0).toISOString().split('T')[0];
      let q = supabase
        .from('lancamentos')
        .select('tipo, valor, categoria, status')
        .gte('data_vencimento', inicio)
        .lte('data_vencimento', fim)
        .neq('status', 'cancelado');
      if (empresaId) q = q.eq('empresa_id', empresaId);
      const { data } = await q;
      if (!data?.length) return null;
      const receitas  = data.filter((r: any) => r.tipo === 'receita');
      const despesas  = data.filter((r: any) => r.tipo === 'despesa');
      const receitaTotal = receitas.reduce((s: number, r: any) => s + Number(r.valor), 0);
      const despesaTotal = despesas.reduce((s: number, r: any) => s + Number(r.valor), 0);
      const lucro = receitaTotal - despesaTotal;
      const porCategoria = (arr: any[]) => arr.reduce((acc: any, r: any) => {
        acc[r.categoria] = (acc[r.categoria] ?? 0) + Number(r.valor);
        return acc;
      }, {} as Record<string, number>);
      return {
        receitaTotal, despesaTotal, lucro,
        ebitda: lucro,
        margemLucro: receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0,
        receitasPorCategoria: porCategoria(receitas),
        despesasPorCategoria: porCategoria(despesas),
      };
    } catch { return null; }
  },
};
