import { supabase } from '../lib/supabase';

export async function getDashboardFinance() {
  try {
    const { data, error } = await supabase
      .from("vw_finance_dashboard")
      .select("*")
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getFinanceKPIs() {
  try {
    const { data, error } = await supabase.rpc('get_finance_dashboard_kpis');
    if (error) {
      console.warn('get_finance_dashboard_kpis não encontrado, retornando zeros.');
      return null;
    }
    return data?.[0] || null;
  } catch {
    return null;
  }
}
