export type ClientStatus = 'active' | 'inactive' | 'blocked' | 'pending';
export type ContractStatus = 'active' | 'expired' | 'cancelled' | 'suspended' | 'draft';
export type InvoiceStatus = 'draft' | 'issued' | 'cancelled' | 'paid' | 'pending';
export type ReceivableStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial';
export type TransactionStatus = 'reconciled' | 'unreconciled' | 'ignored';

export interface Company {
  id: string;
  name: string;
  document_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_id?: string;
  name: string;
  trade_name?: string;
  document_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  client_id: string;
  company_id: string;
  contract_number: string;
  service_description?: string;
  billing_format?: string;
  start_date?: string;
  end_date?: string;
  value_monthly?: number;
  billing_day?: number;
  status: ContractStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialInvoice {
  id: string;
  company_id: string;
  client_id: string;
  contract_id?: string;
  invoice_number?: string; // NUM NF
  invoice_key?: string;    // CHAVE FATUR
  bank_reference?: string; // REF BANCO
  issue_date: string;
  due_date: string;
  payment_date?: string;   // DATA REAL PGTO
  gross_value: number;
  net_value: number;
  tax_value?: number;
  service_description?: string;
  billing_format?: string;
  payment_due_days?: number; // Prz Pgto
  status: InvoiceStatus;
  import_batch_id?: string;
  import_source?: string;
  external_reference?: string;
  raw_status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountReceivable {
  id: string;
  invoice_id?: string;
  client_id: string;
  contract_id?: string;
  description?: string;
  expected_value: number;
  received_value: number;
  due_date: string;
  payment_date?: string;
  aging_category?: string;   // Aging Prz Pgto
  original_due_days?: number;
  status: ReceivableStatus;
  bank_reference?: string;
  import_batch_id?: string;
  import_source?: string;
  external_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  company_id: string;
  bank_name: string;
  account_number: string;
  agency_number: string;
  description?: string;
  created_at: string;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  external_id?: string;
  status: TransactionStatus;
  import_batch_id?: string;
  created_at: string;
}

export interface Reconciliation {
  id: string;
  receivable_id: string;
  transaction_id: string;
  reconciled_at: string;
  reconciled_by: string;
  amount: number;
}
