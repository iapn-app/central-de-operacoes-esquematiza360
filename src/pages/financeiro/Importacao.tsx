import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { financeiroImportService, ImportResult } from '../../services/financeiroImportService';
import { ActionButton, SectionCard, PageHeader } from './components/FinanceComponents';

export const Importacao = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const res = await financeiroImportService.importFinancialExcel(file);
      setResult(res);
    } catch (err) {
      setError('Erro ao processar arquivo. Verifique o formato.');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader 
        title="Importação de Planilha Financeira" 
        subtitle="Importe dados em lote via arquivo Excel"
      />
      
      <SectionCard>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800/50 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-sm mb-4">
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-300" />
              </div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold text-brand-green">Clique para enviar</span> ou arraste e solte</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, XLS (Máx. 10MB)</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .xls" />
          </label>
        </div>
        {file && (
          <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-brand-green mr-3" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{file.name}</span>
            </div>
            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
        
        <div className="mt-8">
          <ActionButton 
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full justify-center py-3 text-base"
          >
            {importing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileText className="w-5 h-5 mr-2" />}
            {importing ? 'Processando Importação...' : 'Iniciar Importação'}
          </ActionButton>
        </div>
      </SectionCard>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {result && (
        <SectionCard>
          <h2 className="text-lg font-bold mb-6 flex items-center text-gray-900 dark:text-white">
            <CheckCircle className="w-6 h-6 text-emerald-500 mr-2" />
            Resultado da Importação
          </h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total de Linhas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.totalRows}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Importados com Sucesso</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{result.importedRows}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-xl border border-rose-100 dark:border-rose-900/20">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400 mb-1">Erros Encontrados</p>
              <p className="text-3xl font-bold text-rose-700 dark:text-rose-400">{result.errorRows}</p>
            </div>
          </div>
          
          {result.logs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Log de Processamento</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 max-h-60 overflow-y-auto font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {result.logs.map((log, i) => (
                  <p key={i} className={log.includes('Erro') ? 'text-rose-500' : ''}>{log}</p>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
};
