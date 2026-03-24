import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export interface ImportResult {
  totalRows: number;
  importedRows: number;
  errorRows: number;
  logs: string[];
  status: 'completed' | 'failed';
  errorMessage?: string;
}

const parseExcelDate = (excelDate: any): string | null => {
  if (!excelDate) return null;
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  if (typeof excelDate === 'string') {
    const parts = excelDate.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const d = new Date(excelDate);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  return null;
};

const parseMoney = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const clean = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const normalizeText = (str: any): string => {
  if (!str) return '';
  return String(str).trim();
};

const mapDirection = (type: string): 'in' | 'out' => {
  const t = normalizeText(type).toLowerCase();
  if (t.includes('crédito') || t.includes('credito')) return 'in';
  return 'out';
};

const isBalanceRow = (desc: string): boolean => {
  const d = normalizeText(desc).toLowerCase();
  return d.includes('saldo') || d.includes('saldo anterior');
};

const normalizeSheetName = (str: string) => {
  if (!str) return '';
  return str.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '_');
};

export const financeiroImportService = {
  async importFinancialExcel(file: File): Promise<ImportResult> {
    const reader = new FileReader();
    const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const crData: any[] = [];
    const bankData: any[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
      const normSheet = normalizeSheetName(sheetName);

      if (normSheet.includes('consolidado')) {
        crData.push(...data);
      } else if (normSheet.includes('extrato')) {
        bankData.push(...data);
      }
    }

    if (!crData || crData.length === 0) {
      throw new Error('CR Consolidado vazio ou aba não encontrada (deve conter "consolidado" no nome)');
    }

    if (!bankData || bankData.length === 0) {
      throw new Error('Extrato Bancário vazio ou aba não encontrada (deve conter "extrato" no nome)');
    }

    console.log('CR DATA:', crData.length);
    console.log('BANK DATA:', bankData.length);

    const { data: batch, error: batchError } = await supabase
      .from('import_batches')
      .insert([{ file_name: file.name, status: 'processing' }])
      .select()
      .single();

    if (batchError) throw batchError;

    try {
      let totalInserted = 0;

      // 1. Process Bank Accounts and Transactions
      const accountsMap = new Map<string, any>();
      const transactionsToInsert: any[] = [];

      for (const row of bankData) {
        const nome = normalizeText(row['Nome:']);
        const agencia = normalizeText(row['Agência:']);
        const conta = normalizeText(row['Conta:']);
        const banco = normalizeText(row['Bco']);
        
        if (!nome && !conta) continue;

        const accountKey = `${nome}-${agencia}-${conta}-${banco}`;
        const rawSaldo = row['Saldo (R$)'];
        
        if (!accountsMap.has(accountKey)) {
          accountsMap.set(accountKey, {
            account_holder: nome,
            agency: agencia,
            account_number: conta,
            bank_name: banco,
            current_balance: parseMoney(rawSaldo),
            key: accountKey
          });
        } else if (rawSaldo !== null && rawSaldo !== undefined && rawSaldo !== '') {
          accountsMap.get(accountKey).current_balance = parseMoney(rawSaldo);
        }

        const desc = normalizeText(row['Descrição']);
        if (isBalanceRow(desc)) continue;

        const date = parseExcelDate(row['Data']);
        if (!date) continue;

        const amount = Math.abs(parseMoney(row['Valor Lçto']));
        if (amount === 0) continue;

        const direction = mapDirection(row['Tp Lçto']);

        transactionsToInsert.push({
          account_key: accountKey,
          transaction_date: date,
          amount,
          direction,
          description: desc,
          counterparty_name: normalizeText(row['Razão Social']),
          counterparty_document: normalizeText(row['CPF/CNPJ'])
        });
      }

      const dbAccounts = [];
      const accountsToInsert = Array.from(accountsMap.values());
      console.log('ACCOUNTS TO INSERT:', accountsToInsert.length);

      for (const acc of accountsToInsert) {
        const { data: inserted, error: accError } = await supabase.from('bank_accounts').insert({
          account_holder: acc.account_holder,
          agency: acc.agency,
          account_number: acc.account_number,
          bank_name: acc.bank_name,
          current_balance: acc.current_balance
        }).select('id').single();
        
        if (accError) {
          console.error('INSERT ERROR:', accError);
        } else if (inserted) {
          dbAccounts.push({ ...acc, id: inserted.id });
        }
      }

      const finalTransactions = transactionsToInsert.map(t => {
        const acc = dbAccounts.find(a => a.key === t.account_key);
        return {
          account_id: acc?.id,
          transaction_date: t.transaction_date,
          amount: t.amount,
          direction: t.direction,
          description: t.description,
          counterparty_name: t.counterparty_name,
          counterparty_document: t.counterparty_document
        };
      }).filter(t => t.account_id);

      console.log('TRANSACTIONS TO INSERT:', finalTransactions.length);

      if (finalTransactions.length > 0) {
        const { error: transError } = await supabase.from('bank_transactions').insert(finalTransactions);
        if (transError) {
          console.error('INSERT ERROR:', transError);
        } else {
          totalInserted += finalTransactions.length;
        }
      }

      // 2. Process Accounts Receivable
      const receivablesToInsert = [];
      for (const row of crData) {
        const company_name = normalizeText(row['EMPRESA']);
        const customer_name = normalizeText(row['Tomador']);
        const contract_name = normalizeText(row['CONTRATO']);
        const gross_value = parseMoney(row['VALOR BRUTO']);
        const expected_value = parseMoney(row['VALOR LÍQUIDO']);
        const issue_date = parseExcelDate(row['DATA EMISSÃO NF']);
        const payment_date = parseExcelDate(row['DATA REAL PGTO']);
        const invoice_number = normalizeText(row['NUM NF']);
        const invoice_key = normalizeText(row['CHAVE FATUR']);
        const przPgto = normalizeText(row['Prz Pgto']);
        
        if (!customer_name && !expected_value) continue;

        let due_date = null;
        if (issue_date) {
          if (!isNaN(Number(przPgto))) {
            const d = new Date(issue_date);
            d.setDate(d.getDate() + Number(przPgto));
            due_date = d.toISOString().split('T')[0];
          }
        }

        let received_value = 0;
        if (payment_date) {
          received_value = expected_value;
        }

        let status = 'unknown';
        const today = new Date().toISOString().split('T')[0];
        if (payment_date && received_value >= expected_value) {
          status = 'paid';
        } else if (!payment_date && due_date) {
          if (due_date >= today) status = 'open';
          else status = 'overdue';
        }

        receivablesToInsert.push({
          company_name,
          customer_name,
          contract_name,
          gross_value,
          expected_value,
          issue_date,
          payment_date,
          invoice_number,
          invoice_key,
          due_date,
          received_value,
          status
        });
      }

      console.log('RECEIVABLES TO INSERT:', receivablesToInsert.length);

      if (receivablesToInsert.length > 0) {
        const { error: recError } = await supabase.from('accounts_receivable').insert(receivablesToInsert);
        if (recError) {
          console.error('INSERT ERROR:', recError);
        } else {
          totalInserted += receivablesToInsert.length;
        }
      }

      await supabase.from('import_batches').update({ 
        status: 'completed', 
        row_count: totalInserted 
      }).eq('id', batch.id);

      console.log('IMPORTAÇÃO FINALIZADA COM SUCESSO');

      return { 
        totalRows: totalInserted, 
        importedRows: totalInserted, 
        errorRows: 0, 
        logs: [
          `Sucesso: ${receivablesToInsert.length} recebíveis e ${finalTransactions.length} transações processadas.`,
          `Total inserido: ${totalInserted} registros.`
        ], 
        status: 'completed' 
      };
    } catch (error: any) {
      console.error('Erro na importação:', error);
      await supabase.from('import_batches').update({ 
        status: 'failed', 
        error_message: error.message 
      }).eq('id', batch.id);
      
      throw error;
    }
  },

  async seedFinancialData() {
    // Mantido por compatibilidade
  },

  async loadFinancialData() {
    const { data: invoices } = await supabase.from('accounts_receivable').select('*');
    const { data: transactions } = await supabase.from('bank_transactions').select('*');
    return { invoices, transactions };
  }
};
