import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Download, Send, CheckCircle2,
  AlertTriangle, Clock, X, Eye, RefreshCw, Building2, DollarSign,
  Calendar, ChevronDown, ChevronUp, ExternalLink, Copy, Zap,
  FileCheck, FileClock, FileX, BarChart3, TrendingUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Tipos ─────────────────────────────────────────────────────────────────

type TipoNF    = 'NFS-e' | 'NF-e';
type StatusNF  = 'rascunho' | 'aguardando' | 'autorizada' | 'cancelada' | 'rejeitada';

interface NotaFiscal {
  id: string;
  numero: string;
  tipo: TipoNF;
  status: StatusNF;
  cliente: string;
  cnpj_cliente: string;
  empresa_emissora: string;
  descricao_servico: string;
  valor_bruto: number;
  aliquota_iss: number;
  valor_iss: number;
  valor_liquido: number;
  competencia: string;
  data_emissao: string | null;
  data_vencimento: string | null;
  chave_acesso: string | null;
  xml_url: string | null;
  danfe_url: string | null;
  observacoes: string | null;
  contrato_id: string | null;
  created_at: string;
}

interface FormNF {
  tipo: TipoNF;
  cliente: string;
  cnpj_cliente: string;
  empresa_emissora: string;
  descricao_servico: string;
  valor_bruto: string;
  aliquota_iss: string;
  competencia: string;
  data_vencimento: string;
  contrato_id: string;
  observacoes: string;
}

const FORM_VAZIO: FormNF = {
  tipo: 'NFS-e', cliente: '', cnpj_cliente: '', empresa_emissora: 'Vigilância',
  descricao_servico: 'Prestação de serviços de vigilância e segurança patrimonial',
  valor_bruto: '', aliquota_iss: '5', competencia: new Date().toISOString().slice(0, 7),
  data_vencimento: '', contrato_id: '', observacoes: '',
};

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];

const DESCRICOES_PADRAO = [
  'Prestação de serviços de vigilância e segurança patrimonial',
  'Prestação de serviços de monitoramento eletrônico',
  'Prestação de serviços de limpeza e conservação',
  'Prestação de serviços de portaria e recepção',
  'Prestação de serviços de prevenção de perdas',
  'Prestação de serviços de segurança patrimonial',
];

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Config de status ───────────────────────────────────────────────────────

