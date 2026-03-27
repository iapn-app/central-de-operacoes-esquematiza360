import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, FileText, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, Clock, Search, Filter,
  Download, Calculator, Calendar, Shield, TrendingUp,
  X, Plus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constantes do setor de segurança ──────────────────────────────────────

const PISO_VIGILANTE_SP = 2850.00;   // Piso salarial vigilante (referência)
const ADICIONAL_NOTURNO = 0.20;      // 20% sobre hora normal
const HORA_EXTRA_50     = 1.50;      // 50% sobre hora normal
const HORA_EXTRA_100    = 2.00;      // 100% domingos/feriados
const INSS_EMPREGADO    = 0.09;      // 9% desconto empregado (simplificado)
const FGTS              = 0.08;      // 8% FGTS empregador
const INSS_EMPREGADOR   = 0.20;      // 20% INSS patronal
const INSALUBRIDADE     = 0.20;      // 20% do piso nacional (quando aplicável)

const TURNO_HORAS: Record<string, number> = {
  '12x36 D':  12,
  '12x36 N':  12,
  '8h D':      8,
  '6h D':      6,
  '24h':      24,
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Vigilante {
  id: string;
  nome: string;
  cpf?: string;
  posto: string;
  empresa: string;
  turno: string;
  salario_base: number;
  insalubre: boolean;
  dias_trabalhados: number;
  horas_extras_50: number;
  horas_extras_100: number;
  faltas: number;
  status: string;
}

interface FormVigilante {
  nome: string;
  cpf: string;
  posto: string;
  empresa: string;
  turno: string;
  salario_base: string;
  insalubre: boolean;
  dias_trabalhados: string;
  horas_extras_50: string;
  horas_extras_100: string;
  faltas: string;
}

const FORM_VAZIO: FormVigilante = {
  nome: '', cpf: '', posto: '', empresa: 'Vigilância', turno: '12x36 D',
  salario_base: String(PISO_VIGILANTE_SP),
  insalubre: false,
  dias_trabalhados: '15', horas_extras_50: '0', horas_extras_100: '0', faltas: '0',
};

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];
const TURNOS   = ['12x36 D', '12x36 N', '8h D', '6h D', '24h'];

// ─── Cálculo da folha ──────────────────────────────────────────────────────

function calcularFolha(v: Vigilante) {
  const horasTurno   = TURNO_HORAS[v.turno] ?? 12;
  const horasDia     = horasTurno;
  const diasMes      = 30;
  const horasMes     = Math.round((diasMes / (v.turno.includes('36') ? 2 : 1)) * horasDia);
  const valorHora    = v.salario_base / horasMes;

  // Proventos
  const salarioProp  = v.dias_trabalhados > 0
    ? (v.salario_base / diasMes) * v.dias_trabalhados
    : v.salario_base;

  const adicNoturno  = v.turno.includes('N') || v.turno === '24h'
    ? salarioProp * ADICIONAL_NOTURNO
    : 0;

  const horaExtra50  = v.horas_extras_50  * valorHora * HORA_EXTRA_50;
  const horaExtra100 = v.horas_extras_100 * valorHora * HORA_EXTRA_100;
  const insalubridade = v.insalubre ? (PISO_VIGILANTE_SP * INSALUBRIDADE) : 0;

  const totalProventos = salarioProp + adicNoturno + horaExtra50 + horaExtra100 + insalubridade;

  // Descontos
  const descontoFalta = v.faltas > 0 ? (v.salario_base / diasMes) * v.faltas : 0;
  const descontoINSS  = totalProventos * INSS_EMPREGADO;
  const totalDescontos = descontoFalta + descontoINSS;

  // Líquido
  const liquido = totalProventos - totalDescontos;

  // Encargos empregador
  const fgts           = salarioProp * FGTS;
  const inssPatronal   = salarioProp * INSS_EMPREGADOR;
  const custoTotal     = liquido + fgts + inssPatronal;

  return {
    salarioProp, adicNoturno, horaExtra50, horaExtra100, insalubridade,
    totalProventos, descontoFalta, descontoINSS, totalDescontos,
    liquido, fgts, inssPatronal, custoTotal, valorHora, horasMes,
  };
}

