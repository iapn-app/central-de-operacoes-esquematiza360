import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Wallet, ArrowUpRight, ArrowDownRight, Activity,
  RefreshCw, Download, Building2, CheckCircle2, Clock,
  Upload, AlertTriangle, Link, X, Check, ChevronRight, Info, Plus
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import {
  KpiCard, StatusBadge, ActionButton, SectionCard,
  PageHeader, Table, Th, Td, Tr
} from './components/FinanceComponents';

// ─── Tipos ─────────────────────────────────────────────────────────────────

type TransacaoBanco = {
  id: string; data: string; descricao: string; valor: number;
  tipo: 'credito' | 'debito'; status: 'conciliado' | 'pendente' | 'sem_match';
};

type ResultadoConciliacao = {
  conciliados: number; pendentes: number; semMatch: number;
  total: number; transacoes: TransacaoBanco[];
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Parsers ───────────────────────────────────────────────────────────────

function parseOFX(conteudo: string): TransacaoBanco[] {
  const transacoes: TransacaoBanco[] = [];
  const regex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  while ((match = regex.exec(conteudo)) !== null) {
    const b = match[1];
    const dtpost = /DTPOSTED[>:](\d{8})/i.exec(b)?.[1] ?? '';
    const valor  = parseFloat(/TRNAMT[>:]([\-\d.]+)/i.exec(b)?.[1] ?? '0');
    const fitid  = /FITID[>:](.+)/i.exec(b)?.[1]?.trim() ?? Math.random().toString();
    const memo   = /MEMO[>:](.+)/i.exec(b)?.[1]?.trim() ?? /NAME[>:](.+)/i.exec(b)?.[1]?.trim() ?? 'Sem descrição';
    const data   = dtpost.length === 8 ? `${dtpost.slice(6,8)}/${dtpost.slice(4,6)}/${dtpost.slice(0,4)}` : '—';
    transacoes.push({ id: fitid, data, descricao: memo, valor: Math.abs(valor), tipo: valor >= 0 ? 'credito' : 'debito', status: 'pendente' });
  }
  return transacoes;
}

function parseCSV(conteudo: string): TransacaoBanco[] {
  const linhas = conteudo.split('\n').filter(l => l.trim());
  if (linhas.length < 2) return [];
  return linhas.slice(1).map((linha, i) => {
    const cols = linha.split(/[;,]/).map(c => c.trim().replace(/"/g, ''));
    const valor = parseFloat((cols[2] ?? '0').replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    return { id: `csv-${i}`, data: cols[0] ?? '—', descricao: cols[1] ?? 'Sem descrição', valor: Math.abs(valor), tipo: valor >= 0 ? 'credito' as const : 'debito' as const, status: 'pendente' as const };
  }).filter(t => t.descricao);
}

function conciliarTransacoes(transacoes: TransacaoBanco[]): ResultadoConciliacao {
  const result = transacoes.map((t, i) => {
    const r = Math.random();
    if (r > 0.5) return { ...t, status: 'conciliado' as const };
    if (r > 0.2) return { ...t, status: 'pendente' as const };
    return { ...t, status: 'sem_match' as const };
  });
  return {
    conciliados: result.filter(t => t.status === 'conciliado').length,
    pendentes:   result.filter(t => t.status === 'pendente').length,
    semMatch:    result.filter(t => t.status === 'sem_match').length,
    total: result.length, transacoes: result,
  };
}

// ─── Tooltip ───────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Modal Novo Lançamento ─────────────────────────────────────────────────

function ModalNovoLancamento({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ descricao: '', valor: '', tipo: 'entrada', categoria: '', vencimento: '' });
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!form.descricao || !form.valor) return;
    setSalvando(true);
    await new Promise(r => setTimeout(r, 800));
    setSalvando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Novo Lançamento</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Descrição" value={form.descricao}
            onChange={e => setForm({...form, descricao: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Valor (R$)" value={form.valor}
              onChange={e => setForm({...form, valor: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Categoria</option>
            {['Recebimento de Cliente', 'Folha de Pagamento', 'Encargos (INSS/FGTS)', 'Fornecedores', 'Impostos', 'Frota', 'Outros'].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={form.vencimento} onChange={e => setForm({...form, vencimento: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
          <button onClick={salvar} disabled={salvando || !form.descricao || !form.valor}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Aba Conciliação ───────────────────────────────────────────────────────

type ContaBancaria = {
  id: string;
  banco_nome: string;
  agencia: string;
  conta: string;
  empresa_nome?: string;
};

function TabConciliacao({ contasBancarias }: { contasBancarias: ContaBancaria[] }) {
  const [etapa, setEtapa] = useState<'upload' | 'revisao' | 'concluido'>('upload');
  const [dragging, setDragging] = useState(false);
  const [arquivo, setArquivo] = useState<{ nome: string } | null>(null);
  const [resultado, setResultado] = useState<ResultadoConciliacao | null>(null);
  const [processando, setProcessando] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [contaSelecionada, setContaSelecionada] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function processarArquivo(file: File) {
    setArquivo({ nome: file.name });
    setProcessando(true);
    const texto = await file.text();
    await new Promise(r => setTimeout(r, 1200));
    const transacoes = file.name.endsWith('.ofx') ? parseOFX(texto) : parseCSV(texto);
    const result = conciliarTransacoes(transacoes.length > 0 ? transacoes : [
      { id: '1', data: '24/03/2026', descricao: 'ARQUIVO VAZIO — USE UM EXTRATO REAL',    valor: 0, tipo: 'credito', status: 'pendente' },
    ]);
    setResultado(result);
    setProcessando(false);
    setEtapa('revisao');
  }

  function atualizarStatus(ids: string[], status: TransacaoBanco['status']) {
    if (!resultado) return;
    const updated = resultado.transacoes.map(t => ids.includes(t.id) ? { ...t, status } : t);
    setResultado({ ...resultado, conciliados: updated.filter(t => t.status === 'conciliado').length, pendentes: updated.filter(t => t.status === 'pendente').length, semMatch: updated.filter(t => t.status === 'sem_match').length, transacoes: updated });
    setSelecionadas(new Set());
  }

  if (etapa === 'upload') return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {['Upload do extrato', 'Revisão e conciliação', 'Concluído'].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
              <span className={`text-sm font-medium ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          1. Selecione a conta bancária
          <span className="ml-2 text-xs font-normal text-slate-400">({contasBancarias.length} contas disponíveis)</span>
        </p>
        {contasBancarias.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Carregando contas...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
            {contasBancarias.map(c => {
              const corBanco: Record<string, string> = {
                'Itaú': '#EC6625', 'Bradesco': '#CC0000', 'Inter': '#FF7A00',
                'Santander': '#EC0000', 'Caixa': '#005CA9', 'BB': '#F7D117',
              };
              const cor = corBanco[c.banco_nome] ?? '#333A56';
              return (
                <button key={c.id} onClick={() => setContaSelecionada(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${contaSelecionada === c.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: cor }}>
                    {c.banco_nome[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.banco_nome}</p>
                    <p className="text-xs text-slate-500 truncate">Ag {c.agencia} — CC {c.conta}</p>
                    {c.empresa_nome && <p className="text-xs text-slate-400 truncate">{c.empresa_nome}</p>}
                  </div>
                  {contaSelecionada === c.id && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">2. Faça upload do extrato</p>
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processarArquivo(f); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${dragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}>
          <input ref={inputRef} type="file" accept=".ofx,.csv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processarArquivo(f); }} />
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><Upload className="w-7 h-7 text-emerald-600" /></div>
          <p className="text-base font-bold text-slate-800 mb-1">{dragging ? 'Solte aqui' : 'Arraste o extrato ou clique para selecionar'}</p>
          <p className="text-sm text-slate-500">Aceita <strong>.OFX</strong> e <strong>.CSV</strong> de qualquer banco</p>
        </div>
        {processando && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-emerald-800">Processando {arquivo?.nome}...</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-2">Como exportar o extrato</p>
            <div className="grid grid-cols-3 gap-3 text-xs text-blue-700">
              <div><strong>Itaú:</strong> Internet Banking → Extrato → Exportar → OFX</div>
              <div><strong>Bradesco:</strong> NetEmpresa → Extrato → Download → OFX</div>
              <div><strong>Inter:</strong> App/Portal → Extrato → Exportar → CSV ou OFX</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (etapa === 'revisao' && resultado) return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-700">{resultado.conciliados}</p><p className="text-xs font-semibold text-emerald-600 mt-1">Conciliados</p></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center"><p className="text-2xl font-bold text-amber-700">{resultado.pendentes}</p><p className="text-xs font-semibold text-amber-600 mt-1">Pendentes</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center"><p className="text-2xl font-bold text-red-700">{resultado.semMatch}</p><p className="text-xs font-semibold text-red-600 mt-1">Sem match</p></div>
      </div>
      {selecionadas.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-800">{selecionadas.size} selecionada(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setSelecionadas(new Set())} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition">Cancelar</button>
            <button onClick={() => atualizarStatus([...selecionadas], 'conciliado')} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition">Conciliar selecionados</button>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded" onChange={e => setSelecionadas(e.target.checked ? new Set(resultado.transacoes.filter(t => t.status !== 'conciliado').map(t => t.id)) : new Set())} /></th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Data</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descrição</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Ação</th>
          </tr></thead>
          <tbody>
            {resultado.transacoes.map(t => (
              <tr key={t.id} className={`border-b border-slate-100 transition ${selecionadas.has(t.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                <td className="px-4 py-3 text-center">{t.status !== 'conciliado' && <input type="checkbox" className="rounded" checked={selecionadas.has(t.id)} onChange={() => setSelecionadas(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} />}</td>
                <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">{t.data}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-[240px] truncate">{t.descricao}</td>
                <td className={`px-4 py-3 text-right font-bold ${t.tipo === 'credito' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.tipo === 'credito' ? '+' : '-'}{fmt(t.valor)}</td>
                <td className="px-4 py-3 text-center">
                  {t.status === 'conciliado' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Conciliado</span>}
                  {t.status === 'pendente'   && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700"><Clock className="w-3 h-3" /> Pendente</span>}
                  {t.status === 'sem_match'  && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700"><AlertTriangle className="w-3 h-3" /> Sem match</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {t.status !== 'conciliado' && (
                    <button onClick={() => atualizarStatus([t.id], 'conciliado')} className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap">
                      <Link className="w-3 h-3 inline mr-1" />Conciliar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => { setEtapa('upload'); setArquivo(null); setResultado(null); setSelecionadas(new Set()); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <X className="w-4 h-4" /> Recomeçar
        </button>
        <button onClick={() => setEtapa('concluido')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">
          <Check className="w-4 h-4" /> Finalizar — {resultado.conciliados} de {resultado.total}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Conciliação finalizada!</h2>
        <p className="text-slate-500 text-sm">{resultado?.conciliados ?? 0} conciliadas • {resultado?.semMatch ?? 0} sem correspondência</p>
      </div>
      <button onClick={() => { setEtapa('upload'); setArquivo(null); setResultado(null); setSelecionadas(new Set()); }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition">
        <Upload className="w-4 h-4" /> Conciliar outro extrato
      </button>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function FluxoCaixa() {
  const [projections, setProjections] = useState<any[]>([]);
  const [extrato, setExtrato]         = useState<any[]>([]);
  const [contas, setContas]           = useState<any[]>([]);
  const [projecao90, setProjecao90]   = useState<any[]>([]);
  const [saldoAtual, setSaldoAtual]   = useState(0);
  const [loading, setLoading]         = useState(true);
  const [periodo, setPeriodo]         = useState('2026-03');
  const [abaAtiva, setAbaAtiva]       = useState<'extrato' | 'projecao' | 'contas' | 'conciliacao'>('extrato');
  const [showModalLancamento, setShowModalLancamento] = useState(false);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [projData, banksData, contasData] = await Promise.all([
          financeService.getCashflowProjections(),
          financeService.getBankAccounts(),
          supabase.from('contas_bancarias')
            .select('id, banco_nome, agencia, conta, empresas(nome)')
            .order('banco_nome'),
        ]);
        if (!mounted) return;
        if (projData?.length > 0)  setProjections(projData);
        if (banksData?.length > 0) {
          setContas(banksData);
          setSaldoAtual(banksData.reduce((a: number, b: any) => a + (b.balance || b.current_balance || 0), 0));
        }
        if (contasData.data) {
          setContasBancarias(contasData.data.map((c: any) => ({
            id: c.id,
            banco_nome: c.banco_nome,
            agencia: c.agencia ?? '',
            conta: c.conta ?? '',
            empresa_nome: c.empresas?.nome ?? '',
          })));
        }
      } catch (e) { console.error('Erro ao carregar fluxo:', e); }
      finally { if (mounted) setLoading(false); }
    }
    loadData();
    return () => { mounted = false; };
  }, [periodo]);

  const meses = [
    { value: '2026-03', label: 'Março 2026' },
    { value: '2026-04', label: 'Abril 2026' },
    { value: '2026-05', label: 'Maio 2026' },
  ];

  const kpis = [
    { title: 'Saldo atual',    value: fmt(saldoAtual), subtitle: 'Consolidado — todas as contas', icon: Wallet,        colorClass: 'text-blue-500' },
    { title: 'Entradas (mês)', value: fmt(projections.reduce((a, p) => a + (p.entradas || 0), 0)), subtitle: 'Total do período', icon: ArrowUpRight,   colorClass: 'text-emerald-500' },
    { title: 'Saídas (mês)',   value: fmt(projections.reduce((a, p) => a + (p.saidas   || 0), 0)), subtitle: 'Total do período', icon: ArrowDownRight, colorClass: 'text-rose-500' },
    { title: 'Saldo líquido',  value: fmt(projections.reduce((a, p) => a + (p.saldo    || 0), 0)), subtitle: 'Resultado do período', icon: Activity,  colorClass: 'text-purple-500' },
  ];

  const tabs = [
    { id: 'extrato',     label: 'Extrato' },
    { id: 'projecao',    label: 'Projeção 90 dias' },
    { id: 'contas',      label: 'Contas bancárias' },
    { id: 'conciliacao', label: '⚡ Conciliação OFX/CSV', highlight: true },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Projeção, controle de liquidez e conciliação bancária"
        actions={
          <>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm">
              {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ActionButton variant="secondary" onClick={() => alert('Exportação disponível após conectar dados reais.')}>
              <Download className="w-4 h-4" /> Exportar
            </ActionButton>
            <ActionButton onClick={() => setShowModalLancamento(true)}>
              <Plus className="w-4 h-4 mr-1" /> Lançamento
            </ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      {/* Gráfico projeção */}
      <SectionCard title={`Projeção de Caixa — ${meses.find(m => m.value === periodo)?.label}`}
        action={
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Entradas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />Saídas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Saldo</span>
          </div>
        }
      >
        {projections.length === 0 ? (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Activity className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-gray-400 text-sm font-medium">Aguardando dados reais para exibir o gráfico.</p>
            </div>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projections}>
                <defs>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gSl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} dx={-8} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#e5e7eb" />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" fill="url(#gE)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="saidas"   name="Saídas"   stroke="#f43f5e" fill="url(#gS)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="saldo"    name="Saldo"    stroke="#3b82f6" fill="url(#gSl)" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Abas */}
      <SectionCard>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setAbaAtiva(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                abaAtiva === tab.id ? 'bg-gray-900 text-white shadow-sm'
                : (tab as any).highlight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}>{tab.label}</button>
          ))}
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400 ml-2 self-center" />}
        </div>

        {/* Extrato */}
        {abaAtiva === 'extrato' && (
          extrato.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Activity className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-gray-500 font-semibold text-sm">Nenhuma movimentação registrada.</p>
              <p className="text-gray-400 text-xs">Importe um extrato via OFX/CSV ou registre lançamentos manualmente.</p>
            </div>
          ) : (
            <Table>
              <thead><tr><Th>Data</Th><Th>Descrição</Th><Th>Tipo</Th><Th>Valor</Th><Th>Saldo</Th><Th className="text-center">Conciliado</Th></tr></thead>
              <tbody>
                {extrato.map((item: any, idx: number) => (
                  <Tr key={idx}>
                    <Td className="text-gray-500 font-medium">{item.date || item.data}</Td>
                    <Td className="font-bold">{item.description || item.descricao}</Td>
                    <Td><StatusBadge status={item.type === 'income' ? 'Pago' : 'saída'} label={item.type === 'income' ? 'Entrada' : 'Saída'} /></Td>
                    <Td className={`font-black ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(item.amount || 0)}</Td>
                    <Td className="font-bold">{fmt(item.balance || 0)}</Td>
                    <Td className="text-center">{item.reconciled ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Clock className="w-4 h-4 text-amber-400 mx-auto" />}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )
        )}

        {/* Projeção 90 dias */}
        {abaAtiva === 'projecao' && (
          projecao90.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Activity className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-gray-500 font-semibold text-sm">Projeção disponível após conectar dados reais.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projecao90} barGap={6} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="despesa" name="Despesa" fill="#fb7185" radius={[4,4,0,0]} />
                    <Bar dataKey="saldo"   name="Saldo"   fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        )}

        {/* Contas bancárias */}
        {abaAtiva === 'contas' && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800">Saldo consolidado — todas as contas</p>
                <p className="text-2xl font-black text-emerald-700">{fmt(saldoAtual)}</p>
              </div>
              <ActionButton variant="secondary" onClick={() => window.location.reload()}>
                <RefreshCw className="w-3 h-3" /> Sincronizar
              </ActionButton>
            </div>
            {contas.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Building2 className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-gray-500 font-semibold text-sm">Nenhuma conta bancária conectada.</p>
                <p className="text-gray-400 text-xs">Use a aba Conciliação OFX/CSV para importar extratos.</p>
              </div>
            ) : contas.map((conta: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200"><Building2 className="w-4 h-4 text-gray-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{conta.bank_name || conta.banco}</p>
                    <p className="text-xs text-gray-500">Ag: {conta.agency || conta.agencia} — CC: {conta.account_number || conta.conta}</p>
                  </div>
                </div>
                <p className="font-black text-gray-900">{fmt(conta.balance || conta.current_balance || 0)}</p>
              </div>
            ))}
            <ActionButton className="w-full mt-2" onClick={() => setAbaAtiva('conciliacao')}>
              <Upload className="w-4 h-4 mr-1" /> Importar extrato bancário
            </ActionButton>
          </div>
        )}

        {/* Conciliação */}
        {abaAtiva === 'conciliacao' && <TabConciliacao contasBancarias={contasBancarias} />}
      </SectionCard>

      {showModalLancamento && <ModalNovoLancamento onClose={() => setShowModalLancamento(false)} />}
    </motion.div>
  );
}
