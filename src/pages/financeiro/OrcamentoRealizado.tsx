import React, { useState, useEffect } from 'react';
import {
  Target, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  CheckCircle2, Plus, X, ChevronDown, ChevronUp, BarChart3,
  Calendar, Filter, Search, Edit3, Save,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line,
} from 'recharts';
import { supabase } from '../../lib/supabase';

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface OrcamentoContrato {
  id: string;
  contrato_id: string;
  cliente: string;
  empresa: string;
  periodo: string; // YYYY-MM
  // Orçado
  faturamento_orcado: number;
  custo_mo_orcado: number;
  custo_outros_orcado: number;
  // Realizado
  faturamento_realizado: number;
  custo_mo_realizado: number;
  custo_outros_realizado: number;
}

interface ContratoBase {
  id: string;
  cliente: string;
  empresa: string;
  faturamento: number;
  custo_mo: number;
  custo_uniforme: number;
  custo_transporte: number;
  custo_admin: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcVariacao(orcado: number, realizado: number) {
  if (orcado === 0) return 0;
  return ((realizado - orcado) / orcado) * 100;
}

function corVariacao(variacao: number, inverter = false) {
  const positivo = inverter ? variacao < 0 : variacao >= 0;
  return positivo ? 'text-emerald-600' : 'text-red-600';
}

function bgVariacao(variacao: number, inverter = false) {
  const positivo = inverter ? variacao < 0 : variacao >= 0;
  return positivo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200';
}

function StatusBadge({ variacao, inverter = false }: { variacao: number; inverter?: boolean }) {
  const ok = inverter ? variacao <= 5 : variacao >= -5;
  if (Math.abs(variacao) <= 5) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">No alvo</span>
  );
  if (ok) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Acima</span>
  );
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Abaixo</span>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ title, orcado, realizado, inverter = false, icon: Icon, cor }: {
  title: string; orcado: number; realizado: number;
  inverter?: boolean; icon: React.ElementType; cor: string;
}) {
  const variacao = calcVariacao(orcado, realizado);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${cor}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Orçado</span>
          <span className="text-sm font-semibold text-slate-600">{fmt(orcado)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Realizado</span>
          <span className="text-sm font-bold text-slate-900">{fmt(realizado)}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400">Variação</span>
          <span className={`text-xs font-bold ${corVariacao(variacao, inverter)}`}>
            {fmtPct(variacao)}
          </span>
        </div>
      </div>
      {/* Barra de progresso */}
      <div className="mt-3">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${inverter ? (variacao <= 0 ? 'bg-emerald-500' : 'bg-red-400') : (variacao >= 0 ? 'bg-emerald-500' : 'bg-red-400')}`}
            style={{ width: `${Math.min(100, Math.abs(realizado / (orcado || 1)) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0%</span>
          <span>100% orçado</span>
        </div>
      </div>
    </div>
  );
}

// ─── Modal novo orçamento ────────────────────────────────────────────────────

function ModalNovoOrcamento({ contratos, periodo, onClose, onSalvo }: {
  contratos: ContratoBase[];
  periodo: string;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [contratoId, setContratoId] = useState('');
  const [form, setForm] = useState({
    faturamento_orcado: '', custo_mo_orcado: '', custo_outros_orcado: '',
    faturamento_realizado: '', custo_mo_realizado: '', custo_outros_realizado: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const contrato = contratos.find(c => c.id === contratoId);

  // Auto-preenche com valores do contrato ao selecionar
  useEffect(() => {
    if (contrato) {
      setForm({
        faturamento_orcado:    String(contrato.faturamento),
        custo_mo_orcado:       String(contrato.custo_mo),
        custo_outros_orcado:   String(contrato.custo_uniforme + contrato.custo_transporte + contrato.custo_admin),
        faturamento_realizado: String(contrato.faturamento),
        custo_mo_realizado:    String(contrato.custo_mo),
        custo_outros_realizado: String(contrato.custo_uniforme + contrato.custo_transporte + contrato.custo_admin),
      });
    }
  }, [contratoId]);

  function set(campo: string, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  // Preview margem
  const fatOrc  = parseFloat(form.faturamento_orcado) || 0;
  const cusOrc  = (parseFloat(form.custo_mo_orcado) || 0) + (parseFloat(form.custo_outros_orcado) || 0);
  const fatReal = parseFloat(form.faturamento_realizado) || 0;
  const cusReal = (parseFloat(form.custo_mo_realizado) || 0) + (parseFloat(form.custo_outros_realizado) || 0);
  const margemOrc  = fatOrc  > 0 ? ((fatOrc  - cusOrc)  / fatOrc)  * 100 : 0;
  const margemReal = fatReal > 0 ? ((fatReal - cusReal) / fatReal) * 100 : 0;

  async function salvar() {
    if (!contratoId || !form.faturamento_orcado) {
      setErro('Selecione o contrato e preencha o faturamento orçado.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const { error } = await supabase.from('orcamento_realizado').insert({
        contrato_id:            contratoId,
        cliente:                contrato?.cliente ?? '',
        empresa:                contrato?.empresa ?? '',
        periodo,
        faturamento_orcado:     parseFloat(form.faturamento_orcado) || 0,
        custo_mo_orcado:        parseFloat(form.custo_mo_orcado) || 0,
        custo_outros_orcado:    parseFloat(form.custo_outros_orcado) || 0,
        faturamento_realizado:  parseFloat(form.faturamento_realizado) || 0,
        custo_mo_realizado:     parseFloat(form.custo_mo_realizado) || 0,
        custo_outros_realizado: parseFloat(form.custo_outros_realizado) || 0,
      });
      if (error) throw error;
      onSalvo();
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Lançar Orçamento vs Realizado</h2>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Contrato *</label>
              <select value={contratoId} onChange={e => setContratoId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecione o contrato...</option>
                {contratos.map(c => <option key={c.id} value={c.id}>{c.cliente} — {c.empresa}</option>)}
              </select>
            </div>
          </div>

          {/* Orçado vs Realizado lado a lado */}
          <div className="grid grid-cols-2 gap-6">
            {/* Orçado */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-3 py-1.5 rounded-lg">📋 Orçado</p>
              {[
                { label: 'Faturamento Orçado (R$)', campo: 'faturamento_orcado' },
                { label: 'Custo MO Orçado (R$)',    campo: 'custo_mo_orcado' },
                { label: 'Outros Custos Orçados (R$)', campo: 'custo_outros_orcado' },
              ].map(item => (
                <div key={item.campo} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{item.label}</label>
                  <input type="number" value={(form as any)[item.campo]}
                    onChange={e => set(item.campo, e.target.value)}
                    min="0" step="0.01"
                    className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              {fatOrc > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-600">Margem orçada</p>
                  <p className="text-lg font-black text-blue-700">{margemOrc.toFixed(1)}%</p>
                </div>
              )}
            </div>

            {/* Realizado */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-3 py-1.5 rounded-lg">✅ Realizado</p>
              {[
                { label: 'Faturamento Realizado (R$)', campo: 'faturamento_realizado' },
                { label: 'Custo MO Realizado (R$)',    campo: 'custo_mo_realizado' },
                { label: 'Outros Custos Reais (R$)',   campo: 'custo_outros_realizado' },
              ].map(item => (
                <div key={item.campo} className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">{item.label}</label>
                  <input type="number" value={(form as any)[item.campo]}
                    onChange={e => set(item.campo, e.target.value)}
                    min="0" step="0.01"
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              {fatReal > 0 && (
                <div className={`rounded-xl p-3 text-center border ${margemReal >= margemOrc ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs text-slate-500">Margem realizada</p>
                  <p className={`text-lg font-black ${margemReal >= margemOrc ? 'text-emerald-700' : 'text-red-700'}`}>{margemReal.toFixed(1)}%</p>
                  <p className={`text-xs font-semibold ${margemReal >= margemOrc ? 'text-emerald-600' : 'text-red-600'}`}>
                    {margemReal >= margemOrc ? '▲' : '▼'} {Math.abs(margemReal - margemOrc).toFixed(1)}pp vs orçado
                  </p>
                </div>
              )}
            </div>
          </div>

          {erro && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="button" onClick={salvar} disabled={salvando} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-2">
              {salvando ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da tabela ─────────────────────────────────────────────────────────

function LinhaOrcamento({ o }: { o: OrcamentoContrato }) {
  const [aberto, setAberto] = useState(false);

  const custoOrc  = o.custo_mo_orcado + o.custo_outros_orcado;
  const custoReal = o.custo_mo_realizado + o.custo_outros_realizado;
  const lucroOrc  = o.faturamento_orcado - custoOrc;
  const lucroReal = o.faturamento_realizado - custoReal;
  const margemOrc  = o.faturamento_orcado  > 0 ? (lucroOrc  / o.faturamento_orcado)  * 100 : 0;
  const margemReal = o.faturamento_realizado > 0 ? (lucroReal / o.faturamento_realizado) * 100 : 0;
  const varFat  = calcVariacao(o.faturamento_orcado, o.faturamento_realizado);
  const varMarg = margemReal - margemOrc;

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition" onClick={() => setAberto(a => !a)}>
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{o.cliente}</p>
          <p className="text-xs text-slate-400">{o.empresa}</p>
        </td>
        <td className="px-4 py-3 text-right">
          <p className="text-xs text-slate-400">{fmt(o.faturamento_orcado)}</p>
          <p className="text-sm font-bold text-slate-800">{fmt(o.faturamento_realizado)}</p>
        </td>
        <td className="px-4 py-3 text-right">
          <span className={`text-xs font-bold ${corVariacao(varFat)}`}>{fmtPct(varFat)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <p className="text-xs text-slate-400">{margemOrc.toFixed(1)}%</p>
          <p className={`text-sm font-bold ${margemReal >= margemOrc ? 'text-emerald-600' : 'text-red-600'}`}>
            {margemReal.toFixed(1)}%
          </p>
        </td>
        <td className="px-4 py-3 text-center">
          <StatusBadge variacao={varFat} />
        </td>
        <td className="px-4 py-3 text-center text-slate-400">
          {aberto ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {aberto && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={6} className="px-6 py-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Faturamento', orc: o.faturamento_orcado, real: o.faturamento_realizado, inv: false },
                { label: 'Custo Total',  orc: custoOrc,  real: custoReal,  inv: true },
                { label: 'Lucro',        orc: lucroOrc,  real: lucroReal,  inv: false },
              ].map(item => {
                const v = calcVariacao(item.orc, item.real);
                return (
                  <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">{item.label}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Orçado</span>
                        <span className="font-semibold text-blue-600">{fmt(item.orc)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Realizado</span>
                        <span className="font-semibold text-slate-800">{fmt(item.real)}</span>
                      </div>
                      <div className={`flex justify-between text-xs pt-1 border-t border-slate-100`}>
                        <span className="text-slate-400">Diferença</span>
                        <span className={`font-bold ${corVariacao(v, item.inv)}`}>{fmt(item.real - item.orc)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mini gráfico comparativo */}
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Faturamento', orcado: o.faturamento_orcado, realizado: o.faturamento_realizado },
                    { name: 'Custo',       orcado: custoOrc,             realizado: custoReal },
                    { name: 'Lucro',       orcado: lucroOrc,             realizado: lucroReal },
                  ]}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [fmt(Number(v))]} />
                  <Bar dataKey="orcado"    name="Orçado"    fill="#93c5fd" radius={[3,3,0,0]} />
                  <Bar dataKey="realizado" name="Realizado" fill="#10b981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function OrcamentoRealizado() {
  const [dados, setDados] = useState<OrcamentoContrato[]>([]);
  const [contratos, setContratos] = useState<ContratoBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(() => new Date().toISOString().slice(0, 7));
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 2 + i);
    return { value: d.toISOString().slice(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
  });

  async function carregar() {
    setLoading(true);
    const [{ data: orc }, { data: conts }] = await Promise.all([
      supabase.from('orcamento_realizado').select('*').eq('periodo', periodo).order('cliente'),
      supabase.from('contratos_rentabilidade').select('*').eq('ativo', true).order('cliente'),
    ]);
    setDados(orc ?? []);
    setContratos(conts ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [periodo]);

  const filtrados = dados.filter(d =>
    d.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    d.empresa.toLowerCase().includes(busca.toLowerCase())
  );

  // KPIs consolidados
  const totalFatOrc  = dados.reduce((s, d) => s + d.faturamento_orcado, 0);
  const totalFatReal = dados.reduce((s, d) => s + d.faturamento_realizado, 0);
  const totalCustoOrc  = dados.reduce((s, d) => s + d.custo_mo_orcado + d.custo_outros_orcado, 0);
  const totalCustoReal = dados.reduce((s, d) => s + d.custo_mo_realizado + d.custo_outros_realizado, 0);
  const totalLucroOrc  = totalFatOrc  - totalCustoOrc;
  const totalLucroReal = totalFatReal - totalCustoReal;
  const margemOrcTotal  = totalFatOrc  > 0 ? (totalLucroOrc  / totalFatOrc)  * 100 : 0;
  const margemRealTotal = totalFatReal > 0 ? (totalLucroReal / totalFatReal) * 100 : 0;

  // Dados gráfico consolidado
  const dadosGrafico = filtrados.map(d => {
    const custoOrc  = d.custo_mo_orcado  + d.custo_outros_orcado;
    const custoReal = d.custo_mo_realizado + d.custo_outros_realizado;
    return {
      nome: d.cliente.split(' ').slice(0, 2).join(' '),
      fatOrc: d.faturamento_orcado,
      fatReal: d.faturamento_realizado,
      lucroOrc: d.faturamento_orcado - custoOrc,
      lucroReal: d.faturamento_realizado - custoReal,
    };
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orçamento vs Realizado</h1>
          <p className="text-sm text-slate-500 mt-1">Comparativo de planejado x executado por contrato</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={() => setModal(true)} style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Lançar Período
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Faturamento" orcado={totalFatOrc}   realizado={totalFatReal}   icon={TrendingUp}   cor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Custo Total" orcado={totalCustoOrc} realizado={totalCustoReal} icon={TrendingDown}  cor="bg-rose-50 text-rose-600"    inverter />
        <KpiCard title="Lucro"       orcado={totalLucroOrc} realizado={totalLucroReal} icon={DollarSign}   cor="bg-purple-50 text-purple-600" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Margem</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><BarChart3 className="w-4 h-4" /></div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Orçada</span><span className="font-semibold text-blue-600">{margemOrcTotal.toFixed(1)}%</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Realizada</span><span className={`font-bold ${margemRealTotal >= margemOrcTotal ? 'text-emerald-600' : 'text-red-600'}`}>{margemRealTotal.toFixed(1)}%</span></div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-400">Variação</span>
              <span className={`font-bold ${margemRealTotal >= margemOrcTotal ? 'text-emerald-600' : 'text-red-600'}`}>
                {fmtPct(margemRealTotal - margemOrcTotal)} pp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico consolidado */}
      {dadosGrafico.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Faturamento Orçado vs Realizado por Contrato</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [fmt(Number(v))]} />
                <Bar dataKey="fatOrc"  name="Orçado"    fill="#93c5fd" radius={[4,4,0,0]} />
                <Bar dataKey="fatReal" name="Realizado" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded bg-blue-300 inline-block" /> Orçado</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Realizado</span>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar contrato..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Target className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">
                {dados.length === 0
                  ? 'Nenhum orçamento lançado para este período.'
                  : 'Nenhum resultado encontrado.'}
              </p>
              {dados.length === 0 && (
                <p className="text-slate-400 text-sm">
                  Clique em "+ Lançar Período" para comparar orçado vs realizado dos seus contratos.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Contrato</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                    <span className="text-slate-400 block text-[10px]">Orçado</span>Faturamento
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Variação</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                    <span className="text-slate-400 block text-[10px]">Orçada</span>Margem
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(o => <LinhaOrcamento key={o.id} o={o} />)}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">{filtrados.length} contratos · Clique em qualquer linha para ver o detalhamento</p>
        </div>
      </div>

      {modal && (
        <ModalNovoOrcamento
          contratos={contratos}
          periodo={periodo}
          onClose={() => setModal(false)}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}
