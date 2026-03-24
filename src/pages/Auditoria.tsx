import React, { useState, useEffect } from 'react';
import { getLogs, AuditLog } from '../services/auditService';
import { FileText, Search } from 'lucide-react';

export function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-soft-black dark:text-white">Sistema de Auditoria</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Histórico de ações realizadas no sistema.</p>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-soft-black dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-green" />
            Logs de Auditoria
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar ação..." 
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Ação</th>
                <th className="px-6 py-3">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-soft-black dark:text-white">{log.userId}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{log.action}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
