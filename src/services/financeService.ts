import { supabase } from '@/lib/supabase'

type FinancialEntryPayload = {
  descricao: string
  valor: string | number
  tipo: string
  categoria?: string
  vencimento?: string
  empresa_id: string
  conta_id: string
}

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
    if (Number(item.amount) > 0) {
      entradas += Number(item.amount)
    } else {
      saidas += Math.abs(Number(item.amount))
    }
  })

  const saldo = entradas - saidas

  return {
    entradas,
    saidas,
    saldo
  }
}

export async function getFinancialData() {
  const { data, error } = await supabase
    .from('financial_invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar lançamentos financeiros:', error)
    return []
  }

  return data ?? []
}

export async function createFinancialEntry(payload: FinancialEntryPayload) {
  const valorNumerico = Number(payload.valor)

  const { data, error } = await supabase
    .from('financial_invoices')
    .insert([
      {
        descricao: payload.descricao,
        valor: valorNumerico,
        tipo: payload.tipo,
        categoria: payload.categoria || null,
        vencimento: payload.vencimento || null,
        empresa_id: payload.empresa_id,
        conta_id: payload.conta_id
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar lançamento financeiro:', error)
    throw error
  }

  return data
}

const financeService = {
  getFinancialSummary,
  getFinancialData,
  createFinancialEntry
}

export default financeService
