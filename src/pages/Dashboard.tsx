<button 
  onClick={handleCopyContext}
  className={cn(
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm",
    copyStatus === 'success' 
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
      : copyStatus === 'error'
      ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
      : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md active:scale-95"
  )}
>
  {copyStatus === 'success' ? (
    <>
      <CheckCircle2 className="w-4 h-4" />
      Contexto copiado
    </>
  ) : copyStatus === 'error' ? (
    'Erro ao copiar contexto'
  ) : (
    <>
      <Brain className="w-4 h-4 text-brand-green" />
      Copiar contexto ChatGPT
    </>
  )}
</button>
