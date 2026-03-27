import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, FileText, ChevronDown, ChevronUp,
  AlertTriangle, Clock, Search, Filter, Calculator, TrendingUp,
  X, Plus, Shield, Briefcase, UserCog, Truck, Building2,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Constantes ─────────────────────────────────────────────────────────────

const PISO_VIGILANTE   = 2850.00;
const ADICIONAL_NOTURNO = 0.20;
const HORA_EXTRA_50    = 1.50;
const HORA_EXTRA_100   = 2.00;
const INSS_EMPREGADO   = 0.09;
const FGTS             = 0.08;
const INSS_PATRONAL    = 0.20;
const INSALUBRIDADE    = 0.20;

const TURNO_HORAS: Record<string, number> = {
  '12x36 D': 12, '12x36 N': 12, '8h D': 8, '6h D': 6,
  '24h': 24, 'Comercial 8h': 8, 'Meio período': 4,
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Modelos de funcionário ──────────────────────────────────────────────────

interface ModeloFuncionario {
  id: string;
  label: string;
  icon: React.ElementType;
  cor: string;
  descricao: string;
  cargo: string;
  turno: string;
  salario_base: number;
  insalubre: boolean;
  dias_trabalhados: number;
}

const MODELOS: ModeloFuncionario[] = [
  {
    id: 'vigilante',
    label: 'Vigilante',
    icon: Shield,
    cor: 'bg-blue-50 text-blue-700 border-blue-200',
    descricao: 'Escala 12x36, adicional noturno, insalubridade opcional',
    cargo: 'Vigilante',
    turno: '12x36 D',
    salario_base: PISO_VIGILANTE,
    insalubre: false,
    dias_trabalhados: 15,
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    icon: UserCog,
    cor: 'bg-purple-50 text-purple-700 border-purple-200',
    descricao: 'Horário comercial, salário diferenciado',
    cargo: 'Supervisor Operacional',
    turno: 'Comercial 8h',
    salario_base: 4500.00,
    insalubre: false,
    dias_trabalhados: 22,
  },
  {
    id: 'administrativo',
    label: 'Administrativo',
    icon: Briefcase,
    cor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    descricao: 'Escritório, horário comercial',
    cargo: 'Assistente Administrativo',
    turno: 'Comercial 8h',
    salario_base: 2500.00,
    insalubre: false,
    dias_trabalhados: 22,
  },
  {
    id: 'facilities',
    label: 'Facilities',
    icon: Building2,
    cor: 'bg-amber-50 text-amber-700 border-amber-200',
    descricao: 'Limpeza, manutenção, portaria',
    cargo: 'Auxiliar de Facilities',
    turno: '8h D',
    salario_base: 1800.00,
    insalubre: true,
    dias_trabalhados: 22,
  },
  {
    id: 'motorista',
    label: 'Motorista',
    icon: Truck,
    cor: 'bg-orange-50 text-orange-700 border-orange-200',
    descricao: 'Frota, transporte de equipe',
    cargo: 'Motorista',
    turno: '8h D',
    salario_base: 2800.00,
    insalubre: false,
    dias_trabalhados: 22,
  },
];

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];
const TURNOS   = ['12x36 D', '12x36 N', '8h D', '6h D', '24h', 'Comercial 8h', 'Meio período'];

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Funcionario {
  id: string;
  nome: string;
  cpf?: string;
  cargo: string;
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

interface FormFuncionario {
  nome: string; cpf: string; cargo: string; posto: string;
  empresa: string; turno: string; salario_base: string;
  insalubre: boolean; dias_trabalhados: string;
  horas_extras_50: string; horas_extras_100: string; faltas: string;
}

// ─── Cálculo da folha ────────────────────────────────────────────────────────

function calcularFolha(v: Funcionario) {
  const horasTurno = TURNO_HORAS[v.turno] ?? 8;
  const diasMes    = 30;
  const horasMes   = v.turno.includes('36') ? 15 * horasTurno : 22 * horasTurno;
  const valorHora  = v.salario_base / horasMes;

  const salarioProp  = v.dias_trabalhados > 0
    ? (v.salario_base / diasMes) * v.dias_trabalhados
    : v.salario_base;

  const adicNoturno   = v.turno.includes('N') || v.turno === '24h' ? salarioProp * ADICIONAL_NOTURNO : 0;
  const horaExtra50   = v.horas_extras_50  * valorHora * HORA_EXTRA_50;
  const horaExtra100  = v.horas_extras_100 * valorHora * HORA_EXTRA_100;
  const insalubridade = v.insalubre ? (PISO_VIGILANTE * INSALUBRIDADE) : 0;

  const totalProventos = salarioProp + adicNoturno + horaExtra50 + horaExtra100 + insalubridade;
  const descontoFalta  = v.faltas > 0 ? (v.salario_base / diasMes) * v.faltas : 0;
  const descontoINSS   = totalProventos * INSS_EMPREGADO;
  const totalDescontos = descontoFalta + descontoINSS;
  const liquido        = totalProventos - totalDescontos;
  const fgts           = salarioProp * FGTS;
  const inssPatronal   = salarioProp * INSS_PATRONAL;
  const custoTotal     = liquido + fgts + inssPatronal;

  return { salarioProp, adicNoturno, horaExtra50, horaExtra100, insalubridade,
    totalProventos, descontoFalta, descontoINSS, totalDescontos,
    liquido, fgts, inssPatronal, custoTotal, valorHora, horasMes };
}

// ─── Seletor de modelo ───────────────────────────────────────────────────────

function SeletorModelo({ onSelecionar }: { onSelecionar: (m: ModeloFuncionario) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Selecione o tipo de funcionário</h2>
          <p className="text-xs text-slate-500 mt-1">Cada modelo já vem pré-configurado com cargo, turno e salário base do setor</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODELOS.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => onSelecionar(m)} style={{ cursor: 'pointer' }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left hover:shadow-md transition-all ${m.cor}`}>
                <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.descricao}</p>
                  <p className="text-xs font-semibold mt-1">{fmt(m.salario_base)} · {m.turno}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-auto" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Modal funcionário ───────────────────────────────────────────────────────

function ModalFuncionario({ modelo, inicial, onClose, onSalvo }: {
  modelo: ModeloFuncionario;
  inicial?: Funcionario;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [form, setForm] = useState<FormFuncionario>(
    inicial ? {
      nome: inicial.nome, cpf: inicial.cpf ?? '', cargo: inicial.cargo,
      posto: inicial.posto, empresa: inicial.empresa, turno: inicial.turno,
      salario_base: String(inicial.salario_base), insalubre: inicial.insalubre,
      dias_trabalhados: String(inicial.dias_trabalhados),
      horas_extras_50: String(inicial.horas_extras_50),
      horas_extras_100: String(inicial.horas_extras_100),
      faltas: String(inicial.faltas),
    } : {
      nome: '', cpf: '', cargo: modelo.cargo, posto: '', empresa: 'Vigilância',
      turno: modelo.turno, salario_base: String(modelo.salario_base),
      insalubre: modelo.insalubre, dias_trabalhados: String(modelo.dias_trabalhados),
      horas_extras_50: '0', horas_extras_100: '0', faltas: '0',
    }
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function set(campo: keyof FormFuncionario, valor: string | boolean) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  const vPreview: Funcionario = {
    id: '', nome: form.nome, cargo: form.cargo, posto: form.posto,
    empresa: form.empresa, turno: form.turno,
    salario_base: parseFloat(form.salario_base) || 0,
    insalubre: form.insalubre,
    dias_trabalhados: parseInt(form.dias_trabalhados) || 0,
    horas_extras_50: parseFloat(form.horas_extras_50) || 0,
    horas_extras_100: parseFloat(form.horas_extras_100) || 0,
    faltas: parseInt(form.faltas) || 0,
    status: 'ativo',
  };
  const calc = calcularFolha(vPreview);

  const Icon = modelo.icon;

  async function salvar() {
    if (!form.nome || !form.posto || !form.empresa) {
      setErro('Preencha nome, posto/setor e empresa.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        nome: form.nome, cpf: form.cpf || null, cargo: form.cargo,
        posto: form.posto, empresa: form.empresa, turno: form.turno,
        salario_base: parseFloat(form.salario_base) || modelo.salario_base,
        insalubre: form.insalubre,
        dias_trabalhados: parseInt(form.dias_trabalhados) || modelo.dias_trabalhados,
        horas_extras_50: parseFloat(form.horas_extras_50) || 0,
        horas_extras_100: parseFloat(form.horas_extras_100) || 0,
        faltas: parseInt(form.faltas) || 0,
        status: 'ativo',
      };

      if (inicial?.id) {
        const { error } = await supabase.from('folha_pagamento').update(payload).eq('id', inicial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('folha_pagamento').insert(payload);
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
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 ${modelo.cor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {inicial ? 'Editar' : 'Novo'} — {modelo.label}
              </h2>
              <p className="text-xs text-slate-400">{modelo.descricao}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo *</label>
              <input type="text" value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Nome do funcionário"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">CPF</label>
              <input type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cargo</label>
              <input type="text" value={form.cargo} onChange={e => set('cargo', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                {modelo.id === 'administrativo' || modelo.id === 'supervisor' ? 'Setor / Departamento' : 'Posto'} *
              </label>
              <input type="text" value={form.posto} onChange={e => set('posto', e.target.value)}
                placeholder={modelo.id === 'administrativo' ? 'Ex: Financeiro, RH...' : 'Nome do posto'}
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
              <label className="text-xs font-bold text-gray-500 uppercase">Turno / Jornada</label>
              <select value={form.turno} onChange={e => set('turno', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                {TURNOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Salário Base (R$)</label>
              <input type="number" value={form.salario_base} onChange={e => set('salario_base', e.target.value)}
                min="0" step="0.01"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Dias Trabalhados</label>
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
              <label className="text-xs font-bold text-gray-500 uppercase">HE 100% (horas)</label>
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
              <label className="flex items-center gap-2 cursor-pointer py-2.5">
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

          {erro && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="button" onClick={salvar} disabled={salvando} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-2">
              {salvando ? 'Salvando...' : inicial ? 'Salvar Alterações' : `Adicionar ${modelo.label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Linha da tabela ─────────────────────────────────────────────────────────

function LinhaFolha({ v, onEditar }: { v: Funcionario; onEditar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const calc = calcularFolha(v);

  const modeloCor = MODELOS.find(m => m.cargo === v.cargo)?.cor ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const ModeloIcon = MODELOS.find(m => m.cargo === v.cargo)?.icon ?? Shield;

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition" onClick={() => setAberto(a => !a)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 ${modeloCor}`}>
              <ModeloIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{v.nome}</p>
              <p className="text-xs text-slate-400">{v.cargo} · {v.posto}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{v.empresa}</span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 text-right">{fmt(v.salario_base)}</td>
        <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-emerald-600">{fmt(calc.totalProventos)}</span></td>
        <td className="px-4 py-3 text-right"><span className="text-sm text-red-500">-{fmt(calc.totalDescontos)}</span></td>
        <td className="px-4 py-3 text-right"><span className="text-sm font-black text-slate-900">{fmt(calc.liquido)}</span></td>
        <td className="px-4 py-3 text-right"><span className="text-xs text-slate-500">{fmt(calc.custoTotal)}</span></td>
        <td className="px-4 py-3 text-center text-slate-400">
          {aberto ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
        </td>
      </tr>

      {aberto && (
        <tr className="bg-slate-50 border-b border-slate-200">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Proventos</p>
                <div className="space-y-2">
                  {[
                    { label: 'Salário Proporcional', valor: calc.salarioProp },
                    { label: 'Adicional Noturno',    valor: calc.adicNoturno },
                    { label: `HE 50% (${v.horas_extras_50}h)`, valor: calc.horaExtra50 },
                    { label: `HE 100% (${v.horas_extras_100}h)`, valor: calc.horaExtra100 },
                    { label: 'Insalubridade',        valor: calc.insalubridade },
                  ].map(item => item.valor > 0 && (
                    <div key={item.label} className="flex justify-between text-xs">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-emerald-600">{fmt(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-700">Total</span>
                    <span className="font-bold text-emerald-600">{fmt(calc.totalProventos)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Descontos</p>
                <div className="space-y-2">
                  {calc.descontoFalta > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Falta(s) ({v.faltas}d)</span>
                      <span className="font-semibold text-red-500">-{fmt(calc.descontoFalta)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">INSS (9%)</span>
                    <span className="font-semibold text-red-500">-{fmt(calc.descontoINSS)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-700">Total</span>
                    <span className="font-bold text-red-500">-{fmt(calc.totalDescontos)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t-2 border-slate-300 pt-2">
                    <span className="font-black text-slate-900">Líquido</span>
                    <span className="font-black text-slate-900">{fmt(calc.liquido)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Encargos Empregador</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">FGTS (8%)</span>
                    <span className="font-semibold text-orange-600">{fmt(calc.fgts)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">INSS Patronal (20%)</span>
                    <span className="font-semibold text-orange-600">{fmt(calc.inssPatronal)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-700">Custo Total</span>
                    <span className="font-bold text-orange-600">{fmt(calc.custoTotal)}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onEditar(); }} style={{ cursor: 'pointer' }}
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

// ─── Página principal ─────────────────────────────────────────────────────────

export function FolhaPagamento() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [busca, setBusca] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [filtroCargo, setFiltroCargo] = useState('Todos');
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloFuncionario | null>(null);
  const [editando, setEditando] = useState<Funcionario | undefined>(undefined);

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 2 + i);
    return { value: d.toISOString().slice(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
  });

  async function carregar() {
    setLoading(true);
    const { data } = await supabase.from('folha_pagamento').select('*').order('nome');
    setFuncionarios(data ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirEdicao(f: Funcionario) {
    const modelo = MODELOS.find(m => m.id === f.cargo?.toLowerCase()) ??
                   MODELOS.find(m => m.cargo === f.cargo) ??
                   MODELOS[0];
    setModeloSelecionado(modelo);
    setEditando(f);
  }

  const filtrados = funcionarios.filter(f =>
    (filtroEmpresa === 'Todas' || f.empresa === filtroEmpresa) &&
    (filtroCargo   === 'Todos' || f.cargo === filtroCargo) &&
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totais = filtrados.reduce((acc, f) => {
    const c = calcularFolha(f);
    return {
      proventos: acc.proventos + c.totalProventos,
      descontos: acc.descontos + c.totalDescontos,
      liquido:   acc.liquido   + c.liquido,
      custo:     acc.custo     + c.custoTotal,
    };
  }, { proventos: 0, descontos: 0, liquido: 0, custo: 0 });

  const comFalta  = filtrados.filter(f => f.faltas > 0).length;
  const comHExtra = filtrados.filter(f => f.horas_extras_50 > 0 || f.horas_extras_100 > 0).length;

  // Cargos disponíveis para filtro
  const cargos = ['Todos', ...Array.from(new Set(funcionarios.map(f => f.cargo).filter(Boolean)))];

  // Contagem por tipo
  const porTipo = MODELOS.map(m => ({
    ...m,
    count: funcionarios.filter(f => f.cargo === m.cargo).length,
  }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Folha de Pagamento</h1>
          <p className="text-sm text-slate-500 mt-1">Cálculo automático de todo o efetivo — Grupo Esquematiza</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={mes} onChange={e => setMes(e.target.value)}
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={() => setSeletorAberto(true)} style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Adicionar Funcionário
          </button>
        </div>
      </div>

      {/* Cards de tipo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {porTipo.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setFiltroCargo(filtroCargo === m.cargo ? 'Todos' : m.cargo)}
              style={{ cursor: 'pointer' }}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                filtroCargo === m.cargo ? m.cor + ' shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${m.cor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-800">{m.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{m.count}</p>
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total na Folha', value: String(filtrados.length), sub: `${comFalta} com falta · ${comHExtra} com HE`, icon: Users,       cor: 'bg-blue-50 text-blue-600' },
          { title: 'Total Proventos', value: fmt(totais.proventos),   sub: 'bruto antes de descontos',                    icon: TrendingUp,   cor: 'bg-emerald-50 text-emerald-600' },
          { title: 'Total Líquido',  value: fmt(totais.liquido),      sub: 'a depositar em conta',                        icon: DollarSign,   cor: 'bg-purple-50 text-purple-600' },
          { title: 'Custo Empresa',  value: fmt(totais.custo),        sub: 'incluindo FGTS e INSS',                       icon: Calculator,   cor: 'bg-orange-50 text-orange-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${item.cor}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas */}
      {(comFalta > 0 || comHExtra > 0) && (
        <div className="flex flex-wrap gap-3">
          {comFalta > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">{comFalta} funcionário(s) com falta</span>
            </div>
          )}
          {comHExtra > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">{comHExtra} com horas extras</span>
            </div>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar funcionário..."
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
            <select value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              {cargos.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Carregando folha...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">
                {funcionarios.length === 0 ? 'Nenhum funcionário na folha ainda.' : 'Nenhum resultado encontrado.'}
              </p>
              {funcionarios.length === 0 && (
                <p className="text-slate-400 text-sm">Clique em "+ Adicionar Funcionário" e escolha o tipo.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Funcionário / Cargo</th>
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
                {filtrados.map(f => (
                  <LinhaFolha key={f.id} v={f} onEditar={() => abrirEdicao(f)} />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-3 text-sm font-black text-slate-700">
                    Total — {filtrados.length} funcionários
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

      {/* SQL para adicionar coluna cargo se necessário */}
      {seletorAberto && (
        <SeletorModelo
          onSelecionar={m => { setModeloSelecionado(m); setSeletorAberto(false); }}
        />
      )}

      {modeloSelecionado && !seletorAberto && (
        <ModalFuncionario
          modelo={modeloSelecionado}
          inicial={editando}
          onClose={() => { setModeloSelecionado(null); setEditando(undefined); }}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}
