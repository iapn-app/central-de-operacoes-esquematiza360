import { supabase } from '../lib/supabase';

const TIMEOUT_MS = 10000;

const withTimeout = <T>(promise: PromiseLike<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]) as Promise<T>;
};

export const financeService = {
  async getBankAccounts() {
    try {
      const { data, error } = await withTimeout(
        supabase.from('bank_accounts').select('*'),
        TIMEOUT_MS
      );
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getBankAccounts:', error);
      return [];
    }
  },

  async getBankTransactions(accountId?: string) {
    try {
      let query = supabase.from('bank_transactions').select('*');
      if (accountId) query = query.eq('account_id', accountId);

      const { data, error } = await withTimeout(
        query.order('transaction_date', { ascending: false }),
        TIMEOUT_MS
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getBankTransactions:', error);
      return [];
    }
  },

  async getAccountsReceivable(filters?: any) {
    return [];
  },

  async getAccountsPayable(filters?: any) {
    return [];
  },

  async getInadimplencia() {
    return [];
  },

  async getFinancialEntries(filters?: { type?: string; status?: string; search?: string }) {
    try {
      let query = supabase
        .from('lancamentos')
        .select('*, empresas(nome), contas_bancarias(banco_nome, conta)')
        .order('created_at', { ascending: false });
      if (filters?.type && filters.type !== 'todos') {
        const tipo = filters.type === 'income' ? 'receita' : filters.type === 'expense' ? 'despesa' : filters.type;
        query = query.eq('tipo', tipo);
      }
      if (filters?.status && filters.status !== 'todos') query = query.eq('status', filters.status);
      if (filters?.search) query = query.ilike('descricao', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) { console.error('getFinancialEntries:', error); return []; }
      // Normaliza campos para manter compatibilidade com a UI existente
      return (data ?? []).map((r: any) => ({
        ...r,
        id: r.id,
        description: r.descricao ?? '',
        amount: Number(r.valor ?? 0),
        type: r.tipo === 'receita' ? 'income' : 'expense',
        category: r.categoria ?? '',
        status: r.status ?? 'pendente',
        due_date: r.data_vencimento ? r.data_vencimento.split('T')[0] : '',
        payment_date: r.data_pagamento ? r.data_pagamento.split('T')[0] : '',
        empresa_nome: r.empresas?.nome ?? '',
        conta_info: r.contas_bancarias ? `${r.contas_bancarias.banco_nome} — ${r.contas_bancarias.conta}` : '',
      }));
    } catch (err) {
      console.error('getFinancialEntries unexpected:', err);
      return [];
    }
  },

  async createFinancialEntry(entry: any) {
    const payload = {
      descricao:       entry.description ?? entry.descricao ?? '',
      valor:           Number(entry.amount ?? entry.valor ?? 0),
      tipo:            entry.type === 'income' ? 'receita' : entry.type === 'expense' ? 'despesa' : (entry.tipo ?? 'despesa'),
      categoria:       entry.category ?? entry.categoria ?? 'Outros',
      status:          entry.status ?? 'pendente',
      data_vencimento: entry.due_date   ?? entry.data_vencimento ?? null,
      data_pagamento:  entry.payment_date ?? entry.data_pagamento ?? null,
      empresa_id:      entry.empresa_id ?? null,
      conta_id:        entry.conta_id   ?? null,
    };
    const { data, error } = await supabase.from('lancamentos').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async getCollectionActions() {
    const { data, error } = await supabase
      .from('collection_actions')
      .select('*, accounts_receivable(client_name, amount, due_date)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createCollectionAction(action: any) {
    const { data, error } = await supabase.from('collection_actions').insert(action).select().single();
    if (error) throw error;
    return data;
  },

  async getCashflowProjections() {
    const { data, error } = await supabase
      .from('cashflow_projections')
      .select('*')
      .order('reference_date', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
};
