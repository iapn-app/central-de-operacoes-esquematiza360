export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details?: any;
  timestamp: string;
}

const STORAGE_KEY = 'audit_logs';

export const logAction = (userId: string, action: string, details?: any) => {
  const logs = getLogs();
  const newLog: AuditLog = {
    id: Date.now().toString(),
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const getLogs = (): AuditLog[] => {
  const logs = localStorage.getItem(STORAGE_KEY);
  return logs ? JSON.parse(logs) : [];
};
