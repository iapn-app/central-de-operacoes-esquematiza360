import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details?: any;
  timestamp: string;
}

/** Grava log no Supabase (tabela logs_auditoria) com fallback em localStorage */
export const logAction = async (userId: string, action: string, details?: any) => {
  try {
    await supabase.from('logs_auditoria').insert({
      tabela:       details?.tabela       ?? 'app',
      operacao:     action.includes('DELETE') ? 'DELETE' : 'UPDATE',
      registro_id:  details?.registro_id  ?? '00000000-0000-0000-0000-000000000000',
      campo:        details?.campo        ?? null,
      valor_antes:  details?.valor_antes  ?? null,
      valor_depois: details?.valor_depois ?? null,
      user_id:      userId,
    });
  } catch (err) {
    console.warn('logAction (Supabase) falhou, usando localStorage:', err);
    const logs = getLogs();
    logs.unshift({ id: Date.now().toString(), userId, action, details, timestamp: new Date().toISOString() });
    localStorage.setItem('audit_logs', JSON.stringify(logs.slice(0, 200)));
  }
};

export const getLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem('audit_logs');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
