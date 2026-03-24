import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Wallet, ArrowUpRight, ArrowDownRight, Activity,
  TrendingUp, TrendingDown, RefreshCw, Download,
  Building2, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr
} from './components/FinanceComponents';

// ─── Dados demo ────────────────────────────────────────────────────────────

const projecaoSemanalDemo = [
  { semana: 'S1', entradas: 148000, saidas: 98000, saldo: 50000 },
  { semana: 'S2', entradas: 162000, saidas: 112000, saldo: 100000 },
  { semana: 'S3', entradas: 134000, saidas: 124000, saldo: 110000 },
  { semana: 'S4', entradas: 160200, saidas: 86100, saldo: 184100 },
  { semana: 'S5 (prev)', entradas: 142000, saidas: 95000, saldo: 231100 },
  { semana: 'S6 (prev)', entradas: 155000, saidas: 102000, saldo: 284100 },
];

const projecao90dias = [
  { mes: 'Mar', receita: 604200, despesa: 420100, saldo: 184100, acumulado: 184100 },
  { mes: 'Abr', receita: 589000, despesa: 398000, saldo: 191000, acumulado: 375100 },
  { mes: 'Mai', receita: 621000, despesa: 411000, saldo: 210000, acumulado: 585100 },
];

const extratoDemo = [
  { data: '24/03', descricao: 'Receb. Condomínio Barra Sul', tipo: 'Entrada', valor: '+R$ 28.800', saldo: 'R$ 218.600', conciliado: true },
  { data: '22/03', descricao: 'Pagto. TecnoSegur — Manutenção', tipo: 'Saída', valor: '-R$ 12.400', saldo: 'R$ 189.800', conciliado: true },
  { data: '20/03', descricao: 'INSS + FGTS Março', tipo: 'Saída', valor: '-R$ 48.320', saldo: 'R$ 202.200', conciliado: true },
  { data: '19/03', descricao: 'Receb. Petrobras Duque', tipo: 'Entrada', valor: '+R$ 92.400', saldo: 'R$ 250.520', conciliado: true },
  { data: '18/03', descricao: 'Pagto. Unifardome — Lote 03', tipo: 'Saída', valor: '-R$ 8.750', saldo: 'R$ 158.120', conciliado: false },
  { data: '15/03', descricao: 'Pagto. Plano de Saúde', tipo: 'Saída', valor: '-R$ 38.700', saldo: 'R$ 166.870', conciliado: true },
  { data: '10/03', descricao: 'Receb. Banco do Brasil RJ', tipo: 'Entrada', valor: '+R$ 64.800', saldo: 'R$ 205.570', conciliado: true },
];

const contasBancarias = [
  { banco: 'Itaú — CC 12345-6', saldo: 'R$ 142.800', status: 'Conectado', atualizado: 'agora' },
  { banco: 'Bradesco — CC 98765-4', saldo: 'R$ 41.320', status: 'Conectado', atualizado: '5 min' },
  { banco: 'Nubank — CC 55512-0', saldo: 'R$ 18.200', status: 'Pendente', atualizado: '—' },
];

// ─── Tooltip customizado ───────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────

