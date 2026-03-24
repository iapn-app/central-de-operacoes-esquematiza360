import { supabase } from '@/lib/supabase'

export async function getDashboardFinance() {
  const { data, error } = await supabase
    .from("vw_finance_dashboard")
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao buscar dashboard:", error);
    throw error;
  }

  return data;
}

export async function getFinanceKPIs() {
  const { data, error } = await supabase.rpc('get_finance_dashboard_kpis')

  if (error) {
    console.error('Erro KPIs:', error)
    throw error
  }

  console.log('KPIs:', data)

  return data?.[0] || null
}
