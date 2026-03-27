import { supabase } from '@/lib/supabase'

export async function getFinancialSummary() {
  const { data, error } = await supabase
    .from('bank_transactions')
    .select('*')

  if (error) {
    console.error('Erro ao buscar transações:', error)
    return null
  }

  let entradas = 0
  let saidas = 0

  data.forEach((item: any) => {
    if (item.amount > 0) {
      entradas += item.amount
    } else {
      saidas += Math.abs(item.amount)
    }
  })

  const saldo = entradas - saidas

  return {
    entradas,
    saidas,
    saldo
  }
}
