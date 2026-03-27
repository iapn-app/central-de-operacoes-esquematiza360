import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import financeService from '../../services/financeService';
import {
  Shield, TrendingUp, DollarSign, Wallet, AlertTriangle,
  BarChart3, Building2, Zap, Calendar, Settings, X, Eye, EyeOff,
  Landmark, Layers, ChevronDown, ChevronUp,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  KpiCard, ActionButton, SectionCard, PageHeader,
} from './components/FinanceComponents';

// ─── Empresas do grupo ─────────────────────────────────────────────────────

const EMPRESAS = [
  { id: "servicos", nome: "Serviços de Monitoramento", cnpj: "29.724.046/0001-35", cor: "#EC6625", inicial: "S",
    contas: ["Itaú Ag.7157 — 0099842-3", "Bradesco Ag.1804 — 0007997-9"] },
  { id: "vigilancia", nome: "Vigilância e Segurança", cnpj: "35.201.432/0001-45", cor: "#0f172a", inicial: "V",
    contas: ["Itaú Ag.7157 — 0099812-6", "Itaú Ag.7157 — 0029170-4", "Bradesco Ag.1804 — 0084935-9", "Inter Ag.0001-9 — 4596447-5"] },
  { id: "patrimonial", nome: "Patrimonial e Eventos", cnpj: "47.116.185/0001-68", cor: "#7c3aed", inicial: "P",
    contas: ["Itaú Ag.7157 — 0099813-4"] },
  { id: "prevencao", nome: "Prevenção de Perdas", cnpj: "52.605.214/0001-95", cor: "#0369a1", inicial: "P",
    contas: ["Itaú Ag.309 — 0099120-6", "Bradesco Ag.1804 — 0103834-6"] },
  { id: "inteligencia", nome: "Inteligência e Treinamentos", cnpj: "59.283.344/0001-06", cor: "#047857", inicial: "I",
    contas: ["Itaú Ag.309 — 0098959-8"] },
];

// ─── Contas bancárias reais ────────────────────────────────────────────────

