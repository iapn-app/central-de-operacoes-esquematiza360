import React from 'react';
import { motion } from 'motion/react';
import { Shield, ToggleLeft, ToggleRight, Loader2, AlertCircle } from 'lucide-react';
import { useModules } from '../hooks/useModules';

export function AdminModules() {
  const { allModules, loading, toggleModule } = useModules();
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleToggle = async (module_key: string, currentStatus: boolean) => {
    setToggling(module_key);
    setError(null);
    const { error } = await toggleModule(module_key, !currentStatus);
    if (error) {
      setError('Erro ao atualizar o módulo. Tente novamente.');
    }
    setToggling(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-green" />
            Controle de Módulos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Ative ou desative funcionalidades do sistema para todos os usuários.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allModules.map((mod) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {mod.module_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                {mod.module_key}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                mod.enabled 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {mod.enabled ? 'Ativo' : 'Inativo'}
              </span>

              <button
                onClick={() => handleToggle(mod.module_key, mod.enabled)}
                disabled={toggling === mod.module_key}
                className="relative inline-flex items-center justify-center w-12 h-8 rounded-full focus:outline-none disabled:opacity-50 transition-colors"
              >
                {toggling === mod.module_key ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : mod.enabled ? (
                  <ToggleRight className="w-10 h-10 text-brand-green transition-all" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400 transition-all" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {allModules.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Shield className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum módulo encontrado</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            A tabela system_modules parece estar vazia ou não existe.
          </p>
        </div>
      )}
    </div>
  );
}
