import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Zap, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { financeService } from '../../services/financeService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function FluxoCaixa() {
  const [projections, setProjections] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState('2026-03');
  const [saldoAtual, setSaldoAtual] = useState(0);

  const kpis = [
    { title: 'Entradas (mar)', value: 'R$ 604.200', subtitle: 'recebidos', icon: ArrowUpRight, color: 'text-emerald-500' },
    { title: 'Saídas (mar)', value: 'R$ 420.100', subtitle: 'pagos', icon: ArrowDownRight, color: 'text-rose-500' },
    { title: 'Saldo líquido', value: 'R$ 184.100', subtitle: 'positivo', icon: Activity, color: 'text-blue-500' },
  ];

  const mockExtrato = [
    { data: '19/03', descricao: 'Receb. Condomínio Barra Sul', tipo: 'Entrada', valor: '+R$ 24.800', saldo: 'R$ 218.600' },
    { data: '18/03', descricao: 'Pagto. Unifardome', tipo: 'Saída', valor: '-R$ 8.750', saldo: 'R$ 193.800' },
    { data: '18/03', descricao: 'Receb. Petrobras Duque', tipo: 'Entrada', valor: '+R$ 62.000', saldo: 'R$ 202.550' },
    { data: '15/03', descricao: 'Pagto. Plano de Saúde', tipo: 'Saída', valor: '-R$ 38.700', saldo: 'R$ 140.550' },
    { data: '10/03', descricao: 'Receb. Banco do Brasil RJ', tipo: 'Entrada', valor: '+R$ 64.800', saldo: 'R$ 179.250' },
  ];

  const getTipoBadge = (tipo: string) => {
    return tipo === 'Entrada' 
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [projData, banks] = await Promise.all([
      financeService.getCashflowProjections(),
      financeService.getBankAccounts()
    ]);
    setProjections(projData.length > 0 ? projData : Array.from({ length: 12 }, (_, i) => ({ week: i + 1, income: 0, expense: 0, balance: 0 })));
    setSaldoAtual(banks.reduce((acc: number, b: any) => acc + (b.balance || 0), 0));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <PageHeader 
        title="Fluxo de Caixa" 
        subtitle="Projeção e controle de liquidez"
        actions={
          <>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="2026-03">Março 2026</option>
              <option value="2026-04">Abril 2026</option>
            </select>
            <ActionButton>
              + Lançamento
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <SectionCard title="Projeção de Caixa">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
              <Tooltip 
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} />
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Extrato — Março 2026">
        <Table>
          <thead>
            <tr>
              <Th>Data</Th>
              <Th>Descrição</Th>
              <Th>Tipo</Th>
              <Th>Valor</Th>
              <Th>Saldo</Th>
            </tr>
          </thead>
          <tbody>
            {mockExtrato.map((item, idx) => (
              <Tr key={idx}>
                <Td className="text-gray-500 font-medium">{item.data}</Td>
                <Td className="font-bold">{item.descricao}</Td>
                <Td>
                  <StatusBadge 
                    status={item.tipo === 'Entrada' ? 'Pago' : 'Atrasado'} 
                    label={item.tipo} 
                  />
                </Td>
                <Td className={`font-black ${item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.valor}
                </Td>
                <Td className="font-bold text-gray-900 dark:text-white">{item.saldo}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>
    </motion.div>
  );
}
