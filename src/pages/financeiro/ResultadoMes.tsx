import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Wallet, PieChart, Download, FileText, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { KpiCard, SectionCard, PageHeader, ActionButton } from './components/FinanceComponents';

// Mock Data for DRE
const MOCK_DRE = [
  { id: '1', descricao: '1. Receita Bruta de Serviços', valor: 1250000, tipo: 'receita', isTotal: true },
  { id: '1.1', descricao: 'Serviços de Vigilância', valor: 850000, tipo: 'receita', isTotal: false },
  { id: '1.2', descricao: 'Serviços de Limpeza', valor: 300000, tipo: 'receita', isTotal: false },
  { id: '1.3', descricao: 'Serviços de Portaria', valor: 100000, tipo: 'receita', isTotal: false },
  { id: '2', descricao: '2. Deduções da Receita Bruta', valor: -112500, tipo: 'deducao', isTotal: true },
  { id: '2.1', descricao: 'Impostos Incidentes (ISS, PIS, COFINS)', valor: -108125, tipo: 'deducao', isTotal: false },
  { id: '2.2', descricao: 'Descontos Incondicionais', valor: -4375, tipo: 'deducao', isTotal: false },
  { id: '3', descricao: '3. Receita Líquida (1 + 2)', valor: 1137500, tipo: 'total', isTotal: true },
  { id: '4', descricao: '4. Custos Diretos (CPV/CSP)', valor: -682500, tipo: 'custo', isTotal: true },
  { id: '4.1', descricao: 'Folha de Pagamento Direta', valor: -450000, tipo: 'custo', isTotal: false },
  { id: '4.2', descricao: 'Encargos e Benefícios Diretos', valor: -180000, tipo: 'custo', isTotal: false },
  { id: '4.3', descricao: 'Insumos e Materiais', valor: -52500, tipo: 'custo', isTotal: false },
  { id: '5', descricao: '5. Margem de Contribuição (3 + 4)', valor: 455000, tipo: 'total', isTotal: true },
  { id: '6', descricao: '6. Despesas Fixas / Operacionais', valor: -185000, tipo: 'despesa', isTotal: true },
  { id: '6.1', descricao: 'Despesas Administrativas (Aluguel, Energia, etc.)', valor: -45000, tipo: 'despesa', isTotal: false },
  { id: '6.2', descricao: 'Folha de Pagamento Indireta (Adm/Comercial)', valor: -90000, tipo: 'despesa', isTotal: false },
  { id: '6.3', descricao: 'Despesas Comerciais e Marketing', valor: -25000, tipo: 'despesa', isTotal: false },
  { id: '6.4', descricao: 'Outras Despesas Operacionais', valor: -25000, tipo: 'despesa', isTotal: false },
  { id: '7', descricao: '7. EBITDA (5 + 6)', valor: 270000, tipo: 'total', isTotal: true },
  { id: '8', descricao: '8. Depreciação e Amortização', valor: -15000, tipo: 'despesa', isTotal: true },
  { id: '9', descricao: '9. Resultado Operacional (EBIT) (7 + 8)', valor: 255000, tipo: 'total', isTotal: true },
  { id: '10', descricao: '10. Resultado Financeiro', valor: -12000, tipo: 'despesa', isTotal: true },
  { id: '10.1', descricao: 'Receitas Financeiras', valor: 8000, tipo: 'receita', isTotal: false },
  { id: '10.2', descricao: 'Despesas Financeiras (Juros, Tarifas)', valor: -20000, tipo: 'despesa', isTotal: false },
  { id: '11', descricao: '11. Resultado Antes dos Impostos (LAIR) (9 + 10)', valor: 243000, tipo: 'total', isTotal: true },
  { id: '12', descricao: '12. IRPJ e CSLL', valor: -58320, tipo: 'deducao', isTotal: true },
  { id: '13', descricao: '13. Resultado Líquido (11 + 12)', valor: 184680, tipo: 'total', isTotal: true },
];