const CONTAS_BANCARIAS = [
  { empresa: "Serviços", razao: "ESQUEMATIZA SERVIÇOS DE MONITORAMENTO LTDA", cnpj: "29.724.046/0001-35", agencia: "7157", conta: "0099842-3", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Inteligência", razao: "ESQUEMATIZA INTELIGENCIA E TREINAMENTOS LTDA", cnpj: "59.283.344/0001-06", agencia: "309", conta: "0098959-8", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Patrimonial", razao: "ESQUEMATIZA PATRIMONIAL E EVENTOS LTDA", cnpj: "47.116.185/0001-68", agencia: "7157", conta: "0099813-4", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Prevenção", razao: "ESQUEMATIZA PREVENCAO DE PERDAS", cnpj: "52.605.214/0001-95", agencia: "309", conta: "0099120-6", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Vigilância", razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA", cnpj: "35.201.432/0001-45", agencia: "7157", conta: "0099812-6", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Vigilância", razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA", cnpj: "35.201.432/0001-45", agencia: "7157", conta: "0029170-4", banco: "Itaú", cor: "#EC6625" },
  { empresa: "Vigilância", razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA", cnpj: "35.201.432/0001-45", agencia: "1804", conta: "0084935-9", banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Prevenção", razao: "ESQUEMATIZA PREVENCAO DE PERDAS", cnpj: "52.605.214/0001-95", agencia: "1804", conta: "0103834-6", banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Serviços", razao: "ESQUEMATIZA SERVIÇOS DE MONITORAMENTO LTDA", cnpj: "29.724.046/0001-35", agencia: "1804", conta: "0007997-9", banco: "Bradesco", cor: "#CC0000" },
  { empresa: "Vigilância", razao: "ESQUEMATIZA VIGILANCIA E SEGURANCA LTDA", cnpj: "35.201.432/0001-45", agencia: "0001-9", conta: "4596447-5", banco: "Inter", cor: "#FF7A00" },
];

const CONTAS_DISPONIVEIS = [
  { label: "Todas as contas", value: "Todos" },
  ...CONTAS_BANCARIAS.map(c => ({
    label: `${c.banco} — ${c.empresa} (${c.conta})`,
    value: c.conta,
    banco: c.banco,
    cor: c.cor,
  })),
];

// ─── KPIs ──────────────────────────────────────────────────────────────────

const ALL_FIN_KPIS = [
  { id: "saldo", title: "Saldo Total", icon: Wallet, colorClass: "text-blue-500" },
  { id: "faturamento", title: "Faturamento Mensal", icon: TrendingUp, colorClass: "text-emerald-500" },
  { id: "custo", title: "Custo Operacional", icon: DollarSign, colorClass: "text-rose-500" },
  { id: "lucro", title: "Lucro Estimado", icon: BarChart3, colorClass: "text-purple-500" },
  { id: "juros", title: "Juros Evitados", icon: Shield, colorClass: "text-teal-500" },
  { id: "atraso", title: "Em Atraso", icon: AlertTriangle, colorClass: "text-amber-500" },
];

const DEFAULT_FIN_KPIS = ["saldo", "faturamento", "custo", "lucro", "juros", "atraso"];

// ─── Filtro de banco ───────────────────────────────────────────────────────

function FiltroBanco({ conta, onChange }: { conta: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selecionada = CONTAS_DISPONIVEIS.find(c => c.value === conta);
  const labelBotao = conta === 'Todos' ? 'Todas' : selecionada?.label ?? conta;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-600 transition shadow-sm max-w-[140px]"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      >
        {'cor' in (selecionada ?? {}) && conta !== 'Todos' && (
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: (selecionada as any).cor }} />
        )}
        <span className="truncate">{labelBotao}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-72 overflow-hidden">
          {CONTAS_DISPONIVEIS.map(c => (
            <button
              key={c.value}
              onClick={() => { onChange(c.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-slate-50 transition text-left ${conta === c.value ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'}`}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              {'cor' in c && c.value !== 'Todos' && (
                <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: (c as any).cor }} />
              )}
              {c.value === 'Todos' ? '✦ Todas as contas' : c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiSaldoTotal({ conta, onChangeConta, value, subtitle }: {
  conta: string;
  onChangeConta: (c: string) => void;
  value: string;
  subtitle: string;
}) {
  const contasFiltradas = conta === 'Todos'
    ? CONTAS_BANCARIAS
    : CONTAS_BANCARIAS.filter(c => c.conta === conta);

  const qtd = contasFiltradas.length;
  const info = conta === 'Todos'
    ? `${qtd} contas — todos os bancos`
    : contasFiltradas[0]
      ? `${contasFiltradas[0].banco} — ${contasFiltradas[0].empresa}`
      : conta;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Total</span>
        <FiltroBanco conta={conta} onChange={onChangeConta} />
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        <div className="text-sm text-gray-500 mt-2 font-medium flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-slate-400" />
          {info}
        </div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

function KpiCustomizerPanel({ visible, onToggle, onClose }: {
  visible: string[]; onToggle: (id: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div><h2 className="text-base font-bold text-slate-900">Personalizar KPIs</h2><p className="text-xs text-slate-500 mt-0.5">Escolha quais indicadores exibir</p></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {ALL_FIN_KPIS.map((kpi) => {
            const active = visible.includes(kpi.id);
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.id}
                onClick={() => onToggle(kpi.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${active ? "bg-emerald-100" : "bg-slate-200"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-500"}`} />
                </div>
                <p className={`text-sm font-semibold flex-1 truncate ${active ? "text-slate-900" : "text-slate-500"}`}>{kpi.title}</p>
                {active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">{visible.length} de {ALL_FIN_KPIS.length} KPIs visíveis</p>
        </div>
      </div>
    </>
  );
}

function ContaBancariaCard({ conta }: { conta: typeof CONTAS_BANCARIAS[0] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: conta.cor + "18" }}>
        <Landmark className="w-5 h-5" style={{ color: conta.cor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: conta.cor }}>{conta.banco}</span>
          <span className="text-xs font-semibold text-slate-500">{conta.empresa}</span>
        </div>
        <p className="text-xs font-medium text-slate-700 truncate">{conta.razao}</p>
        <p className="text-xs text-slate-400 mt-1">CNPJ: {conta.cnpj}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-slate-500">Ag: <strong className="text-slate-700">{conta.agencia}</strong></span>
          <span className="text-xs text-slate-500">Conta: <strong className="text-slate-700">{conta.conta}</strong></span>
        </div>
      </div>
    </div>
  );
}

function SecaoMultiEmpresa() {
  const [expandida, setExpandida] = useState<string | null>(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas");

  const contasFiltradas = filtroEmpresa === "todas"
    ? CONTAS_BANCARIAS
    : CONTAS_BANCARIAS.filter(c => c.empresa.toLowerCase() === filtroEmpresa.toLowerCase());

  return (
    <SectionCard
      title="Visão por Empresa — Grupo Esquematiza"
      action={
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">5 CNPJs • 10 contas bancárias</span>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 pb-5 border-b border-slate-100">
        {[
          { label: "Faturamento Consolidado", icon: TrendingUp, cor: "text-emerald-600", bg: "bg-emerald-50", value: "—" },
          { label: "Custo Consolidado", icon: TrendingDown, cor: "text-rose-600", bg: "bg-rose-50", value: "—" },
          { label: "Lucro Grupo", icon: BarChart3, cor: "text-purple-600", bg: "bg-purple-50", value: "—" },
          { label: "Saldo Total (10 contas)", icon: Wallet, cor: "text-blue-600", bg: "bg-blue-50", value: "—" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${item.bg}`}>
                <Icon className={`w-4 h-4 ${item.cor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 mb-5">
        {EMPRESAS.map(e => (
          <div key={e.id} className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandida(expandida === e.id ? null : e.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: e.cor }}>
                  {e.inicial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ESQMT {e.nome}</p>
                  <p className="text-xs text-slate-400">{e.cnpj} • {e.contas.length} conta{e.contas.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="hidden md:grid grid-cols-3 gap-6 text-right">
                  {["Faturamento", "Margem", "Saldo"].map(label => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-800">—</p>
                    </div>
                  ))}
                </div>
                {expandida === e.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </div>
            </button>

            {expandida === e.id && (
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Faturamento Mensal", "Custo Operacional",
                    "Lucro do Mês", "Saldo em Conta",
                    "Contratos Ativos", "A Receber",
                    "Contas a Pagar", "Inadimplência"
                  ].map(label => (
                    <div key={label} className="rounded-lg bg-white border border-slate-200 px-3 py-2.5">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">—</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Contas bancárias desta empresa:</p>
                  <div className="flex flex-wrap gap-2">
                    {e.contas.map(c => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600">
                        <Landmark className="w-3 h-3 text-slate-400" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-dashed px-4 py-3 text-center" style={{ borderColor: e.cor + "50" }}>
                  <p className="text-xs font-semibold" style={{ color: e.cor }}>
                    🚀 Conecte os dados reais para ativar os indicadores desta empresa.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Contas bancárias por empresa</p>
          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todas as empresas</option>
            {["Serviços", "Vigilância", "Patrimonial", "Prevenção", "Inteligência"].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {contasFiltradas.map((conta, i) => (
            <ContaBancariaCard key={i} conta={conta} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

export function PainelFinanceiro() {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [openLancamento, setOpenLancamento] = useState(false);
  const [openPeriodo, setOpenPeriodo] = useState(false);
  const [periodo, setPeriodo] = useState('2026-03');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [filtroBanco, setFiltroBanco] = useState<string>('Todos');
  const [allLancamentos, setAllLancamentos] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    saldo: 0,
    faturamento: 0,
    custo: 0,
    lucro: 0,
    juros: 0,
    atraso: 0,
  });
  const [fluxoCaixaData, setFluxoCaixaData] = useState([
    { mes: 'Out', receita: 0, despesa: 0, lucro: 0 },
    { mes: 'Nov', receita: 0, despesa: 0, lucro: 0 },
    { mes: 'Dez', receita: 0, despesa: 0, lucro: 0 },
    { mes: 'Jan', receita: 0, despesa: 0, lucro: 0 },
    { mes: 'Fev', receita: 0, despesa: 0, lucro: 0 },
    { mes: 'Mar', receita: 0, despesa: 0, lucro: 0 },
  ]);

  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    tipo: 'income',
    categoria: '',
    vencimento: '',
    empresa_id: '',
    conta_id: ''
  });

  const [visibleKpis, setVisibleKpis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("financeiro_kpis");
      return saved ? JSON.parse(saved) : DEFAULT_FIN_KPIS;
    } catch {
      return DEFAULT_FIN_KPIS;
    }
  });

  useEffect(() => {
    supabase.from('empresas').select('id, nome').order('nome').then(({ data }) => setEmpresas(data ?? []));
  }, []);

  useEffect(() => {
    if (!form.empresa_id) {
      setContas([]);
      return;
    }

    supabase
      .from('contas_bancarias')
      .select('id, banco_nome, agencia, conta')
      .eq('empresa_id', form.empresa_id)
      .then(({ data }) => setContas(data ?? []));
  }, [form.empresa_id]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  function getContaNumero(item: any) {
    return (
      item?.conta ||
      item?.conta_numero ||
      item?.numero_conta ||
      item?.bank_account ||
      item?.conta_bancaria ||
      ''
    );
  }

  function getItemValor(item: any) {
    return Number(
      item?.valor ??
      item?.amount ??
      item?.total ??
      item?.value ??
      0
    );
  }

  function getItemTipo(item: any) {
    return String(
      item?.tipo ??
      item?.type ??
      item?.entry_type ??
      ''
    ).toLowerCase().trim();
  }

  function isReceita(item: any) {
    const tipo = getItemTipo(item);
    return ['income', 'receita', 'entrada', 'receivable', 'credito', 'crédito'].includes(tipo);
  }

  function isDespesa(item: any) {
    const tipo = getItemTipo(item);
    return ['expense', 'despesa', 'saida', 'saída', 'payable', 'debito', 'débito'].includes(tipo);
  }

  function getItemDate(item: any) {
    return (
      item?.vencimento ||
      item?.due_date ||
      item?.data ||
      item?.date ||
      item?.created_at ||
      null
    );
  }

  function getMesesDoPeriodoSelecionado(periodoSelecionado: string) {
    const [anoStr, mesStr] = periodoSelecionado.split('-');
    const ano = Number(anoStr);
    const mes = Number(mesStr);

    const meses: { key: string; mes: string; receita: number; despesa: number; lucro: number }[] = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const data = new Date(ano, mes - 1 - offset, 1);
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = data.toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .replace(/^\w/, c => c.toUpperCase());

      meses.push({
        key,
        mes: mesLabel,
        receita: 0,
        despesa: 0,
        lucro: 0,
      });
    }

    return meses;
  }

  async function loadFinanceData() {
    try {
      setLoadingKpis(true);

      let lancamentos: any[] = [];

      if (financeService?.getFinancialData) {
        const result = await financeService.getFinancialData();

        if (Array.isArray(result)) {
          lancamentos = result;
        } else if (Array.isArray((result as any)?.data)) {
          lancamentos = (result as any).data;
        } else if (Array.isArray((result as any)?.financial_invoices)) {
          lancamentos = (result as any).financial_invoices;
        } else if (Array.isArray((result as any)?.invoices)) {
          lancamentos = (result as any).invoices;
        } else if (Array.isArray((result as any)?.entries)) {
          lancamentos = (result as any).entries;
        }
      }

      if (!lancamentos.length) {
        const { data, error } = await supabase
          .from('financial_invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        lancamentos = data ?? [];
      }

      setAllLancamentos(lancamentos);

      const lancamentosFiltradosPorConta = filtroBanco === 'Todos'
        ? lancamentos
        : lancamentos.filter(item => String(getContaNumero(item)) === String(filtroBanco));

      let faturamento = 0;
      let custo = 0;
      let atraso = 0;

      lancamentosFiltradosPorConta.forEach((item) => {
        const valor = getItemValor(item);

        if (isReceita(item)) faturamento += valor;
        if (isDespesa(item)) custo += valor;

        const status = String(item?.status ?? '').toLowerCase();
        if (status.includes('atras')) {
          atraso += valor;
        }
      });

      const saldo = faturamento - custo;
      const lucro = faturamento - custo;

      setKpis({
        saldo,
        faturamento,
        custo,
        lucro,
        juros: 0,
        atraso,
      });

      const mesesBase = getMesesDoPeriodoSelecionado(periodo);

      const agrupado = mesesBase.map((mesRef) => {
        const itensDoMes = lancamentos.filter((item) => {
          const dataItem = getItemDate(item);
          if (!dataItem) return false;

          const d = new Date(dataItem);
          if (Number.isNaN(d.getTime())) return false;

          const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return chave === mesRef.key;
        });

        let receita = 0;
        let despesa = 0;

        itensDoMes.forEach((item) => {
          const valor = getItemValor(item);
          if (isReceita(item)) receita += valor;
          if (isDespesa(item)) despesa += valor;
        });

        return {
          mes: mesRef.mes,
          receita,
          despesa,
          lucro: receita - despesa,
        };
      });

      setFluxoCaixaData(agrupado);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);

      setKpis({
        saldo: 0,
        faturamento: 0,
        custo: 0,
        lucro: 0,
        juros: 0,
        atraso: 0,
      });

      setFluxoCaixaData([
        { mes: 'Out', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Nov', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Dez', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Jan', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Fev', receita: 0, despesa: 0, lucro: 0 },
        { mes: 'Mar', receita: 0, despesa: 0, lucro: 0 },
      ]);
    } finally {
      setLoadingKpis(false);
    }
  }

  useEffect(() => {
    loadFinanceData();
  }, [periodo, filtroBanco]);

  async function salvarLancamento() {
    if (!form.descricao || !form.valor || !form.empresa_id || !form.conta_id) return;

    setSaving(true);

    try {
      await financeService.createFinancialEntry(form);
      setOpenLancamento(false);
      setForm({
        descricao: '',
        valor: '',
        tipo: 'income',
        categoria: '',
        vencimento: '',
        empresa_id: '',
        conta_id: ''
      });

      await loadFinanceData();
    } finally {
      setSaving(false);
    }
  }

  function toggleKpi(id: string) {
    setVisibleKpis(prev => {
      const next = prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id];
      localStorage.setItem("financeiro_kpis", JSON.stringify(next));
      return next;
    });
  }

  const quantidadeLancamentos = filtroBanco === 'Todos'
    ? allLancamentos.length
    : allLancamentos.filter(item => String(getContaNumero(item)) === String(filtroBanco)).length;

  const subtitleBanco = loadingKpis
    ? 'Carregando dados...'
    : filtroBanco === 'Todos'
      ? `${quantidadeLancamentos} lançamentos carregados`
      : `Conta ${filtroBanco} — ${quantidadeLancamentos} lançamentos`;

  const allKpiCards = [
    { id: "saldo", title: "Saldo Total", value: fmt(kpis.saldo), subtitle: subtitleBanco, icon: Wallet, colorClass: "text-blue-500" },
    { id: "faturamento", title: "Faturamento Mensal", value: fmt(kpis.faturamento), subtitle: loadingKpis ? 'Carregando dados...' : subtitleBanco, icon: TrendingUp, colorClass: "text-emerald-500" },
    { id: "custo", title: "Custo Operacional", value: fmt(kpis.custo), subtitle: loadingKpis ? 'Carregando dados...' : subtitleBanco, icon: DollarSign, colorClass: "text-rose-500" },
    { id: "lucro", title: "Lucro Estimado", value: fmt(kpis.lucro), subtitle: loadingKpis ? 'Carregando dados...' : subtitleBanco, icon: BarChart3, colorClass: "text-purple-500" },
    { id: "juros", title: "Juros Evitados", value: fmt(kpis.juros), subtitle: loadingKpis ? 'Carregando dados...' : 'Cálculo inicial', icon: Shield, colorClass: "text-teal-500" },
    { id: "atraso", title: "Em Atraso", value: fmt(kpis.atraso), subtitle: loadingKpis ? 'Carregando dados...' : subtitleBanco, icon: AlertTriangle, colorClass: "text-amber-500" },
  ];

  const visibleCards = allKpiCards.filter(k => visibleKpis.includes(k.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão Financeira e Contábil"
        subtitle="Controle completo de receitas, custos operacionais e obrigações — Grupo Esquematiza (5 empresas)."
        actions={
          <>
            <div className="relative">
              <ActionButton variant="secondary" onClick={() => setOpenPeriodo(!openPeriodo)}>
                <Calendar className="w-4 h-4" />
                {['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'].find(m => m === periodo)
                  ? new Date(periodo + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  : 'Março 2026'}
              </ActionButton>

              {openPeriodo && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                  {['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'].map(m => (
                    <button
                      key={m}
                      onClick={() => { setPeriodo(m); setOpenPeriodo(false); }}
                      className={"w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition " + (periodo === m ? "font-bold text-emerald-700 bg-emerald-50" : "text-gray-700")}
                    >
                      {new Date(m + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCustomizer(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition"
            >
              <Settings className="w-4 h-4" /> Personalizar KPIs
            </button>

            <ActionButton onClick={() => setOpenLancamento(true)}>+ Novo Lançamento</ActionButton>
          </>
        }
      />

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-emerald-500 rounded-xl shrink-0"><Building2 className="w-6 h-6 text-white" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-emerald-800 text-sm">Integração Bancária via Open Finance / API</p>
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">NOVO</span>
          </div>
          <p className="text-emerald-700 text-xs font-medium">Conecte seu banco para importar extratos automaticamente e conciliar em tempo real.</p>
        </div>
        <ActionButton className="shrink-0 whitespace-nowrap"><Zap className="w-4 h-4" /> Conectar banco</ActionButton>
      </div>

      {visibleCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {visibleCards.map((card) =>
            card.id === 'saldo' ? (
              <KpiSaldoTotal
                key="saldo"
                conta={filtroBanco}
                onChangeConta={setFiltroBanco}
                value={card.value}
                subtitle={card.subtitle}
              />
            ) : (
              <KpiCard
                key={card.id}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                colorClass={card.colorClass}
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Settings className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum KPI selecionado.</p>
          <button onClick={() => setShowCustomizer(true)} className="mt-3 text-sm text-emerald-600 font-semibold hover:underline">Personalizar</button>
        </div>
      )}

      <SecaoMultiEmpresa />

      <SectionCard
        title="DRE Resumido — Receita vs Custo vs Lucro"
        action={
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Receita</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />Custo</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Lucro</span>
          </div>
        }
      >
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fluxoCaixaData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" name="Custo" fill="#fb7185" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          {loadingKpis ? 'Carregando dados reais do gráfico...' : 'Gráfico alimentado com dados reais do período.'}
        </p>
      </SectionCard>

      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-emerald-700 font-semibold text-sm">
          🚀 Sistema conectado aos dados financeiros. Próximo passo: inadimplência, juros, fluxo de caixa real e DRE completo.
        </p>
      </div>

      {showCustomizer && (
        <KpiCustomizerPanel
          visible={visibleKpis}
          onToggle={toggleKpi}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {openLancamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Novo Lançamento</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Descrição *"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
              />

              <input
                type="number"
                placeholder="Valor (R$) *"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
              />

              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="income">Entrada (Receita)</option>
                <option value="expense">Saída (Despesa)</option>
              </select>

              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
              >
                <option value="">Selecione categoria</option>
                {['Serviço Prestado', 'Recebimento de Cliente', 'Folha de Pagamento', 'Encargos (INSS/FGTS)', 'Fornecedores', 'Impostos', 'Frota', 'Aluguel', 'TI', 'Outros'].map(cat =>
                  <option key={cat} value={cat}>{cat}</option>
                )}
              </select>

              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.empresa_id}
                onChange={e => setForm({ ...form, empresa_id: e.target.value, conta_id: '' })}
              >
                <option value="">Empresa *</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>

              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.conta_id}
                disabled={!form.empresa_id}
                onChange={e => setForm({ ...form, conta_id: e.target.value })}
              >
                <option value="">Conta bancária *</option>
                {contas.map(c => <option key={c.id} value={c.id}>{c.banco_nome} Ag {c.agencia} — {c.conta}</option>)}
              </select>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Vencimento</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.vencimento}
                  onChange={e => setForm({ ...form, vencimento: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <ActionButton variant="secondary" onClick={() => setOpenLancamento(false)}>Cancelar</ActionButton>
              <ActionButton
                onClick={salvarLancamento}
                disabled={saving || !form.descricao || !form.valor || !form.empresa_id || !form.conta_id}
              >
                {saving ? 'Salvando...' : 'Salvar Lançamento'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