// ─── Card KPI ──────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, cor }: {
  title: string; value: string; sub: string;
  icon: React.ElementType; cor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl flex-shrink-0 ${cor}`}><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Linha expandível da folha ─────────────────────────────────────────────

function LinhaFolha({ v, onEditar }: { v: Vigilante; onEditar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const calc = calcularFolha(v);

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        onClick={() => setAberto(a => !a)}
      >
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{v.nome}</p>
          <p className="text-xs text-slate-400">{v.posto} · {v.turno}</p>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{v.empresa}</span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 text-right">{fmt(v.salario_base)}</td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-bold text-emerald-600">{fmt(calc.totalProventos)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm text-red-500">-{fmt(calc.totalDescontos)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-black text-slate-900">{fmt(calc.liquido)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-xs text-slate-500">{fmt(calc.custoTotal)}</span>
        </td>
        <td className="px-4 py-3 text-center text-slate-400">
          {aberto
            ? <ChevronUp className="w-4 h-4 inline" />
            : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {aberto && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Proventos */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Proventos</p>
                <div className="space-y-2">
                  {[
                    { label: 'Salário Proporcional', valor: calc.salarioProp },
                    { label: 'Adicional Noturno (20%)', valor: calc.adicNoturno },
                    { label: `HE 50% (${v.horas_extras_50}h)`, valor: calc.horaExtra50 },
                    { label: `HE 100% (${v.horas_extras_100}h)`, valor: calc.horaExtra100 },
                    { label: 'Insalubridade (20%)', valor: calc.insalubridade },
                  ].map(item => item.valor > 0 && (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-emerald-600">{fmt(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                    <span className="font-bold text-slate-700">Total Proventos</span>
                    <span className="font-bold text-emerald-600">{fmt(calc.totalProventos)}</span>
                  </div>
                </div>
              </div>

              {/* Descontos */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Descontos</p>
                <div className="space-y-2">
                  {[
                    { label: `Falta(s) (${v.faltas}d)`, valor: calc.descontoFalta },
                    { label: 'INSS Empregado (9%)', valor: calc.descontoINSS },
                  ].map(item => item.valor > 0 && (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-red-500">-{fmt(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                    <span className="font-bold text-slate-700">Total Descontos</span>
                    <span className="font-bold text-red-500">-{fmt(calc.totalDescontos)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-slate-300 pt-2 mt-1">
                    <span className="font-black text-slate-900">Líquido a Pagar</span>
                    <span className="font-black text-slate-900">{fmt(calc.liquido)}</span>
                  </div>
                </div>
              </div>

              {/* Encargos empregador */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Encargos (Empregador)</p>
                <div className="space-y-2">
                  {[
                    { label: 'FGTS (8%)',         valor: calc.fgts },
                    { label: 'INSS Patronal (20%)',valor: calc.inssPatronal },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-orange-600">{fmt(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                    <span className="font-bold text-slate-700">Custo Total Empresa</span>
                    <span className="font-bold text-orange-600">{fmt(calc.custoTotal)}</span>
                  </div>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700 font-semibold">
                    Valor/hora: {fmt(calc.valorHora)} · Horas/mês: {calc.horasMes}h
                  </p>
                </div>

                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onEditar(); }}
                  style={{ cursor: 'pointer' }}
                  className="mt-3 w-full text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl py-2 hover:bg-slate-100 transition">
                  Editar dados do mês
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Modal cadastro/edição ─────────────────────────────────────────────────

function ModalVigilante({ inicial, onClose, onSalvo }: {
  inicial?: Vigilante;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [form, setForm] = useState<FormVigilante>(
    inicial
      ? {
          nome: inicial.nome, cpf: inicial.cpf ?? '', posto: inicial.posto,
          empresa: inicial.empresa, turno: inicial.turno,
          salario_base: String(inicial.salario_base),
          insalubre: inicial.insalubre,
          dias_trabalhados: String(inicial.dias_trabalhados),
          horas_extras_50: String(inicial.horas_extras_50),
          horas_extras_100: String(inicial.horas_extras_100),
          faltas: String(inicial.faltas),
        }
      : FORM_VAZIO
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set(campo: keyof FormVigilante, valor: string | boolean) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  // Preview cálculo
  const vPreview: Vigilante = {
    id: '', nome: form.nome, posto: form.posto, empresa: form.empresa,
    turno: form.turno, salario_base: parseFloat(form.salario_base) || 0,
    insalubre: form.insalubre, dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
    horas_extras_50: parseFloat(form.horas_extras_50) || 0,
    horas_extras_100: parseFloat(form.horas_extras_100) || 0,
    faltas: parseInt(form.faltas) || 0, status: 'ativo',
  };
  const calc = calcularFolha(vPreview);

  async function salvar() {
    if (!form.nome || !form.posto || !form.empresa) {
      setErro('Preencha nome, posto e empresa.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        nome: form.nome, cpf: form.cpf || null, posto: form.posto,
        empresa: form.empresa, turno: form.turno,
        salario_base: parseFloat(form.salario_base) || PISO_VIGILANTE_SP,
        insalubre: form.insalubre,
        dias_trabalhados: parseInt(form.dias_trabalhados) || 15,
        horas_extras_50: parseFloat(form.horas_extras_50) || 0,
        horas_extras_100: parseFloat(form.horas_extras_100) || 0,
        faltas: parseInt(form.faltas) || 0,
        status: 'ativo',
      };

      if (inicial?.id) {
        const { error } = await supabase
          .from('folha_pagamento').update(payload).eq('id', inicial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('folha_pagamento').insert(payload);
        if (error) throw error;
      }
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {inicial ? 'Editar Vigilante' : 'Novo Vigilante na Folha'}
          </h2>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo *</label>
              <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Nome do vigilante"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF</label>
              <input type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Empresa *</label>
              <select value={form.empresa} onChange={e => set('empresa', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                {EMPRESAS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Posto *</label>
              <input type="text" value={form.posto} onChange={e => set('posto', e.target.value)}
                placeholder="Nome do posto"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Turno</label>
              <select value={form.turno} onChange={e => set('turno', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                {TURNOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Salário e regime */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Salário Base (R$)</label>
              <input type="number" value={form.salario_base} onChange={e => set('salario_base', e.target.value)}
                min="0" step="0.01"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Dias Trabalhados (mês)</label>
              <input type="number" value={form.dias_trabalhados} onChange={e => set('dias_trabalhados', e.target.value)}
                min="0" max="31"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">HE 50% (horas)</label>
              <input type="number" value={form.horas_extras_50} onChange={e => set('horas_extras_50', e.target.value)}
                min="0" step="0.5"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">HE 100% — Dom/Feriado (horas)</label>
              <input type="number" value={form.horas_extras_100} onChange={e => set('horas_extras_100', e.target.value)}
                min="0" step="0.5"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Faltas (dias)</label>
              <input type="number" value={form.faltas} onChange={e => set('faltas', e.target.value)}
                min="0" max="31"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.insalubre}
                  onChange={e => set('insalubre', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Insalubridade (20%)</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {parseFloat(form.salario_base) > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-400">Proventos</p>
                <p className="text-sm font-black text-emerald-600">{fmt(calc.totalProventos)}</p>
              </div>
              <div className="text-center border-x border-slate-200">
                <p className="text-xs text-slate-400">Líquido</p>
                <p className="text-sm font-black text-slate-900">{fmt(calc.liquido)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Custo Total</p>
                <p className="text-sm font-black text-orange-600">{fmt(calc.custoTotal)}</p>
              </div>
            </div>
          )}

          {erro && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="button" onClick={salvar} disabled={salvando} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-2">
              {salvando ? 'Salvando...' : inicial ? 'Salvar Alterações' : 'Adicionar à Folha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

export function FolhaPagamento() {
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [busca, setBusca] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Vigilante | undefined>(undefined);

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 2 + i);
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  async function carregar() {
    setLoading(true);
    const { data } = await supabase
      .from('folha_pagamento')
      .select('*')
      .order('nome');
    setVigilantes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = vigilantes.filter(v =>
    (filtroEmpresa === 'Todas' || v.empresa === filtroEmpresa) &&
    v.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Totais consolidados
  const totais = filtrados.reduce((acc, v) => {
    const c = calcularFolha(v);
    return {
      proventos:  acc.proventos  + c.totalProventos,
      descontos:  acc.descontos  + c.totalDescontos,
      liquido:    acc.liquido    + c.liquido,
      custo:      acc.custo      + c.custoTotal,
      fgts:       acc.fgts       + c.fgts,
      inssPatr:   acc.inssPatr   + c.inssPatronal,
    };
  }, { proventos: 0, descontos: 0, liquido: 0, custo: 0, fgts: 0, inssPatr: 0 });

  const comFalta   = filtrados.filter(v => v.faltas > 0).length;
  const comHExtra  = filtrados.filter(v => v.horas_extras_50 > 0 || v.horas_extras_100 > 0).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Folha de Pagamento</h1>
          <p className="text-sm text-slate-500 mt-1">Cálculo automático integrado com escalas — Grupo Esquematiza</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={mes} onChange={e => setMes(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button
            onClick={() => { setEditando(undefined); setModalAberto(true); }}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Adicionar Vigilante
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Vigilantes na Folha" value={String(filtrados.length)}
          sub={`${comFalta} com falta · ${comHExtra} com HE`}
          icon={Users} cor="bg-blue-50 text-blue-600" />
        <KpiCard title="Total Proventos" value={fmt(totais.proventos)}
          sub="bruto antes de descontos"
          icon={TrendingUp} cor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Total Líquido" value={fmt(totais.liquido)}
          sub="a depositar em conta"
          icon={DollarSign} cor="bg-purple-50 text-purple-600" />
        <KpiCard title="Custo Total Empresa" value={fmt(totais.custo)}
          sub={`FGTS ${fmt(totais.fgts)} · INSS ${fmt(totais.inssPatr)}`}
          icon={Calculator} cor="bg-orange-50 text-orange-600" />
      </div>

      {/* Alertas */}
      {(comFalta > 0 || comHExtra > 0) && (
        <div className="flex flex-wrap gap-3">
          {comFalta > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">{comFalta} vigilante(s) com falta este mês</span>
            </div>
          )}
          {comHExtra > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{comHExtra} vigilante(s) com horas extras</span>
            </div>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar vigilante..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Todas">Todas as empresas</option>
              {EMPRESAS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Carregando folha...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">
                {vigilantes.length === 0
                  ? 'Nenhum vigilante na folha ainda.'
                  : 'Nenhum resultado encontrado.'}
              </p>
              {vigilantes.length === 0 && (
                <p className="text-slate-400 text-sm">
                  Clique em "+ Adicionar Vigilante" para incluir o efetivo na folha deste mês.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Vigilante / Posto</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Salário Base</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Proventos</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Descontos</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Líquido</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Custo Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(v => (
                  <LinhaFolha key={v.id} v={v} onEditar={() => { setEditando(v); setModalAberto(true); }} />
                ))}
              </tbody>
              {/* Totais */}
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-3 text-sm font-black text-slate-700">
                    Total — {filtrados.length} vigilantes
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-black text-emerald-600">{fmt(totais.proventos)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-500">-{fmt(totais.descontos)}</td>
                  <td className="px-4 py-3 text-right text-sm font-black text-slate-900">{fmt(totais.liquido)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">{fmt(totais.custo)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 mb-1">Cálculos automáticos aplicados</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adicional noturno (20%) aplicado automaticamente para turnos noturnos e 24h.
            INSS empregado (9%), FGTS (8%) e INSS patronal (20%) calculados sobre o salário.
            Insalubridade opcional (20% sobre o piso nacional). Horas extras com acréscimo de 50% ou 100%.
            Os valores são referência — consulte sempre o departamento jurídico/RH para validação final.
          </p>
        </div>
      </div>

      {modalAberto && (
        <ModalVigilante
          inicial={editando}
          onClose={() => { setModalAberto(false); setEditando(undefined); }}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}
