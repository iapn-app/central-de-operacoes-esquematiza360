import { supabase } from '../lib/supabase';
import financeServiceCode from './financeService.ts?raw';
import dashboardCode from '../pages/Dashboard.tsx?raw';

export interface ProjectContext {
  projeto: string;
  stack: string;
  modulo: string;
  tela: string;
  banco: any;
  preferencia: {
    resposta: string;
    explicacao: boolean;
    aiStudio: string;
    supabase: string;
    codigo: string;
    formato: string;
  };
}

export const contextService = {
  async getProjectContext(modulo: string = 'Financeiro', tela: string = 'Dashboard'): Promise<ProjectContext> {
    const { data, error } = await supabase.rpc('get_project_context_schema');
    
    if (error) {
      console.error('Error fetching project context schema:', error);
      throw error;
    }

    return {
      projeto: 'ESQUEMATIZA CENTRAL 360',
      stack: 'React + TypeScript + Vite + Supabase + Vercel',
      modulo,
      tela,
      banco: data,
      preferencia: {
        resposta: 'direto ao ponto',
        explicacao: false,
        aiStudio: 'PROMPT',
        supabase: 'SQL',
        codigo: 'pronto',
        formato: 'passo a passo'
      }
    };
  },

  buildChatContextText(context: ProjectContext): string {
    return `=== PROJETO ===
Projeto: ${context.projeto}
Módulo Atual: ${context.modulo} (${context.tela})
Status: Em desenvolvimento (integração de dashboard financeiro)

=== SUPABASE ===
\`\`\`sql
CREATE OR REPLACE FUNCTION get_finance_dashboard_kpis()
RETURNS TABLE (
  total_balance numeric,
  overdue_receivables numeric,
  entered_today numeric,
  exited_today numeric,
  previsto_7d numeric,
  previsto_30d numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(balance) FROM bank_accounts), 0) as total_balance,
    COALESCE((SELECT SUM(amount) FROM accounts_receivable WHERE status = 'overdue'), 0) as overdue_receivables,
    COALESCE((SELECT SUM(amount) FROM bank_transactions WHERE type = 'income' AND date = CURRENT_DATE), 0) as entered_today,
    COALESCE((SELECT SUM(amount) FROM bank_transactions WHERE type = 'expense' AND date = CURRENT_DATE), 0) as exited_today,
    COALESCE((SELECT SUM(amount) FROM accounts_receivable WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7), 0) as previsto_7d,
    COALESCE((SELECT SUM(amount) FROM accounts_receivable WHERE due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30), 0) as previsto_30d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

=== FRONTEND ===

--- src/services/financeService.ts ---
\`\`\`typescript
${financeServiceCode}
\`\`\`

--- src/pages/Dashboard.tsx ---
\`\`\`tsx
${dashboardCode}
\`\`\`

=== STATUS ===
- O que está funcionando: Dashboard conectado ao Supabase, RPC get_finance_dashboard_kpis funcionando, financeService corrigido para tratar retorno em array, card "Em Atraso" exibindo R$ 4.580,00 corretamente.
- O que está zerado: Saldo Total, Entrou Hoje, Saiu Hoje, Previsto 7 Dias e Previsto 30 Dias.
- Por quê: os testes no banco mostraram que não existem registros que atendam às regras atuais dessas métricas e as contas bancárias ativas estão com current_balance = 0.00.
`;
  }
};