function statusConfig(s: StatusNF) {
  const map = {
    rascunho:   { label: 'Rascunho',    bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-200',   icon: FileClock },
    aguardando: { label: 'Aguardando',  bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock },
    autorizada: { label: 'Autorizada',  bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', icon: FileCheck },
    cancelada:  { label: 'Cancelada',   bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     icon: FileX },
    rejeitada:  { label: 'Rejeitada',   bg: 'bg-rose-50',     text: 'text-rose-700',    border: 'border-rose-200',    icon: AlertTriangle },
  };
  return map[s] ?? map.rascunho;
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, cor }: {
  title: string; value: string; sub: string; icon: React.ElementType; cor: string;
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

// ─── Badge de status ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusNF }) {
  const cfg = statusConfig(status);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// ─── Modal Nova NF ──────────────────────────────────────────────────────────

function ModalNovaNF({ onClose, onSalvo }: { onClose: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState<FormNF>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [contratos, setContratos] = useState<{ id: string; cliente: string; faturamento: number }[]>([]);

  useEffect(() => {
    supabase.from('contratos_rentabilidade').select('id, cliente, faturamento').eq('ativo', true)
      .then(({ data }) => setContratos(data ?? []));
  }, []);

  function set(campo: keyof FormNF, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  // Auto-preenche cliente ao selecionar contrato
  function selecionarContrato(id: string) {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      set('contrato_id', id);
      set('cliente', contrato.cliente);
      set('valor_bruto', String(contrato.faturamento));
    } else {
      set('contrato_id', '');
    }
  }

  const valorBruto  = parseFloat(form.valor_bruto) || 0;
  const aliquota    = parseFloat(form.aliquota_iss) || 0;
  const valorISS    = valorBruto * (aliquota / 100);
  const valorLiq    = valorBruto - valorISS;

  async function salvar(emitir = false) {
    if (!form.cliente || !form.valor_bruto || !form.empresa_emissora) {
      setErro('Preencha cliente, empresa emissora e valor.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        tipo: form.tipo,
        status: emitir ? 'aguardando' : 'rascunho',
        cliente: form.cliente,
        cnpj_cliente: form.cnpj_cliente || null,
        empresa_emissora: form.empresa_emissora,
        descricao_servico: form.descricao_servico,
        valor_bruto: valorBruto,
        aliquota_iss: aliquota,
        valor_iss: valorISS,
        valor_liquido: valorLiq,
        competencia: form.competencia,
        data_emissao: emitir ? new Date().toISOString().split('T')[0] : null,
        data_vencimento: form.data_vencimento || null,
        contrato_id: form.contrato_id || null,
        observacoes: form.observacoes || null,
        numero: `NF-${Date.now().toString().slice(-6)}`,
        chave_acesso: null,
        xml_url: null,
        danfe_url: null,
      };
      const { error } = await supabase.from('notas_fiscais').insert(payload);
      if (error) throw error;
      onSalvo();
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar. Verifique se a tabela foi criada no Supabase.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Nova Nota Fiscal</h2>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Tipo */}
          <div className="flex gap-3">
            {(['NFS-e', 'NF-e'] as TipoNF[]).map(t => (
              <button key={t} type="button" onClick={() => set('tipo', t)} style={{ cursor: 'pointer' }}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                  form.tipo === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                {t} {t === 'NFS-e' ? '— Serviço' : '— Produto'}
              </button>
            ))}
          </div>

          {/* Contrato (opcional) */}
          {contratos.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Vincular a Contrato (opcional)</label>
              <select value={form.contrato_id} onChange={e => selecionarContrato(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecione um contrato...</option>
                {contratos.map(c => <option key={c.id} value={c.id}>{c.cliente} — {fmt(c.faturamento)}</option>)}
              </select>
            </div>
          )}

          {/* Cliente e empresa */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cliente / Tomador *</label>
              <input type="text" value={form.cliente} onChange={e => set('cliente', e.target.value)}
                placeholder="Nome do cliente"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">CNPJ do Tomador</label>
              <input type="text" value={form.cnpj_cliente} onChange={e => set('cnpj_cliente', e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Empresa Emissora *</label>
              <select value={form.empresa_emissora} onChange={e => set('empresa_emissora', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                {EMPRESAS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Competência</label>
              <input type="month" value={form.competencia} onChange={e => set('competencia', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Descrição do Serviço</label>
            <select value={form.descricao_servico} onChange={e => set('descricao_servico', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              {DESCRICOES_PADRAO.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Valor Bruto (R$) *</label>
              <input type="number" value={form.valor_bruto} onChange={e => set('valor_bruto', e.target.value)}
                min="0" step="0.01" placeholder="0,00"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Alíquota ISS (%)</label>
              <input type="number" value={form.aliquota_iss} onChange={e => set('aliquota_iss', e.target.value)}
                min="0" max="10" step="0.5" placeholder="5"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Vencimento</label>
              <input type="date" value={form.data_vencimento} onChange={e => set('data_vencimento', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          {/* Preview de valores */}
          {valorBruto > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-400">ISS ({aliquota}%)</p>
                <p className="text-sm font-bold text-red-600">-{fmt(valorISS)}</p>
              </div>
              <div className="text-center border-x border-slate-200">
                <p className="text-xs text-slate-400">Valor Bruto</p>
                <p className="text-sm font-bold text-slate-700">{fmt(valorBruto)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Líquido</p>
                <p className="text-sm font-black text-emerald-600">{fmt(valorLiq)}</p>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Observações</label>
            <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
              rows={2} placeholder="Observações adicionais (opcional)"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>

          {erro && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button type="button" onClick={() => salvar(false)} disabled={salvando} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-60">
              Salvar Rascunho
            </button>
            <button type="button" onClick={() => salvar(true)} disabled={salvando} style={{ cursor: 'pointer' }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-2">
              <Send className="w-4 h-4" />
              {salvando ? 'Enviando...' : 'Emitir NF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal detalhes da NF ───────────────────────────────────────────────────

function ModalDetalhesNF({ nf, onClose, onAtualizar }: { nf: NotaFiscal; onClose: () => void; onAtualizar: () => void }) {
  const [atualizando, setAtualizando] = useState(false);

  async function mudarStatus(novoStatus: StatusNF) {
    setAtualizando(true);
    await supabase.from('notas_fiscais').update({
      status: novoStatus,
      data_emissao: novoStatus === 'autorizada' ? new Date().toISOString().split('T')[0] : nf.data_emissao,
    }).eq('id', nf.id);
    setAtualizando(false);
    onAtualizar();
    onClose();
  }

  async function cancelar() {
    if (!confirm('Confirma o cancelamento desta NF?')) return;
    await mudarStatus('cancelada');
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900">{nf.numero}</h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{nf.tipo}</span>
            <StatusBadge status={nf.status} />
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Dados principais */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Cliente', value: nf.cliente },
              { label: 'CNPJ Tomador', value: nf.cnpj_cliente || '—' },
              { label: 'Empresa Emissora', value: nf.empresa_emissora },
              { label: 'Competência', value: nf.competencia },
              { label: 'Data Emissão', value: nf.data_emissao ? new Date(nf.data_emissao).toLocaleDateString('pt-BR') : '—' },
              { label: 'Vencimento', value: nf.data_vencimento ? new Date(nf.data_vencimento).toLocaleDateString('pt-BR') : '—' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-slate-400 font-semibold uppercase">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Descrição */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Descrição do Serviço</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3">{nf.descricao_servico}</p>
          </div>

          {/* Valores */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Valores</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Valor Bruto</span><span className="font-semibold text-slate-800">{fmt(nf.valor_bruto)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">ISS ({nf.aliquota_iss}%)</span><span className="font-semibold text-red-500">-{fmt(nf.valor_iss)}</span></div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-1">
                <span className="font-bold text-slate-700">Valor Líquido</span>
                <span className="font-black text-emerald-600">{fmt(nf.valor_liquido)}</span>
              </div>
            </div>
          </div>

          {/* Chave de acesso */}
          {nf.chave_acesso && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Chave de Acesso</p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs font-mono text-slate-600 flex-1 truncate">{nf.chave_acesso}</p>
                <button onClick={() => navigator.clipboard.writeText(nf.chave_acesso!)} style={{ cursor: 'pointer' }}
                  className="text-slate-400 hover:text-slate-600 transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Links XML / DANFE */}
          {(nf.xml_url || nf.danfe_url) && (
            <div className="flex gap-3">
              {nf.xml_url && (
                <a href={nf.xml_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <Download className="w-4 h-4" /> XML
                </a>
              )}
              {nf.danfe_url && (
                <a href={nf.danfe_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <ExternalLink className="w-4 h-4" /> DANFE
                </a>
              )}
            </div>
          )}

          {/* Ações por status */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {nf.status === 'aguardando' && (
              <button onClick={() => mudarStatus('autorizada')} disabled={atualizando} style={{ cursor: 'pointer' }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-60">
                <CheckCircle2 className="w-4 h-4" /> Marcar como Autorizada
              </button>
            )}
            {nf.status === 'rascunho' && (
              <button onClick={() => mudarStatus('aguardando')} disabled={atualizando} style={{ cursor: 'pointer' }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60">
                <Send className="w-4 h-4" /> Emitir NF
              </button>
            )}
            {!['cancelada', 'rejeitada'].includes(nf.status) && (
              <button onClick={cancelar} disabled={atualizando} style={{ cursor: 'pointer' }}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition disabled:opacity-60">
                <FileX className="w-4 h-4" /> Cancelar NF
              </button>
            )}
          </div>

          {/* Integração externa */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Integração com Prefeitura</p>
            <p className="text-xs text-blue-600">
              Para emissão automática via webservice, configure a integração com NFSe.io, eNotas ou diretamente com a prefeitura do município em <strong>Configurações → Integrações</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function NotasFiscais() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | TipoNF>('Todos');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | StatusNF>('Todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('Todas');
  const [modalNova, setModalNova] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null);

  async function carregar() {
    setLoading(true);
    const { data } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('created_at', { ascending: false });
    setNotas(data ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const filtradas = notas.filter(n =>
    (filtroTipo    === 'Todos' || n.tipo             === filtroTipo) &&
    (filtroStatus  === 'Todos' || n.status           === filtroStatus) &&
    (filtroEmpresa === 'Todas' || n.empresa_emissora === filtroEmpresa) &&
    (n.cliente.toLowerCase().includes(busca.toLowerCase()) || n.numero.toLowerCase().includes(busca.toLowerCase()))
  );

  // KPIs
  const autorizadas  = notas.filter(n => n.status === 'autorizada');
  const aguardando   = notas.filter(n => n.status === 'aguardando');
  const totalEmitido = autorizadas.reduce((s, n) => s + n.valor_liquido, 0);
  const totalISS     = autorizadas.reduce((s, n) => s + n.valor_iss, 0);
  const pendentes    = notas.filter(n => ['rascunho', 'aguardando'].includes(n.status)).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notas Fiscais</h1>
          <p className="text-sm text-slate-500 mt-1">Emissão e controle de NF-e e NFS-e — Grupo Esquematiza</p>
        </div>
        <button onClick={() => setModalNova(true)} style={{ cursor: 'pointer' }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Nova Nota Fiscal
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Emitido" value={fmt(totalEmitido)} sub={`${autorizadas.length} notas autorizadas`} icon={FileCheck} cor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="ISS Recolhido" value={fmt(totalISS)} sub="impostos sobre serviços" icon={DollarSign} cor="bg-rose-50 text-rose-600" />
        <KpiCard title="Aguardando" value={String(aguardando.length)} sub="em processamento" icon={Clock} cor="bg-amber-50 text-amber-600" />
        <KpiCard title="Pendentes" value={String(pendentes)} sub="rascunhos + aguardando" icon={FileClock} cor="bg-blue-50 text-blue-600" />
      </div>

      {/* Integração banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-blue-500 rounded-xl shrink-0"><Zap className="w-5 h-5 text-white" /></div>
        <div className="flex-1">
          <p className="font-bold text-blue-900 text-sm">Integração com Prefeitura via Webservice</p>
          <p className="text-blue-700 text-xs mt-0.5">Conecte com NFSe.io, eNotas ou diretamente com o sistema da prefeitura para emissão automática de NFS-e.</p>
        </div>
        <button style={{ cursor: 'pointer' }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shrink-0">
          <ExternalLink className="w-4 h-4" /> Configurar
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por cliente ou número..."
              value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Todos">Todos os tipos</option>
              <option value="NFS-e">NFS-e</option>
              <option value="NF-e">NF-e</option>
            </select>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="aguardando">Aguardando</option>
              <option value="autorizada">Autorizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="rejeitada">Rejeitada</option>
            </select>
            <select value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="Todas">Todas as empresas</option>
              {EMPRESAS.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Carregando notas fiscais...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">
                {notas.length === 0 ? 'Nenhuma nota fiscal emitida ainda.' : 'Nenhuma nota encontrada com os filtros.'}
              </p>
              {notas.length === 0 && (
                <p className="text-slate-400 text-sm">Clique em "+ Nova Nota Fiscal" para começar.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Número / Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Competência</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Valor Bruto</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Líquido</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(n => (
                  <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-slate-800">{n.numero}</p>
                      <span className="text-xs font-semibold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{n.tipo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-700">{n.cliente}</p>
                      {n.cnpj_cliente && <p className="text-xs text-slate-400">{n.cnpj_cliente}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">{n.empresa_emissora}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{n.competencia}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">{fmt(n.valor_bruto)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">{fmt(n.valor_liquido)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={n.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setNotaSelecionada(n)} style={{ cursor: 'pointer' }}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtradas.length} notas exibidas</p>
          {filtradas.length > 0 && (
            <p className="text-xs text-slate-500 font-semibold">
              Total líquido: <span className="text-emerald-600">{fmt(filtradas.filter(n => n.status === 'autorizada').reduce((s, n) => s + n.valor_liquido, 0))}</span>
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalNova && <ModalNovaNF onClose={() => setModalNova(false)} onSalvo={carregar} />}
      {notaSelecionada && (
        <ModalDetalhesNF
          nf={notaSelecionada}
          onClose={() => setNotaSelecionada(null)}
          onAtualizar={carregar}
        />
      )}
    </div>
  );
}
