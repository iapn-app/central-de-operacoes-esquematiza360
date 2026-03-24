import React, { useState, useMemo } from 'react';
import { Calculator, Users, Clock, DollarSign, TrendingUp, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function SimuladorContratos() {
  const [numVigilantes, setNumVigilantes] = useState(1);
  const [turno, setTurno] = useState('12x36');
  const [custoBase, setCustoBase] = useState(3500);
  const [margem, setMargem] = useState(20);

  const resultados = useMemo(() => {
    const fatorTurno = turno === '12x36' ? 2 : 1.2;
    const custoEstimado = numVigilantes * custoBase * fatorTurno;
    const precoSugerido = custoEstimado / (1 - margem / 100);
    const valorLucro = precoSugerido - custoEstimado;
    
    return {
      custoEstimado,
      precoSugerido,
      valorLucro
    };
  }, [numVigilantes, turno, custoBase, margem]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">Simulador de Contratos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Projete custos e margens para novas propostas comerciais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-soft-black dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-green" />
            Parâmetros da Proposta
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quantidade de Vigilantes</label>
              <input 
                type="number" 
                value={numVigilantes}
                onChange={(e) => setNumVigilantes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Turno</label>
              <select 
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="12x36">12x36 (Escala Completa)</option>
                <option value="44h">44h Semanal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Custo Operacional Base (por vigilante)</label>
              <input 
                type="number" 
                value={custoBase}
                onChange={(e) => setCustoBase(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Margem de Lucro (%)</label>
              <input 
                type="number" 
                value={margem}
                onChange={(e) => setMargem(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custo Estimado</p>
            <h3 className="text-2xl font-black text-soft-black dark:text-white">{formatCurrency(resultados.custoEstimado)}</h3>
            <p className="text-xs text-gray-500 mt-2">Custo total operacional projetado.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-green p-6 rounded-2xl text-white shadow-lg shadow-brand-green/20"
          >
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">Preço Sugerido</p>
            <h3 className="text-2xl font-black">{formatCurrency(resultados.precoSugerido)}</h3>
            <p className="text-xs text-emerald-50 mt-2">Valor de venda recomendado.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lucro Projetado</p>
            <h3 className="text-2xl font-black text-brand-green">{formatCurrency(resultados.valorLucro)}</h3>
            <p className="text-xs text-gray-500 mt-2">Margem de {margem}% aplicada.</p>
          </motion.div>

          <div className="md:col-span-3 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Nota:</strong> Este simulador utiliza cálculos baseados em estimativas operacionais padrão. 
              Custos reais podem variar dependendo de encargos trabalhistas específicos, impostos regionais e exigências contratuais do cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
