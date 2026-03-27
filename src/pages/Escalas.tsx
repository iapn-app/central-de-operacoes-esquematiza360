import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Users, UserMinus,
  ArrowLeftRight, CheckCircle2, AlertTriangle, Clock, Search,
  UserPlus, Shield, MapPin, X, RefreshCw, TrendingDown,
  FileText, Link, Zap, Bell,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type StatusTurno = 'presente' | 'falta' | 'troca_pendente' | 'vago' | 'folga';

interface Vigilante {
  id: string;
  nome: string;
  posto: string;
  empresa: string;
  turno: string;
  salario_base: number;
  faltas: number;
  horas_extras_50: number;
  horas_extras_100: number;
}

interface Turno {
  id: string;
  vigilante_id: string | null;
  vigilante_nome: string;
  posto: string;
  empresa: string;
  horario: string;
  tipo_turno: string;
  status: StatusTurno;
  data: string;
  observacao: string | null;
}

interface OcorrenciaEscala {
  id: string;
  tipo: 'falta' | 'troca' | 'hora_extra' | 'vago';
  vigilante_nome: string;
  posto: string;
  data: string;
  impacto_folha: string;
  processado: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Config status ───────────────────────────────────────────────────────────

function statusCfg(s: StatusTurno) {
  return {
    presente:       { label: 'Presente',       bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    falta:          { label: 'Falta',           bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
    troca_pendente: { label: 'Troca Pend.',     bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
    vago:           { label: 'Vago',            bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
    folga:          { label: 'Folga',           bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400' },
  }[s];
}

// ─── Seção de impacto na folha ───────────────────────────────────────────────

function ImpactoFolha({ ocorrencias, onProcessar }: {
  ocorrencias: OcorrenciaEscala[];
  onProcessar: (id: string) => void;
}) {
  const pendentes = ocorrencias.filter(o => !o.processado);
  if (pendentes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="p-2 bg-amber-500 rounded-xl flex-shrink-0">
          <Link className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">
            {pendentes.length} ocorrência(s) da escala impactam a folha de pagamento
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Processe para atualizar automaticamente os dias trabalhados, faltas e horas extras.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">
          {pendentes.length} pendente{pendentes.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="border-t border-amber-200 divide-y divide-amber-100">
        {pendentes.map(o => (
          <div key={o.id} className="px-5 py-3 flex items-center gap-3 bg-white/60">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              o.tipo === 'falta' ? 'bg-red-500' : o.tipo === 'hora_extra' ? 'bg-blue-500' : 'bg-amber-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{o.vigilante_nome}</p>
              <p className="text-xs text-slate-500">{o.posto} · {o.data} · {o.impacto_folha}</p>
            </div>
            <button
              onClick={() => onProcessar(o.id)}
              style={{ cursor: 'pointer' }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition">
              <Zap className="w-3 h-3" /> Processar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card de turno ───────────────────────────────────────────────────────────

function CardTurno({ turno, onMudarStatus }: {
  turno: Turno;
  onMudarStatus: (turnoId: string, novoStatus: StatusTurno) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const cfg = statusCfg(turno.status);

  return (
    <div className={`rounded-xl border p-3 transition ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{turno.vigilante_nome}</p>
            <p className="text-xs text-slate-500">{turno.horario} · {turno.tipo_turno}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
          <button onClick={() => setAberto(a => !a)} style={{ cursor: 'pointer' }}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/70 text-slate-500 transition">
            <span className="text-lg leading-none">⋯</span>
          </button>
        </div>
      </div>

      {aberto && (
        <div className="mt-3 pt-3 border-t border-current/10 grid grid-cols-2 gap-1.5">
          {(['presente', 'falta', 'troca_pendente', 'folga'] as StatusTurno[]).map(s => {
            const c = statusCfg(s);
            return (
              <button key={s} onClick={() => { onMudarStatus(turno.id, s); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border transition ${
                  turno.status === s ? `${c.bg} ${c.text} ${c.border}` : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white'
                }`}>
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Modal lançar ocorrência manual ─────────────────────────────────────────

function ModalOcorrencia({ vigilantes, onClose, onSalvo }: {
  vigilantes: Vigilante[];
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [form, setForm] = useState({
    vigilante_id: '',
    tipo: 'falta' as OcorrenciaEscala['tipo'],
    data: new Date().toISOString().split('T')[0],
    posto: '',
    observacao: '',
    horas: '0',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const vigilante = vigilantes.find(v => v.id === form.vigilante_id);

  function calcImpacto() {
    if (!vigilante) return '—';
    const diasBase = vigilante.salario_base / 30;
    if (form.tipo === 'falta') return `-${fmt(diasBase)} (1 dia descontado)`;
    if (form.tipo === 'hora_extra') {
      const vhora = vigilante.salario_base / 220;
      return `+${fmt(parseFloat(form.horas) * vhora * 1.5)} (HE 50%)`;
    }
    return 'Sem impacto financeiro direto';
  }

  async function salvar() {
    if (!form.vigilante_id || !form.data) { setErro('Selecione o vigilante e a data.'); return; }
    setSalvando(true);
    setErro(null);
    try {
      // Registra a ocorrência
      const { error: errOc } = await supabase.from('ocorrencias_escala').insert({
        vigilante_id:    form.vigilante_id,
        vigilante_nome:  vigilante?.nome ?? '',
        posto:           form.posto || vigilante?.posto || '',
        tipo:            form.tipo,
        data:            form.data,
        impacto_folha:   calcImpacto(),
        processado:      false,
        observacao:      form.observacao || null,
      });
      if (errOc) throw errOc;

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Lançar Ocorrência</h2>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Vigilante *</label>
            <select value={form.vigilante_id} onChange={e => setForm(f => ({ ...f, vigilante_id: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Selecione...</option>
              {vigilantes.map(v => <option key={v.id} value={v.id}>{v.nome} — {v.posto}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo *</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="falta">Falta</option>
                <option value="hora_extra">Hora Extra</option>
                <option value="troca">Troca de Turno</option>
                <option value="vago">Posto Vago</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Data *</label>
              <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          {form.tipo === 'hora_extra' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Horas Extras</label>
              <input type="number" value={form.horas} onChange={e => setForm(f => ({ ...f, horas: e.target.value }))}
                min="0" step="0.5"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Observação</label>
            <input type="text" value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
              placeholder="Motivo, detalhes..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Preview impacto */}
          {form.vigilante_id && (
            <div className={`rounded-xl p-3 border ${
              form.tipo === 'falta' ? 'bg-red-50 border-red-200' :
              form.tipo === 'hora_extra' ? 'bg-blue-50 border-blue-200' :
              'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-xs font-bold text-slate-600 mb-1">Impacto na Folha de Pagamento</p>
              <p className={`text-sm font-bold ${
                form.tipo === 'falta' ? 'text-red-700' :
                form.tipo === 'hora_extra' ? 'text-blue-700' : 'text-slate-700'
              }`}>{calcImpacto()}</p>
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
              {salvando ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</> : 'Lançar Ocorrência'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function Escalas() {
  const [data, setData] = useState(new Date());
  const [vigilantes, setVigilantes] = useState<Vigilante[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaEscala[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOcorrencia, setModalOcorrencia] = useState(false);
  const [loading, setLoading] = useState(true);

  const dataStr = data.toISOString().split('T')[0];
  const dataFmt = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  async function carregar() {
    setLoading(true);

    const [{ data: vigs }, { data: turnsData }, { data: ocData }] = await Promise.all([
      supabase.from('folha_pagamento').select('*').eq('status', 'ativo').order('nome'),
      supabase.from('escala_turnos').select('*').eq('data', dataStr).order('posto'),
      supabase.from('ocorrencias_escala').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    setVigilantes(vigs ?? []);
    setOcorrencias(ocData ?? []);

    // Se não tem turnos no banco ainda, gera a partir da folha
    if (!turnsData || turnsData.length === 0) {
      const turnosGerados: Turno[] = (vigs ?? []).map((v, i) => ({
        id: `gen-${v.id}`,
        vigilante_id: v.id,
        vigilante_nome: v.nome,
        posto: v.posto,
        empresa: v.empresa,
        horario: v.turno.includes('N') ? '19:00 - 07:00' : '07:00 - 19:00',
        tipo_turno: v.turno,
        status: 'presente' as StatusTurno,
        data: dataStr,
        observacao: null,
      }));
      setTurnos(turnosGerados);
    } else {
      setTurnos(turnsData);
    }

    setLoading(false);
  }

  useEffect(() => { carregar(); }, [dataStr]);

  async function mudarStatus(turnoId: string, novoStatus: StatusTurno) {
    setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, status: novoStatus } : t));

    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) return;

    // Salva no banco se é um turno real (não gerado)
    if (!turnoId.startsWith('gen-')) {
      await supabase.from('escala_turnos').update({ status: novoStatus }).eq('id', turnoId);
    }

    // Se virou falta, cria ocorrência para folha automaticamente
    if (novoStatus === 'falta' && turno.vigilante_id) {
      const vig = vigilantes.find(v => v.id === turno.vigilante_id);
      const desconto = vig ? fmt(vig.salario_base / 30) : '—';
      await supabase.from('ocorrencias_escala').insert({
        vigilante_id:   turno.vigilante_id,
        vigilante_nome: turno.vigilante_nome,
        posto:          turno.posto,
        tipo:           'falta',
        data:           dataStr,
        impacto_folha:  `-${desconto} (1 dia descontado)`,
        processado:     false,
      });
      carregar();
    }
  }

  async function processarOcorrencia(ocId: string) {
    const oc = ocorrencias.find(o => o.id === ocId);
    if (!oc) return;

    // Atualiza folha do vigilante
    if (oc.tipo === 'falta') {
      const vig = vigilantes.find(v => v.nome === oc.vigilante_nome);
      if (vig) {
        await supabase.from('folha_pagamento')
          .update({ faltas: (vig.faltas || 0) + 1 })
          .eq('id', vig.id);
      }
    }
    if (oc.tipo === 'hora_extra') {
      const vig = vigilantes.find(v => v.nome === oc.vigilante_nome);
      if (vig) {
        await supabase.from('folha_pagamento')
          .update({ horas_extras_50: (vig.horas_extras_50 || 0) + 4 })
          .eq('id', vig.id);
      }
    }

    // Marca como processado
    await supabase.from('ocorrencias_escala').update({ processado: true }).eq('id', ocId);
    carregar();
  }

  const turnosFiltrados = turnos.filter(t =>
    t.vigilante_nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.posto.toLowerCase().includes(busca.toLowerCase())
  );

  // KPIs do dia
  const presentes    = turnos.filter(t => t.status === 'presente').length;
  const faltas       = turnos.filter(t => t.status === 'falta').length;
  const trocas       = turnos.filter(t => t.status === 'troca_pendente').length;
  const vagos        = turnos.filter(t => t.status === 'vago').length;
  const ocPendentes  = ocorrencias.filter(o => !o.processado).length;

  // Agrupar por posto
  const porPosto: Record<string, Turno[]> = {};
  turnosFiltrados.forEach(t => {
    if (!porPosto[t.posto]) porPosto[t.posto] = [];
    porPosto[t.posto].push(t);
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Gestão de Escalas</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de turnos integrado com folha de pagamento</p>
        </div>
        <div className="flex items-center gap-3">
          {ocPendentes > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{ocPendentes} impacto(s) na folha</span>
            </div>
          )}
          <button onClick={() => setModalOcorrencia(true)} style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Lançar Ocorrência
          </button>
        </div>
      </div>

      {/* Navegação de data */}
      <div className="flex items-center gap-3">
        <button onClick={() => setData(d => { const n = new Date(d); n.setDate(n.getDate()-1); return n; })}
          style={{ cursor: 'pointer' }}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-base font-bold text-slate-900 capitalize">{dataFmt}</p>
        </div>
        <button onClick={() => setData(d => { const n = new Date(d); n.setDate(n.getDate()+1); return n; })}
          style={{ cursor: 'pointer' }}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={() => setData(new Date())} style={{ cursor: 'pointer' }}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition">
          Hoje
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Presentes',  value: presentes, icon: CheckCircle2, cor: 'bg-emerald-50 text-emerald-600' },
          { label: 'Faltas',     value: faltas,    icon: UserMinus,    cor: 'bg-red-50 text-red-600' },
          { label: 'Trocas',     value: trocas,    icon: ArrowLeftRight, cor: 'bg-amber-50 text-amber-600' },
          { label: 'Vagos',      value: vagos,     icon: MapPin,       cor: 'bg-slate-100 text-slate-600' },
          { label: 'Total',      value: turnos.length, icon: Users,    cor: 'bg-blue-50 text-blue-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${item.cor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-xl font-black text-slate-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impacto na folha */}
      <ImpactoFolha ocorrencias={ocorrencias} onProcessar={processarOcorrencia} />

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar vigilante ou posto..."
          value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
      </div>

      {/* Turnos por posto */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">Carregando escala...</div>
      ) : Object.keys(porPosto).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-semibold">Nenhum vigilante na escala ainda</p>
          <p className="text-slate-400 text-sm">
            Cadastre vigilantes em <strong>Folha de Pagamento</strong> para gerar a escala automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(porPosto).map(([posto, ts]) => (
            <div key={posto} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-bold text-slate-800">{posto}</p>
                  <span className="text-xs text-slate-400">({ts.length} turno{ts.length > 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-1">
                  {ts.filter(t => t.status === 'falta').length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                      {ts.filter(t => t.status === 'falta').length} falta
                    </span>
                  )}
                  {ts.filter(t => t.status === 'vago').length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
                      {ts.filter(t => t.status === 'vago').length} vago
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {ts.map(t => (
                  <CardTurno key={t.id} turno={t} onMudarStatus={mudarStatus} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Histórico de ocorrências */}
      {ocorrencias.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Ocorrências</h2>
            <p className="text-xs text-slate-400 mt-0.5">Faltas, trocas e horas extras lançadas</p>
          </div>
          <div className="divide-y divide-slate-100">
            {ocorrencias.slice(0, 10).map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  o.tipo === 'falta' ? 'bg-red-500' : o.tipo === 'hora_extra' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{o.vigilante_nome}</p>
                  <p className="text-xs text-slate-400">{o.posto} · {o.data}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-bold ${o.tipo === 'falta' ? 'text-red-600' : o.tipo === 'hora_extra' ? 'text-blue-600' : 'text-amber-600'}`}>
                    {o.tipo === 'falta' ? 'Falta' : o.tipo === 'hora_extra' ? 'Hora Extra' : 'Troca'}
                  </p>
                  <p className="text-xs text-slate-400">{o.impacto_folha}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.processado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {o.processado ? '✓ Processado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info integração */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Link className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 mb-1">Integração Escala → Folha de Pagamento</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ao marcar um turno como <strong>Falta</strong>, o sistema cria automaticamente uma ocorrência para desconto na folha.
            Ao clicar em <strong>Processar</strong>, o dia é descontado diretamente na folha do vigilante.
            Horas extras lançadas aqui também são transferidas automaticamente para o cálculo da folha.
          </p>
        </div>
      </div>

      {modalOcorrencia && (
        <ModalOcorrencia
          vigilantes={vigilantes}
          onClose={() => setModalOcorrencia(false)}
          onSalvo={carregar}
        />
      )}
    </div>
  );
}
