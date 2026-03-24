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
    let query = supabase.from('financial_entries').select('*').order('created_at', { ascending: false });
    if (filters?.type && filters.type !== 'todos') query = query.eq('type', filters.type);
    if (filters?.status && filters.status !== 'todos') query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('description', `%${filters.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async createFinancialEntry(entry: any) {
    const { data, error } = await supabase.from('financial_entries').insert(entry).select().single();
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