export function FluxoCaixa() {
  const [projections, setProjections] = useState<any[]>(projecaoSemanalDemo);
  const [periodo, setPeriodo] = useState('2026-03');
  const [saldoAtual, setSaldoAtual] = useState(202320);
  const [loading, setLoading] = useState(false);
  const [abaExtrato, setAbaExtrato] = useState<'extrato' | 'projecao' | 'contas'>('extrato');

  const kpis = [
    {
      title: 'Saldo atual',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoAtual),
      subtitle: 'Consolidado — todas as contas',
      icon: Wallet,
      colorClass: 'text-blue-500',
    },
    {
      title: 'Entradas (mar)',
      value: 'R$ 604.200',
      subtitle: '+8,3% vs fevereiro',
      icon: ArrowUpRight,
      colorClass: 'text-emerald-500',
    },
    {
      title: 'Saídas (mar)',
      value: 'R$ 420.100',
      subtitle: '-2,1% vs fevereiro',
      icon: ArrowDownRight,
      colorClass: 'text-rose-500',
    },
    {
      title: 'Saldo líquido',
      value: 'R$ 184.100',
      subtitle: 'Margem 30,5%',
      icon: Activity,
      colorClass: 'text-purple-500',
    },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [projData, banks] = await Promise.all([
          financeService.getCashflowProjections(),
          financeService.getBankAccounts()
        ]);
        if (projData?.length > 0) setProjections(projData);
        const total = banks?.reduce((acc: number, b: any) => acc + (b.balance || 0), 0);
        if (total > 0) setSaldoAtual(total);
      } catch (e) {
        console.error('Erro ao carregar fluxo:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [periodo]);

  const tabs = [
    { id: 'extrato', label: 'Extrato' },
    { id: 'projecao', label: 'Projeção 90 dias' },
    { id: 'contas', label: 'Contas bancárias' },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Projeção, controle de liquidez e conciliação bancária"
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
            <ActionButton variant="secondary">
              <Download className="w-4 h-4" /> Exportar
            </ActionButton>
            <ActionButton>+ Lançamento</ActionButton>
          </>
        }
      />

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} colorClass={kpi.colorClass} />
        ))}
      </div>

      {/* ── Gráfico projeção semanal ─────────────────────────────────────── */}
      <SectionCard
        title="Projeção de Caixa — Março 2026"
        action={
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Entradas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />Saídas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Saldo</span>
          </div>
        }
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} dx={-8} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" fill="url(#gradEntradas)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#f43f5e" fill="url(#gradSaidas)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" fill="url(#gradSaldo)" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* ── Tabs: Extrato / Projeção / Contas ───────────────────────────── */}
      <SectionCard>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaExtrato(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${abaExtrato === tab.id ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400 ml-2 self-center" />}
        </div>

        {/* Extrato -------------------------------------------------------- */}
        {abaExtrato === 'extrato' && (
          <Table>
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Descrição</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Saldo</Th>
                <Th className="text-center">Conciliado</Th>
              </tr>
            </thead>
            <tbody>
              {extratoDemo.map((item, idx) => (
                <Tr key={idx}>
                  <Td className="text-gray-500 font-medium">{item.data}</Td>
                  <Td className="font-bold">{item.descricao}</Td>
                  <Td>
                    <StatusBadge
                      status={item.tipo === 'Entrada' ? 'Pago' : 'saída'}
                      label={item.tipo}
                    />
                  </Td>
                  <Td className={`font-black ${item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.valor}
                  </Td>
                  <Td className="font-bold text-gray-900 dark:text-white">{item.saldo}</Td>
                  <Td className="text-center">
                    {item.conciliado
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      : <Clock className="w-4 h-4 text-amber-400 mx-auto" />
                    }
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Projeção 90 dias ----------------------------------------------- */}
        {abaExtrato === 'projecao' && (
          <div className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projecao90dias} barGap={6} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="#fb7185" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saldo" name="Saldo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>Mês</Th>
                  <Th>Receita prevista</Th>
                  <Th>Despesa prevista</Th>
                  <Th>Saldo do mês</Th>
                  <Th>Caixa acumulado</Th>
                </tr>
              </thead>
              <tbody>
                {projecao90dias.map((item, idx) => (
                  <Tr key={idx}>
                    <Td className="font-bold">{item.mes} 2026</Td>
                    <Td className="text-emerald-600 font-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.receita)}
                    </Td>
                    <Td className="text-rose-600 font-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.despesa)}
                    </Td>
                    <Td className="font-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.saldo)}
                    </Td>
                    <Td className="text-blue-600 font-black">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.acumulado)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Contas bancárias ----------------------------------------------- */}
        {abaExtrato === 'contas' && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Saldo consolidado — todas as contas</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">R$ 202.320,00</p>
              </div>
              <ActionButton variant="secondary" className="text-xs">
                <RefreshCw className="w-3 h-3" /> Sincronizar
              </ActionButton>
            </div>
            {contasBancarias.map((conta, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Building2 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{conta.banco}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Atualizado: {conta.atualizado}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 dark:text-white">{conta.saldo}</p>
                  <StatusBadge
                    status={conta.status === 'Conectado' ? 'Pago' : 'Pendente'}
                    label={conta.status}
                  />
                </div>
              </div>
            ))}
            <ActionButton className="w-full mt-2">
              <Building2 className="w-4 h-4" /> Conectar nova conta bancária
            </ActionButton>
          </div>
        )}
      </SectionCard>

    </motion.div>
  );
}
