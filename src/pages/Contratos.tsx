import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText, Search, Plus, Building2, DollarSign,
  Users, ShieldCheck, Briefcase, Leaf, X,
  RefreshCw, CheckCircle2, AlertTriangle, Clock, Zap,
  Play, Check, Ban, RotateCcw, TrendingUp, BarChart3,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';

// ─── Constantes ────────────────────────────────────────────────────────────

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];
const TIPOS_SERVICO = ['Vigilância', 'Limpeza', 'Jardinagem', 'Portaria', 'Monitoramento', 'Prevenção de Perdas', 'Multi-serviço'];

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Contrato {
  id: string;
  cliente: string;
  cnpj?: string;
  empresa: string;
  tipo: string;
  profissionais: number;
  faturamento: number;
  custo_mo: number;
  custo_uniforme: number;
  custo_transporte: number;
  custo_admin: number;
  dia_faturamento: number;
  data_inicio: string;
  data_fim?: string;
  status: string;
  ativo: boolean;
}

interface FormContrato {
  cliente: string;
  cnpj: string;
  empresa: string;
  tipo: string;
  profissionais: string;
  faturamento: string;
  custo_mo: string;
  custo_uniforme: string;
  custo_transporte: string;
  custo_admin: string;
  dia_faturamento: string;
  data_inicio: string;
  data_fim: string;
}

const FORM_VAZIO: FormContrato = {
  cliente: '', cnpj: '', empresa: '', tipo: 'Vigilância',
  profissionais: '', faturamento: '',
  custo_mo: '', custo_uniforme: '', custo_transporte: '', custo_admin: '',
  dia_faturamento: '1', data_inicio: '', data_fim: '',
};

// ─── Calculadora de rentabilidade (preview no form) ────────────────────────

function PreviewRentabilidade({ form }: { form: FormContrato }) {
  const fat   = parseFloat(form.faturamento) || 0;
  const mo    = parseFloat(form.custo_mo) || 0;
  const uni   = parseFloat(form.custo_uniforme) || 0;
  const tra   = parseFloat(form.custo_transporte) || 0;
  const adm   = parseFloat(form.custo_admin) || 0;
  const custo = mo + uni + tra + adm;
  const lucro = fat - custo;
  const margem = fat > 0 ? (lucro / fat) * 100 : 0;

  if (fat === 0) return null;

  const cor = margem >= 25 ? 'emerald' : margem >= 15 ? 'amber' : margem >= 0 ? 'orange' : 'red';
  const corMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    orange:  'bg-orange-50 border-orange-200 text-orange-700',
    red:     'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`rounded-xl border p-4 ${corMap[cor]}`}>
      <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5" /> Preview de Rentabilidade
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs opacity-70">Custo Total</p>
          <p className="text-sm font-bold">{fmt(custo)}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Lucro</p>
          <p className="text-sm font-bold">{fmt(lucro)}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Margem</p>
          <p className="text-sm font-bold">{fmtPct(margem)}</p>
        </div>
      </div>
      {margem < 15 && fat > 0 && (
        <p className="text-xs mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          {margem < 0 ? 'Atenção: contrato em prejuízo!' : 'Margem abaixo do mínimo recomendado (15%)'}
        </p>
      )}
    </div>
  );
}

// ─── Modal Novo Contrato ───────────────────────────────────────────────────

