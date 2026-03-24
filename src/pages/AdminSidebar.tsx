import React, { useState } from 'react';
import { useSidebar } from '../hooks/useSidebar';
import { Shield, Search, Save, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function AdminSidebar() {
  const { groupedModules, loading } = useSidebar();
  const [targetEmail, setTargetEmail] = useState('mellaurj@gmail.com');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Flatten for admin view
  const allModules = Object.values(groupedModules).flat();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = async (moduleKey: string, currentEnabled: boolean) => {
    if (!targetEmail) {
      showToast('error', 'Informe o email do usuário');
      return;
    }

    setUpdating(moduleKey);
    // Note: toggleUserModule is not available in the hook now, need to fix this if needed.
    // For now, just show a warning.
    console.warn('toggleUserModule not implemented in current hook');
    showToast('error', 'Funcionalidade temporariamente desabilitada');
    setUpdating(null);
  };

  const filteredModules = allModules.filter(mod => 
    mod.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mod.category && mod.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-green" />
            Controle de Menu Lateral
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie a visibilidade dos módulos na sidebar por usuário
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email do Usuário
            </label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all text-gray-900 dark:text-white"
              placeholder="exemplo@email.com"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar Módulo
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all text-gray-900 dark:text-white"
                placeholder="Buscar por nome ou chave..."
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Módulo</th>
                  <th className="pb-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Chave / Rota</th>
                  <th className="pb-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="pb-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum módulo encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => (
                    <tr key={mod.key} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">{mod.label}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{mod.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{mod.key}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{mod.route}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          mod.is_enabled 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {mod.is_enabled ? 'Habilitado' : 'Desabilitado'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleToggle(mod.key, mod.is_enabled)}
                          disabled={updating === mod.key}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                            mod.is_enabled ? "bg-brand-green" : "bg-gray-200 dark:bg-gray-700",
                            updating === mod.key && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              mod.is_enabled ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-4 right-4 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl text-white z-50",
            toast.type === 'success' ? "bg-emerald-600" : "bg-red-600"
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </motion.div>
      )}
    </div>
  );
}
