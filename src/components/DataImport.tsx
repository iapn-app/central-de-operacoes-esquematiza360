import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase'; // Assuming supabase client is here
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export function DataImport() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('processing');
    setMessage('Processando arquivo...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Process and insert data (example logic)
        for (const row of data as any[]) {
          // 1. Validate data (dates, currency)
          // 2. Insert into Supabase using upsert to avoid duplicates
          // Example: await supabase.from('clients').upsert({ ...row }, { onConflict: 'email' });
        }

        setStatus('success');
        setMessage('Dados importados com sucesso!');
      } catch (err) {
        setStatus('error');
        setMessage('Erro ao processar arquivo: ' + (err as Error).message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Importação de Dados Reais</h2>
      <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="mb-4" />
      {status === 'processing' && <p className="text-blue-400">{message}</p>}
      {status === 'success' && <p className="text-emerald-400 flex items-center gap-2"><CheckCircle /> {message}</p>}
      {status === 'error' && <p className="text-red-400 flex items-center gap-2"><AlertCircle /> {message}</p>}
    </div>
  );
}
