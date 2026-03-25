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
    let schema = null;
    try {
      const { data } = await supabase.rpc('get_project_context_schema');
      schema = data;
    } catch {
      // ignora silenciosamente
    }

    return {
      projeto: 'ESQUEMATIZA CENTRAL 360',
      stack: 'React + TypeScript + Vite + Supabase + Vercel',
      modulo,
      tela,
      banco: schema,
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
Stack: ${context.stack}
=== STATUS ===
Sistema pronto para implantação com dados reais.
`;
  }
};