const MOCK_RENTABILIDADE_CONTRATOS = [
  { cliente: 'Condomínio Alto Padrão', receita: 85000, custo_direto: 45000, margem_contribuicao: 40000, margem_percentual: 47.0 },
  { cliente: 'Shopping Center Sul', receita: 210000, custo_direto: 112500, margem_contribuicao: 97500, margem_percentual: 46.4 },
  { cliente: 'Hospital Santa Maria', receita: 180000, custo_direto: 93750, margem_contribuicao: 86250, margem_percentual: 47.9 },
  { cliente: 'Indústria Metalúrgica', receita: 120000, custo_direto: 75000, margem_contribuicao: 45000, margem_percentual: 37.5 },
  { cliente: 'Rede de Supermercados', receita: 350000, custo_direto: 220000, margem_contribuicao: 130000, margem_percentual: 37.1 },
];

export function ResultadoMes() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    '1': true, '2': false, '4': true, '6': true, '10': false
  });
  const [periodo, setPeriodo] = useState('2026-03');

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const kpis = [
    { title: 'Receita Líquida', value: 'R$ 1.137.500', icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Margem de Contribuição', value: '40,0%', icon: PieChart, color: 'text-blue-500' },
    { title: 'EBITDA', value: 'R$ 270.000', icon: Wallet, color: 'text-purple-500' },
    { title: 'Lucro Líquido', value: 'R$ 184.680', icon: DollarSign, color: 'text-emerald-600' },
  ];

  const chartData = [
    { name: 'Jan', receita: 1100000, lucro: 150000 },
    { name: 'Fev', receita: 1150000, lucro: 165000 },
    { name: 'Mar', receita: 1250000, lucro: 184680 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader 
        title="DRE Gerencial" 
        subtitle="Demonstrativo de Resultados do Exercício e Rentabilidade"
        actions={
          <>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="2026-03">Março 2026</option>
              <option value="2026-02">Fevereiro 2026</option>
              <option value="2026-01">Janeiro 2026</option>
            </select>
            <ActionButton>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SectionCard title="Demonstrativo de Resultados (DRE)">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Valor (R$)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">AV (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {MOCK_DRE.map((item) => {
                    const isTotal = item.isTotal;
                    const hasChildren = MOCK_DRE.some(child => child.id.startsWith(`${item.id}.`) && child.id !== item.id);
                    const isChild = item.id.includes('.');
                    const parentId = isChild ? item.id.split('.')[0] : null;
                    const isVisible = !isChild || (parentId && expandedRows[parentId]);
                    
                    if (!isVisible) return null;

                    return (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "transition-colors",
                          isTotal ? "bg-gray-50/30 dark:bg-white/[0.02]" : "hover:bg-gray-50/50 dark:hover:bg-white/5",
                          item.tipo === 'total' && "bg-gray-100/50 dark:bg-white/5"
                        )}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {isChild && <div className="w-4" />}
                            {hasChildren ? (
                              <button 
                                onClick={() => toggleRow(item.id)}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                {expandedRows[item.id] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                              </button>
                            ) : (
                              <div className="w-5" />
                            )}
                            <span className={cn(
                              "text-sm",
                              isTotal ? "font-bold text-soft-black dark:text-white" : "text-gray-600 dark:text-gray-300",
                              item.tipo === 'total' && "font-black"
                            )}>
                              {item.descricao}
                            </span>
                          </div>
                        </td>
                        <td className={cn(
                          "px-6 py-3 text-right text-sm",
                          isTotal ? "font-bold text-soft-black dark:text-white" : "text-gray-600 dark:text-gray-300",
                          item.tipo === 'total' && "font-black",
                          item.valor < 0 ? "text-rose-600 dark:text-rose-400" : ""
                        )}>
                          {formatCurrency(item.valor)}
                        </td>
                        <td className="px-6 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {((item.valor / 1250000) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-8">
          <SectionCard title="Evolução de Receita e Lucro">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} width={80} tickFormatter={(val) => `R$ ${(val/1000)}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="receita" name="Receita Bruta" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro Líquido" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Rentabilidade por Contrato (Top 5)">
            <div className="space-y-4">
              {MOCK_RENTABILIDADE_CONTRATOS.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-bold text-soft-black dark:text-white">{item.cliente}</h4>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      item.margem_percentual >= 40 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                      item.margem_percentual >= 30 ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    )}>
                      {item.margem_percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Receita</p>
                      <p className="text-sm font-medium text-soft-black dark:text-white">{formatCurrency(item.receita)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Margem (R$)</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(item.margem_contribuicao)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
}