function ModalNovoContrato({ onClose, onSalvo }: { onClose: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState<FormContrato>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [showCustos, setShowCustos] = useState(true);

  function set(campo: keyof FormContrato, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  // Sugestão automática de custo MO (70% do faturamento como padrão do setor)
  useEffect(() => {
    const fat = parseFloat(form.faturamento);
    if (fat > 0 && !form.custo_mo) {
      set('custo_mo', (fat * 0.70).toFixed(2));
      set('custo_uniforme', (fat * 0.015).toFixed(2));
      set('custo_transporte', (fat * 0.03).toFixed(2));
      set('custo_admin', (fat * 0.05).toFixed(2));
    }
  }, [form.faturamento]);

  async function salvar() {
    if (!form.cliente || !form.empresa || !form.faturamento || !form.data_inicio) {
      setErro('Preencha: cliente, empresa, faturamento e data de início.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        cliente:          form.cliente,
        cnpj:             form.cnpj || null,
        empresa:          form.empresa,
        tipo:             form.tipo,
        profissionais:    parseInt(form.profissionais) || 0,
        faturamento:      parseFloat(form.faturamento) || 0,
        custo_mo:         parseFloat(form.custo_mo) || 0,
        custo_uniforme:   parseFloat(form.custo_uniforme) || 0,
        custo_transporte: parseFloat(form.custo_transporte) || 0,
        custo_admin:      parseFloat(form.custo_admin) || 0,
        dia_faturamento:  parseInt(form.dia_faturamento) || 1,
        data_inicio:      form.data_inicio,
        data_fim:         form.data_fim || null,
        status:           'ATIVO',
        ativo:            true,
      };

      const { error } = await supabase
        .from('contratos_rentabilidade')
        .insert(payload);

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Novo Contrato" maxWidth="max-w-2xl">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

        {/* Dados básicos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Cliente *</label>
            <input type="text" placeholder="Nome do cliente ou empresa"
              value={form.cliente} onChange={e => set('cliente', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
            <input type="text" placeholder="00.000.000/0001-00"
              value={form.cnpj} onChange={e => set('cnpj', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Empresa do Grupo *</label>
            <select value={form.empresa} onChange={e => set('empresa', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Selecione...</option>
              {EMPRESAS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Serviço</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              {TIPOS_SERVICO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Profissionais Alocados</label>
            <input type="number" placeholder="0" min="0"
              value={form.profissionais} onChange={e => set('profissionais', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        {/* Faturamento */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Faturamento Mensal (R$) *</label>
            <input type="number" placeholder="0,00" min="0" step="0.01"
              value={form.faturamento} onChange={e => set('faturamento', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Data Início *</label>
            <input type="date"
              value={form.data_inicio} onChange={e => set('data_inicio', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Dia de Faturamento</label>
            <select value={form.dia_faturamento} onChange={e => set('dia_faturamento', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              {[1,5,10,15,20,25,30].map(d => <option key={d} value={d}>Dia {d}</option>)}
            </select>
          </div>
        </div>

        {/* Custos — seção colapsável */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <button type="button" onClick={() => setShowCustos(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
            style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Custos Operacionais</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" /> Preenchidos automaticamente — ajuste se necessário
              </span>
            </div>
            {showCustos ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showCustos && (
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Mão de Obra — Salário + Encargos (R$)</label>
                <input type="number" placeholder="0,00" min="0" step="0.01"
                  value={form.custo_mo} onChange={e => set('custo_mo', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Uniformes e EPIs (R$)</label>
                <input type="number" placeholder="0,00" min="0" step="0.01"
                  value={form.custo_uniforme} onChange={e => set('custo_uniforme', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Transporte (R$)</label>
                <input type="number" placeholder="0,00" min="0" step="0.01"
                  value={form.custo_transporte} onChange={e => set('custo_transporte', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Rateio Administrativo (R$)</label>
                <input type="number" placeholder="0,00" min="0" step="0.01"
                  value={form.custo_admin} onChange={e => set('custo_admin', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          )}
        </div>

        {/* Preview rentabilidade */}
        <PreviewRentabilidade form={form} />

        {erro && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button type="button" onClick={salvar} disabled={salvando}
            style={{ cursor: 'pointer' }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
            {salvando ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Contrato'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Aba Contratos ─────────────────────────────────────────────────────────

function TabContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('TODAS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar() {
    setLoading(true);
    const { data } = await supabase
      .from('contratos_rentabilidade')
      .select('*')
      .order('faturamento', { ascending: false });
    setContratos(data ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtrados = contratos.filter(c => {
    const matchBusca   = c.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchEmpresa = filtroEmpresa === 'TODAS' || c.empresa === filtroEmpresa;
    const matchStatus  = filtroStatus  === 'TODOS' || c.status  === filtroStatus;
    return matchBusca && matchEmpresa && matchStatus;
  });

  const ativos       = contratos.filter(c => c.ativo);
  const receitaMensal = ativos.reduce((s, c) => s + c.faturamento, 0);
  const totalProfs    = ativos.reduce((s, c) => s + c.profissionais, 0);

  function calcMargem(c: Contrato) {
    const custo = c.custo_mo + c.custo_uniforme + c.custo_transporte + c.custo_admin;
    const lucro = c.faturamento - custo;
    return c.faturamento > 0 ? (lucro / c.faturamento) * 100 : 0;
  }

  function corMargem(m: number) {
    if (m >= 25) return 'text-emerald-600';
    if (m >= 15) return 'text-amber-600';
    if (m >= 0)  return 'text-orange-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Contratos Ativos',         value: String(ativos.length),  icon: FileText,   bg: 'bg-emerald-50', cor: 'text-emerald-600' },
          { label: 'Receita Contratada (Mês)', value: fmt(receitaMensal),     icon: DollarSign, bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Profissionais Alocados',   value: String(totalProfs),     icon: Users,      bg: 'bg-purple-50',  cor: 'text-purple-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.bg} flex-shrink-0`}><Icon className={`w-5 h-5 ${item.cor}`} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{item.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar cliente..."
                value={busca} onChange={e => setBusca(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODOS">Todos os status</option>
              <option value="ATIVO">Ativos</option>
              <option value="PAUSADO">Pausados</option>
              <option value="FINALIZADO">Finalizados</option>
            </select>
            <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODAS">Todas as empresas</option>
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button onClick={() => setModalAberto(true)}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Novo Contrato
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Carregando contratos...</div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                {contratos.length === 0
                  ? 'Nenhum contrato cadastrado ainda. Clique em "+ Novo Contrato" para começar.'
                  : 'Nenhum contrato encontrado com os filtros selecionados.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {['Cliente', 'Empresa', 'Tipo', 'Profissionais', 'Faturamento', 'Margem', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(c => {
                  const margem = calcMargem(c);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{c.cliente}</p>
                            {c.cnpj && <p className="text-[10px] text-gray-400">{c.cnpj}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">{c.empresa}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{c.tipo}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 text-center">{c.profissionais}</td>
                      <td className="px-5 py-4 font-black text-slate-900 text-sm">{fmt(c.faturamento)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${corMargem(margem)}`}>
                          {fmtPct(margem)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                          c.status === 'ATIVO'      ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          c.status === 'FINALIZADO' ? "bg-gray-50 text-gray-600 border-gray-200" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        )}>{c.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAberto && (
        <ModalNovoContrato
          onClose={() => setModalAberto(false)}
          onSalvo={() => { carregar(); }}
        />
      )}
    </div>
  );
}

// ─── Aba Recorrente (faturas mock por enquanto) ────────────────────────────

type FaturaRecorrente = {
  id: string; contrato_id: string; cliente: string; empresa: string;
  valor: number; competencia: string; vencimento: string;
  status: 'pendente' | 'gerada' | 'cancelada' | 'enviada'; nf: string;
};

function getStatusFatura(s: FaturaRecorrente['status']) {
  if (s === 'gerada')    return { label: 'Gerada',    cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (s === 'enviada')   return { label: 'Enviada',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (s === 'cancelada') return { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-200' };
  return                        { label: 'Pendente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' };
}

function TabRecorrente() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [faturas, setFaturas] = useState<FaturaRecorrente[]>([]);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [gerando, setGerando] = useState(false);

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 2 + i);
    return { value: d.toISOString().slice(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
  });

  useEffect(() => {
    supabase.from('contratos_rentabilidade').select('*').eq('ativo', true)
      .then(({ data }) => {
        const list = data ?? [];
        setContratos(list);
        gerarFaturas(list, mes);
      });
  }, []);

  function gerarFaturas(list: Contrato[], m: string) {
    const [ano, mm] = m.split('-').map(Number);
    const proxMes = mm === 12 ? 1 : mm + 1;
    const proxAno = mm === 12 ? ano + 1 : ano;
    setFaturas(list.map((c, i) => ({
      id: `fat-${c.id}-${m}`,
      contrato_id: c.id,
      cliente: c.cliente,
      empresa: c.empresa,
      valor: c.faturamento,
      competencia: `${String(mm).padStart(2,'0')}/${ano}`,
      vencimento: `${String(c.dia_faturamento).padStart(2,'0')}/${String(proxMes).padStart(2,'0')}/${proxAno}`,
      status: i % 3 === 0 ? 'gerada' : 'pendente',
      nf: i % 3 === 0 ? `NF-${3240 + i}` : '—',
    })));
    setSelecionadas(new Set());
  }

  function mudarMes(novoMes: string) {
    setMes(novoMes);
    gerarFaturas(contratos, novoMes);
  }

  async function gerarTodas() {
    setGerando(true);
    await new Promise(r => setTimeout(r, 1000));
    setFaturas(prev => prev.map(f => f.status === 'pendente' ? { ...f, status: 'gerada' } : f));
    setGerando(false);
  }

  function acao(ids: string[], status: FaturaRecorrente['status']) {
    setFaturas(prev => prev.map(f => ids.includes(f.id) ? { ...f, status } : f));
    setSelecionadas(new Set());
  }

  const pendentes = faturas.filter(f => f.status === 'pendente').length;
  const geradas   = faturas.filter(f => f.status === 'gerada').length;
  const enviadas  = faturas.filter(f => f.status === 'enviada').length;
  const totalMes  = faturas.reduce((a, f) => a + f.valor, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-emerald-500 rounded-xl shrink-0"><RefreshCw className="w-6 h-6 text-white" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-emerald-800 text-sm">Faturamento Recorrente Automático</p>
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">AUTO</span>
          </div>
          <p className="text-emerald-700 text-xs">
            Baseado nos {contratos.length} contratos ativos — gera as faturas do mês com 1 clique.
            Total contratado: <strong>{fmt(contratos.reduce((a,c) => a + c.faturamento, 0))}/mês</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <select value={mes} onChange={e => mudarMes(e.target.value)}
            className="text-sm font-semibold border border-emerald-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={gerarTodas} disabled={gerando || pendentes === 0}
            style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {gerando
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Gerando...</>
              : <><Zap className="w-4 h-4" /> Gerar {pendentes} fatura{pendentes !== 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total do mês', value: fmt(totalMes),     icon: DollarSign,   bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Pendentes',    value: String(pendentes), icon: Clock,        bg: 'bg-amber-50',   cor: 'text-amber-600' },
          { label: 'Geradas',      value: String(geradas),   icon: CheckCircle2, bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Enviadas/NF',  value: String(enviadas),  icon: FileText,     bg: 'bg-emerald-50', cor: 'text-emerald-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${item.bg}`}>
                <Icon className={`w-4 h-4 ${item.cor}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {faturas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-medium">Nenhum contrato ativo para gerar faturas</p>
          <p className="text-slate-400 text-xs mt-1">Cadastre contratos na aba "Contratos" primeiro</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Faturas — {meses.find(m2 => m2.value === mes)?.label}</p>
            <p className="text-xs text-slate-500">{faturas.length} faturas • {fmt(totalMes)}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Competência</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vencimento</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map(f => {
                const st = getStatusFatura(f.status);
                return (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{f.cliente}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">{f.empresa}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{f.competencia}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{f.vencimento}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(f.valor)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {f.status === 'pendente' && <button onClick={() => acao([f.id], 'gerada')} style={{cursor:'pointer'}} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Play className="w-3.5 h-3.5" /></button>}
                        {f.status === 'gerada'   && <button onClick={() => acao([f.id], 'enviada')} style={{cursor:'pointer'}} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"><Check className="w-3.5 h-3.5" /></button>}
                        {f.status === 'cancelada'&& <button onClick={() => acao([f.id], 'pendente')} style={{cursor:'pointer'}} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"><RotateCcw className="w-3.5 h-3.5" /></button>}
                        {f.status !== 'cancelada'&& <button onClick={() => acao([f.id], 'cancelada')} style={{cursor:'pointer'}} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Ban className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function Contratos() {
  const [aba, setAba] = useState<'contratos' | 'recorrente'>('contratos');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <FileText className="text-white w-5 h-5" />
            </div>
            Gestão de Contratos
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Contratos, custos e faturamento recorrente integrados.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl w-fit">
        {[
          { id: 'contratos',  label: 'Contratos',  icon: FileText },
          { id: 'recorrente', label: 'Recorrente', icon: RefreshCw },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setAba(t.id as any)}
              style={{ cursor: 'pointer' }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                aba === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {aba === 'contratos'  && <TabContratos />}
      {aba === 'recorrente' && <TabRecorrente />}
    </div>
  );
}
