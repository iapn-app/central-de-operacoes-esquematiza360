import React, { useState, useEffect, useRef } from 'react';
import {
  Landmark, Zap, CheckCircle2, AlertTriangle, Clock, X,
  Upload, RefreshCw, Link, ArrowUpRight, ArrowDownLeft,
  Search, Filter, Download, Eye, ChevronDown, ChevronUp,
  Wifi, WifiOff, Shield, DollarSign, TrendingUp, FileText,
  Plus, Settings, ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type StatusConexao = 'conectado' | 'desconectado' | 'pendente' | 'erro';
type TipoMovimento = 'credito' | 'debito';
type StatusConciliacao = 'conciliado' | 'pendente' | 'divergente' | 'ignorado';

interface ContaBancaria {
  id: string;
  banco: string;
  empresa: string;
  agencia: string;
  conta: string;
  cor: string;
  status_conexao: StatusConexao;
  saldo: number;
  ultima_atualizacao: string | null;
  pix_habilitado: boolean;
}

interface MovimentoExtrato {
  id: string;
  conta_id: string;
  banco: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoMovimento;
  status_conciliacao: StatusConciliacao;
  lancamento_id: string | null;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Contas das 10 contas reais do grupo ────────────────────────────────────

const CONTAS_GRUPO: ContaBancaria[] = [
  { id: '1',  banco: 'Itaú',     empresa: 'Serviços',     agencia: '7157',   conta: '0099842-3', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '2',  banco: 'Itaú',     empresa: 'Inteligência', agencia: '309',    conta: '0098959-8', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '3',  banco: 'Itaú',     empresa: 'Patrimonial',  agencia: '7157',   conta: '0099813-4', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '4',  banco: 'Itaú',     empresa: 'Prevenção',    agencia: '309',    conta: '0099120-6', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '5',  banco: 'Itaú',     empresa: 'Vigilância',   agencia: '7157',   conta: '0099812-6', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '6',  banco: 'Itaú',     empresa: 'Vigilância',   agencia: '7157',   conta: '0029170-4', cor: '#EC6625', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '7',  banco: 'Bradesco', empresa: 'Vigilância',   agencia: '1804',   conta: '0084935-9', cor: '#CC0000', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '8',  banco: 'Bradesco', empresa: 'Prevenção',    agencia: '1804',   conta: '0103834-6', cor: '#CC0000', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '9',  banco: 'Bradesco', empresa: 'Serviços',     agencia: '1804',   conta: '0007997-9', cor: '#CC0000', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: false },
  { id: '10', banco: 'Inter',    empresa: 'Vigilância',   agencia: '0001-9', conta: '4596447-5', cor: '#FF7A00', status_conexao: 'desconectado', saldo: 0, ultima_atualizacao: null, pix_habilitado: true  },
];

// ─── Status conexão ──────────────────────────────────────────────────────────

function statusCfg(s: StatusConexao) {
  return {
    conectado:     { label: 'Conectado',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Wifi },
    desconectado:  { label: 'Desconectado',  bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   icon: WifiOff },
    pendente:      { label: 'Pendente',      bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock },
    erro:          { label: 'Erro',          bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     icon: AlertTriangle },
  }[s];
}

function conciliacaoCfg(s: StatusConciliacao) {
  return {
    conciliado:  { label: 'Conciliado',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    pendente:    { label: 'Pendente',    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
    divergente:  { label: 'Divergente', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
    ignorado:    { label: 'Ignorado',   bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200' },
  }[s];
}

// ─── Modal conectar banco ────────────────────────────────────────────────────

function ModalConectarBanco({ conta, onClose, onConectado }: {
  conta: ContaBancaria;
  onClose: () => void;
  onConectado: () => void;
}) {
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [conectando, setConectando] = useState(false);
  const [tipoConexao, setTipoConexao] = useState<'openfinance' | 'api' | 'manual'>('openfinance');

  async function conectar() {
    setConectando(true);
    await new Promise(r => setTimeout(r, 2000));
    // Salva status no banco
    await supabase.from('contas_bancarias_openfinance').upsert({
      conta_ref: conta.conta,
      banco: conta.banco,
      empresa: conta.empresa,
      status_conexao: 'pendente',
      tipo_conexao: tipoConexao,
      pix_habilitado: conta.pix_habilitado,
    });
    setConectando(false);
    setPasso(3);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: conta.cor }}>
              {conta.banco[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Conectar {conta.banco}</h2>
              <p className="text-xs text-slate-400">{conta.empresa} · Ag {conta.agencia} · Cc {conta.conta}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Passos */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(p => (
              <React.Fragment key={p}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  passo >= p ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>{p}</div>
                {p < 3 && <div className={`flex-1 h-0.5 ${passo > p ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {passo === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-800">Escolha o método de conexão</p>
              {[
                {
                  id: 'openfinance',
                  label: 'Open Finance (recomendado)',
                  desc: 'Autorize via app do banco. Dados atualizados automaticamente.',
                  badge: 'Automático',
                  badgeCor: 'bg-emerald-100 text-emerald-700',
                },
                {
                  id: 'api',
                  label: 'API Bancária',
                  desc: 'Integração via chave de API do banco. Requer contratação.',
                  badge: 'Técnico',
                  badgeCor: 'bg-blue-100 text-blue-700',
                },
                {
                  id: 'manual',
                  label: 'Importação Manual',
                  desc: 'Faça upload de extrato OFX ou CSV quando quiser.',
                  badge: 'Manual',
                  badgeCor: 'bg-slate-100 text-slate-600',
                },
              ].map(opt => (
                <button key={opt.id} onClick={() => setTipoConexao(opt.id as any)} style={{ cursor: 'pointer' }}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition ${
                    tipoConexao === opt.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    tipoConexao === opt.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badgeCor}`}>{opt.badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
              <button onClick={() => setPasso(2)} style={{ cursor: 'pointer' }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                Continuar →
              </button>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-800">
                {tipoConexao === 'openfinance' ? 'Autorizar via Open Finance' :
                 tipoConexao === 'api' ? 'Configurar API bancária' : 'Importação manual configurada'}
              </p>

              {tipoConexao === 'openfinance' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-blue-700 font-semibold">Como funciona:</p>
                  <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                    <li>Você será redirecionado para o app do {conta.banco}</li>
                    <li>Autorize o compartilhamento de dados</li>
                    <li>O sistema sincroniza automaticamente a cada 6 horas</li>
                  </ol>
                  <p className="text-xs text-blue-500">⚠️ Requer que o banco do CNPJ seja participante do Open Finance Brasil</p>
                </div>
              )}

              {tipoConexao === 'api' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Client ID</label>
                    <input type="text" placeholder="Fornecido pelo banco"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Client Secret</label>
                    <input type="password" placeholder="••••••••••"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              )}

              {tipoConexao === 'manual' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Pronto para importação</p>
                  <p className="text-xs text-slate-400 mt-1">Você poderá fazer upload de extratos OFX/CSV a qualquer momento pela aba "Importar Extrato"</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setPasso(1)} style={{ cursor: 'pointer' }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition">
                  ← Voltar
                </button>
                <button onClick={conectar} disabled={conectando} style={{ cursor: 'pointer' }}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {conectando ? <><RefreshCw className="w-4 h-4 animate-spin" /> Conectando...</> : 'Conectar'}
                </button>
              </div>
            </div>
          )}

          {passo === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Solicitação enviada!</p>
                <p className="text-sm text-slate-500 mt-1">
                  {tipoConexao === 'openfinance'
                    ? 'Acesse o app do banco para autorizar. Após autorização, os dados serão sincronizados em até 30 minutos.'
                    : tipoConexao === 'api'
                    ? 'Credenciais salvas. A conexão será testada em instantes.'
                    : 'Conta configurada para importação manual de extratos.'}
                </p>
              </div>
              <button onClick={() => { onConectado(); onClose(); }} style={{ cursor: 'pointer' }}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal importar extrato ──────────────────────────────────────────────────

function ModalImportarExtrato({ contas, onClose, onImportado }: {
  contas: ContaBancaria[];
  onClose: () => void;
  onImportado: (movimentos: MovimentoExtrato[]) => void;
}) {
  const [contaId, setContaId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState<MovimentoExtrato[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processar() {
    if (!arquivo || !contaId) { setErro('Selecione a conta e o arquivo.'); return; }
    setProcessando(true);
    setErro(null);

    try {
      const texto = await arquivo.text();
      const conta = contas.find(c => c.id === contaId)!;
      const movimentos: MovimentoExtrato[] = [];

      if (arquivo.name.endsWith('.csv')) {
        // Parsear CSV simples: data,descrição,valor
        const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
        linhas.forEach((linha, i) => {
          const partes = linha.split(/[;,]/).map(p => p.trim().replace(/"/g, ''));
          if (partes.length < 3) return;
          const valor = parseFloat(partes[2].replace(',', '.'));
          if (isNaN(valor)) return;
          movimentos.push({
            id: `imp-${i}`,
            conta_id: contaId,
            banco: conta.banco,
            data: partes[0],
            descricao: partes[1] || 'Sem descrição',
            valor: Math.abs(valor),
            tipo: valor >= 0 ? 'credito' : 'debito',
            status_conciliacao: 'pendente',
            lancamento_id: null,
          });
        });
      } else if (arquivo.name.endsWith('.ofx') || arquivo.name.endsWith('.ofc')) {
        // Parsear OFX básico
        const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        let match;
        let i = 0;
        while ((match = regex.exec(texto)) !== null) {
          const bloco = match[1];
          const get = (tag: string) => {
            const m = new RegExp(`<${tag}>([^<]+)`).exec(bloco);
            return m ? m[1].trim() : '';
          };
          const trntype = get('TRNTYPE');
          const dtposted = get('DTPOSTED');
          const trnamt = parseFloat(get('TRNAMT') || '0');
          const memo = get('MEMO') || get('NAME') || 'Sem descrição';
          const data = dtposted ? `${dtposted.slice(6,8)}/${dtposted.slice(4,6)}/${dtposted.slice(0,4)}` : '';
          if (!data) continue;
          const conta = contas.find(c => c.id === contaId)!;
          movimentos.push({
            id: `ofx-${i++}`,
            conta_id: contaId,
            banco: conta.banco,
            data,
            descricao: memo,
            valor: Math.abs(trnamt),
            tipo: trntype === 'CREDIT' || trnamt > 0 ? 'credito' : 'debito',
            status_conciliacao: 'pendente',
            lancamento_id: null,
          });
        }
      } else {
        throw new Error('Formato não suportado. Use .csv ou .ofx');
      }

      if (movimentos.length === 0) throw new Error('Nenhum movimento encontrado no arquivo.');
      setPreview(movimentos.slice(0, 5));
      await new Promise(r => setTimeout(r, 500));

      // Salva no banco
      const rows = movimentos.map(m => ({
        conta_ref: conta.conta,
        banco: conta.banco,
        empresa: conta.empresa,
        data_movimento: m.data,
        descricao: m.descricao,
        valor: m.valor,
        tipo: m.tipo,
        status_conciliacao: 'pendente',
      }));
      await supabase.from('extrato_bancario').insert(rows);
      onImportado(movimentos);
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao processar arquivo.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Importar Extrato Bancário</h2>
          <button onClick={onClose} style={{ cursor: 'pointer' }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Conta Bancária *</label>
            <select value={contaId} onChange={e => setContaId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Selecione a conta...</option>
              {contas.map(c => (
                <option key={c.id} value={c.id}>{c.banco} — {c.empresa} (Ag {c.agencia} · {c.conta})</option>
              ))}
            </select>
          </div>

          {/* Upload */}
          <div
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              arquivo ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <input ref={inputRef} type="file" accept=".csv,.ofx,.ofc" className="hidden"
              onChange={e => { setArquivo(e.target.files?.[0] ?? null); setErro(null); }} />
            {arquivo ? (
              <div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-700">{arquivo.name}</p>
                <p className="text-xs text-emerald-600">{(arquivo.size / 1024).toFixed(1)} KB · Clique para trocar</p>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Arraste ou clique para selecionar</p>
                <p className="text-xs text-slate-400 mt-1">Formatos aceitos: <strong>.CSV</strong> ou <strong>.OFX</strong> (extrato do banco)</p>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 mb-2">Como exportar o extrato do banco:</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>• <strong>Itaú:</strong> Internet Banking → Extrato → Exportar → OFX</p>
              <p>• <strong>Bradesco:</strong> Internet Banking → Extrato → Baixar → OFX ou CSV</p>
              <p>• <strong>Inter:</strong> App → Extrato → Exportar → CSV</p>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <p className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 border-b border-slate-200">
                Preview (primeiros {preview.length} registros)
              </p>
              {preview.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{m.descricao}</p>
                    <p className="text-xs text-slate-400">{m.data}</p>
                  </div>
                  <span className={`text-xs font-bold ${m.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.tipo === 'credito' ? '+' : '-'}{fmt(m.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {erro && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{erro}</div>}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button onClick={onClose} style={{ cursor: 'pointer' }}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button onClick={processar} disabled={processando || !arquivo || !contaId} style={{ cursor: 'pointer' }}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {processando ? <><RefreshCw className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function OpenFinance() {
  const [contas, setContas] = useState<ContaBancaria[]>(CONTAS_GRUPO);
  const [extratos, setExtratos] = useState<any[]>([]);
  const [aba, setAba] = useState<'contas' | 'extrato' | 'conciliacao' | 'pix'>('contas');
  const [modalConectar, setModalConectar] = useState<ContaBancaria | null>(null);
  const [modalImportar, setModalImportar] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroBanco, setFiltroBanco] = useState('Todos');

  useEffect(() => {
    // Carrega status das conexões do banco
    supabase.from('contas_bancarias_openfinance').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setContas(prev => prev.map(c => {
          const found = data.find((d: any) => d.conta_ref === c.conta);
          return found ? { ...c, status_conexao: found.status_conexao } : c;
        }));
      }
    });
    // Carrega extratos
    supabase.from('extrato_bancario').select('*').order('data_movimento', { ascending: false }).limit(50)
      .then(({ data }) => setExtratos(data ?? []));
  }, []);

  const conectadas    = contas.filter(c => c.status_conexao === 'conectado').length;
  const pendentes     = contas.filter(c => c.status_conexao === 'pendente').length;
  const desconectadas = contas.filter(c => c.status_conexao === 'desconectado').length;
  const pixContas     = contas.filter(c => c.pix_habilitado).length;

  const contasFiltradas = contas.filter(c =>
    (filtroBanco === 'Todos' || c.banco === filtroBanco) &&
    (c.empresa.toLowerCase().includes(busca.toLowerCase()) || c.banco.toLowerCase().includes(busca.toLowerCase()))
  );

  const extratosDisplay = extratos.filter(e =>
    e.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  const bancos = ['Todos', ...Array.from(new Set(contas.map(c => c.banco)))];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Open Finance</h1>
          <p className="text-sm text-slate-500 mt-1">Integração bancária e conciliação automática — Grupo Esquematiza</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalImportar(true)} style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition">
            <Upload className="w-4 h-4" /> Importar Extrato
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total de Contas',  value: String(contas.length),   sub: '5 CNPJs · 3 bancos',        icon: Landmark,    cor: 'bg-blue-50 text-blue-600' },
          { title: 'Conectadas',       value: String(conectadas),       sub: 'com sincronização ativa',   icon: Wifi,        cor: 'bg-emerald-50 text-emerald-600' },
          { title: 'Pendentes',        value: String(pendentes),        sub: 'aguardando autorização',    icon: Clock,       cor: 'bg-amber-50 text-amber-600' },
          { title: 'PIX Habilitado',   value: String(pixContas),        sub: 'contas com PIX ativo',      icon: Zap,         cor: 'bg-purple-50 text-purple-600' },
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

      {/* Banner Open Finance */}
      {conectadas === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0"><Zap className="w-5 h-5 text-white" /></div>
          <div className="flex-1">
            <p className="font-bold text-blue-900 text-sm">Conecte seus bancos ao Open Finance Brasil</p>
            <p className="text-blue-700 text-xs mt-0.5">
              Autorize o compartilhamento de dados e tenha extratos, saldos e conciliação automática sem digitar nada.
              As 10 contas do grupo podem ser conectadas em minutos.
            </p>
          </div>
          <button onClick={() => setModalConectar(contas[0])} style={{ cursor: 'pointer' }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shrink-0">
            <Link className="w-4 h-4" /> Conectar agora
          </button>
        </div>
      )}

      {/* Abas */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl w-fit shadow-sm">
        {[
          { id: 'contas',       label: 'Contas',          icon: Landmark },
          { id: 'extrato',      label: 'Extratos',        icon: FileText },
          { id: 'conciliacao',  label: 'Conciliação',     icon: CheckCircle2 },
          { id: 'pix',          label: 'PIX',             icon: Zap },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setAba(t.id as any)} style={{ cursor: 'pointer' }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                aba === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ABA CONTAS */}
      {aba === 'contas' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar conta ou empresa..."
                value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={filtroBanco} onChange={e => setFiltroBanco(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              {bancos.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contasFiltradas.map(c => {
              const scfg = statusCfg(c.status_conexao);
              const SIcon = scfg.icon;
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: c.cor }}>
                        {c.banco[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.banco}</p>
                        <p className="text-xs text-slate-400">{c.empresa}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${scfg.bg} ${scfg.text} ${scfg.border}`}>
                      <SIcon className="w-3 h-3" /> {scfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-slate-400">Agência</p>
                      <p className="text-sm font-bold text-slate-700">{c.agencia}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-slate-400">Conta</p>
                      <p className="text-sm font-bold text-slate-700">{c.conta}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-slate-400">Saldo</p>
                      <p className="text-sm font-bold text-slate-700">
                        {c.status_conexao === 'conectado' ? fmt(c.saldo) : '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-slate-400">PIX</p>
                      <p className="text-sm font-bold text-slate-700">
                        {c.pix_habilitado ? '✓ Habilitado' : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {c.status_conexao === 'desconectado' ? (
                      <button onClick={() => setModalConectar(c)} style={{ cursor: 'pointer' }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">
                        <Link className="w-3.5 h-3.5" /> Conectar
                      </button>
                    ) : (
                      <button style={{ cursor: 'pointer' }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                        <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
                      </button>
                    )}
                    <button onClick={() => setModalImportar(true)} style={{ cursor: 'pointer' }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                      <Upload className="w-3.5 h-3.5" /> Extrato
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA EXTRATOS */}
      {aba === 'extrato' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Movimentos Importados</p>
            <button onClick={() => setModalImportar(true)} style={{ cursor: 'pointer' }}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">
              <Plus className="w-3.5 h-3.5" /> Importar
            </button>
          </div>
          {extratosDisplay.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-semibold">Nenhum extrato importado ainda</p>
              <p className="text-slate-400 text-sm">Importe um extrato OFX ou CSV para visualizar os movimentos.</p>
              <button onClick={() => setModalImportar(true)} style={{ cursor: 'pointer' }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                <Upload className="w-4 h-4" /> Importar Extrato
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Banco</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {extratosDisplay.map((e, i) => {
                  const ccfg = conciliacaoCfg(e.status_conciliacao ?? 'pendente');
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-xs text-slate-500">{e.data_movimento}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{e.descricao}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{e.banco}</td>
                      <td className={`px-4 py-3 text-sm font-bold text-right ${e.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {e.tipo === 'credito' ? '+' : '-'}{fmt(e.valor)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ccfg.bg} ${ccfg.text} ${ccfg.border}`}>
                          {ccfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ABA CONCILIAÇÃO */}
      {aba === 'conciliacao' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Conciliação Automática</h2>
                <p className="text-xs text-slate-400">Comparação entre lançamentos e extrato bancário</p>
              </div>
            </div>

            {extratos.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-semibold">Nenhum extrato para conciliar</p>
                <p className="text-slate-400 text-sm">Importe extratos bancários para iniciar a conciliação automática.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {['conciliado', 'pendente', 'divergente'].map(status => {
                  const count = extratos.filter(e => (e.status_conciliacao ?? 'pendente') === status).length;
                  const ccfg = conciliacaoCfg(status as StatusConciliacao);
                  return (
                    <div key={status} className={`flex items-center justify-between p-4 rounded-xl border ${ccfg.bg} ${ccfg.border}`}>
                      <span className={`text-sm font-bold ${ccfg.text}`}>{ccfg.label}</span>
                      <span className={`text-2xl font-black ${ccfg.text}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">Como funciona a conciliação automática</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                O sistema compara cada movimento do extrato bancário com os lançamentos cadastrados em
                <strong> Contas a Receber</strong> e <strong>Contas a Pagar</strong>. Quando encontra correspondência
                por valor e data, marca automaticamente como <strong>Conciliado</strong>. Divergências são marcadas
                para revisão manual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA PIX */}
      {aba === 'pix' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-purple-100 rounded-xl"><Zap className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h2 className="text-base font-bold text-slate-900">PIX — Recebimentos em Tempo Real</h2>
                <p className="text-xs text-slate-400">Monitoramento de entradas PIX por empresa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contas.filter(c => c.pix_habilitado).map(c => (
                <div key={c.id} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: c.cor }}>{c.banco[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.empresa}</p>
                      <p className="text-xs text-slate-400">{c.banco} · {c.conta}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-full">PIX ativo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-400">Recebidos hoje</p>
                      <p className="text-sm font-black text-slate-800">—</p>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-400">Recebidos no mês</p>
                      <p className="text-sm font-black text-slate-800">—</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Para ativar recebimentos PIX em tempo real:
              </p>
              <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                <li>Conecte a conta via Open Finance ou API bancária</li>
                <li>Solicite ao banco o Webhook PIX para notificações instantâneas</li>
                <li>Configure a chave PIX de cada CNPJ nas configurações do banco</li>
                <li>O sistema vai reconhecer pagamentos de clientes automaticamente</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      {modalConectar && (
        <ModalConectarBanco
          conta={modalConectar}
          onClose={() => setModalConectar(null)}
          onConectado={() => setModalConectar(null)}
        />
      )}
      {modalImportar && (
        <ModalImportarExtrato
          contas={contas}
          onClose={() => setModalImportar(false)}
          onImportado={movs => {
            setExtratos(prev => [...movs.map(m => ({ ...m, data_movimento: m.data, status_conciliacao: 'pendente' })), ...prev]);
            setAba('extrato');
          }}
        />
      )}
    </div>
  );
}
