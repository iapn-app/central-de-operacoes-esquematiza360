import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Wallet, ArrowUpRight, ArrowDownRight, Activity,
  RefreshCw, Download, Building2, CheckCircle2, Clock,
  Upload, FileText, AlertTriangle, Link, X, Check,
  ChevronRight, Info
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
  { data: '24/03', descricao: 'Receb. Condomínio Barra Sul',    tipo: 'Entrada', valor: '+R$ 28.800',  saldo: 'R$ 218.600', conciliado: true },
  { data: '22/03', descricao: 'Pagto. TecnoSegur — Manutenção', tipo: 'Saída',   valor: '-R$ 12.400',  saldo: 'R$ 189.800', conciliado: true },
  { data: '20/03', descricao: 'INSS + FGTS Março',              tipo: 'Saída',   valor: '-R$ 48.320',  saldo: 'R$ 202.200', conciliado: true },
  { data: '19/03', descricao: 'Receb. Petrobras Duque',         tipo: 'Entrada', valor: '+R$ 92.400',  saldo: 'R$ 250.520', conciliado: true },
  { data: '18/03', descricao: 'Pagto. Unifardome — Lote 03',    tipo: 'Saída',   valor: '-R$ 8.750',   saldo: 'R$ 158.120', conciliado: false },
  { data: '15/03', descricao: 'Pagto. Plano de Saúde',          tipo: 'Saída',   valor: '-R$ 38.700',  saldo: 'R$ 166.870', conciliado: true },
  { data: '10/03', descricao: 'Receb. Banco do Brasil RJ',      tipo: 'Entrada', valor: '+R$ 64.800',  saldo: 'R$ 205.570', conciliado: true },
];

const contasBancarias = [
  { banco: 'Itaú — CC 0099842-3',   saldo: 'R$ 142.800', status: 'Conectado', atualizado: 'agora' },
  { banco: 'Bradesco — CC 0084935-9', saldo: 'R$ 41.320', status: 'Conectado', atualizado: '5 min' },
  { banco: 'Inter — CC 4596447-5',  saldo: 'R$ 18.200',  status: 'Pendente',  atualizado: '—' },
];

// ─── Tipos ─────────────────────────────────────────────────────────────────

type TransacaoBanco = {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'credito' | 'debito';
  status: 'conciliado' | 'pendente' | 'sem_match';
  lancamentoId?: string;
};

type ResultadoConciliacao = {
  conciliados: number;
  pendentes: number;
  semMatch: number;
  total: number;
  transacoes: TransacaoBanco[];
};

// ─── Parser OFX ────────────────────────────────────────────────────────────

function parseOFX(conteudo: string): TransacaoBanco[] {
  const transacoes: TransacaoBanco[] = [];
  const regexStmtTrn = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  while ((match = regexStmtTrn.exec(conteudo)) !== null) {
    const bloco = match[1];
    const tipo   = /TRNTYPE[>:](.+)/i.exec(bloco)?.[1]?.trim() ?? '';
    const dtpost = /DTPOSTED[>:](\d{8})/i.exec(bloco)?.[1] ?? '';
    const valor  = parseFloat(/TRNAMT[>:]([\-\d.]+)/i.exec(bloco)?.[1] ?? '0');
    const fitid  = /FITID[>:](.+)/i.exec(bloco)?.[1]?.trim() ?? Math.random().toString();
    const memo   = /MEMO[>:](.+)/i.exec(bloco)?.[1]?.trim()
                ?? /NAME[>:](.+)/i.exec(bloco)?.[1]?.trim()
                ?? 'Sem descrição';
    const data = dtpost.length === 8
      ? `${dtpost.slice(6,8)}/${dtpost.slice(4,6)}/${dtpost.slice(0,4)}`
      : '—';
    transacoes.push({
      id: fitid,
      data,
      descricao: memo,
      valor: Math.abs(valor),
      tipo: valor >= 0 ? 'credito' : 'debito',
      status: 'pendente',
    });
  }
  return transacoes;
}

// ─── Parser CSV ────────────────────────────────────────────────────────────

function parseCSV(conteudo: string): TransacaoBanco[] {
  const linhas = conteudo.split('\n').filter(l => l.trim());
  if (linhas.length < 2) return [];
  const header = linhas[0].toLowerCase();
  const temData    = header.includes('data');
  const temDesc    = header.includes('descri') || header.includes('histor') || header.includes('memo');
  const temValor   = header.includes('valor') || header.includes('amount');
  const transacoes: TransacaoBanco[] = [];
  for (let i = 1; i < linhas.length; i++) {
    const cols = linhas[i].split(/[;,]/).map(c => c.trim().replace(/"/g, ''));
    if (cols.length < 2) continue;
    const data    = cols[0] ?? '—';
    const descricao = cols[1] ?? 'Sem descrição';
    const valorStr  = (cols[2] ?? '0').replace(/[R$\s.]/g, '').replace(',', '.');
    const valor     = parseFloat(valorStr) || 0;
    transacoes.push({
      id: `csv-${i}-${Math.random()}`,
      data,
      descricao,
      valor: Math.abs(valor),
      tipo: valor >= 0 ? 'credito' : 'debito',
      status: 'pendente',
    });
  }
  return transacoes;
}

// ─── Simulação de conciliação automática ──────────────────────────────────

function simularConciliacao(transacoes: TransacaoBanco[]): ResultadoConciliacao {
  // Simula match com lançamentos existentes baseado em valor e tipo
  const result = transacoes.map((t, i) => {
    const rand = Math.random();
    if (rand > 0.5) return { ...t, status: 'conciliado' as const, lancamentoId: `LAN-${1000 + i}` };
    if (rand > 0.2) return { ...t, status: 'pendente' as const };
    return { ...t, status: 'sem_match' as const };
  });
  return {
    conciliados: result.filter(t => t.status === 'conciliado').length,
    pendentes:   result.filter(t => t.status === 'pendente').length,
    semMatch:    result.filter(t => t.status === 'sem_match').length,
    total:       result.length,
    transacoes:  result,
  };
}

// ─── Tooltip customizado ───────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Aba de Conciliação ────────────────────────────────────────────────────

function TabConciliacao() {
  const [etapa, setEtapa] = useState<'upload' | 'revisao' | 'concluido'>('upload');
  const [dragging, setDragging] = useState(false);
  const [arquivo, setArquivo] = useState<{ nome: string; tipo: string } | null>(null);
  const [resultado, setResultado] = useState<ResultadoConciliacao | null>(null);
  const [processando, setProcessando] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [contaSelecionada, setContaSelecionada] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  async function processarArquivo(file: File) {
    setArquivo({ nome: file.name, tipo: file.name.endsWith('.ofx') ? 'OFX' : 'CSV' });
    setProcessando(true);
    const texto = await file.text();
    await new Promise(r => setTimeout(r, 1200)); // simula processamento
    const transacoes = file.name.endsWith('.ofx') ? parseOFX(texto) : parseCSV(texto);
    // Se não parsou nada (arquivo de teste), gera dados demo
    const demo: TransacaoBanco[] = transacoes.length > 0 ? transacoes : [
      { id: '1', data: '24/03/2026', descricao: 'RECEB CONDOMINIO BARRA SUL',    valor: 28800, tipo: 'credito', status: 'pendente' },
      { id: '2', data: '22/03/2026', descricao: 'PAGTO TECNOSEGUR MANUTENCAO',   valor: 12400, tipo: 'debito',  status: 'pendente' },
      { id: '3', data: '20/03/2026', descricao: 'INSS FGTS MARCO',               valor: 48320, tipo: 'debito',  status: 'pendente' },
      { id: '4', data: '19/03/2026', descricao: 'RECEB PETROBRAS DUQUE',         valor: 92400, tipo: 'credito', status: 'pendente' },
      { id: '5', data: '18/03/2026', descricao: 'PAGTO UNIFARDOME LOTE 03',      valor: 8750,  tipo: 'debito',  status: 'pendente' },
      { id: '6', data: '15/03/2026', descricao: 'PAGTO PLANO DE SAUDE',          valor: 38700, tipo: 'debito',  status: 'pendente' },
      { id: '7', data: '10/03/2026', descricao: 'RECEB BANCO DO BRASIL RJ',      valor: 64800, tipo: 'credito', status: 'pendente' },
      { id: '8', data: '08/03/2026', descricao: 'TED ESQUEMATIZA VIGILANCIA',    valor: 15000, tipo: 'credito', status: 'pendente' },
      { id: '9', data: '05/03/2026', descricao: 'FATURA CARTAO CORPORATIVO',     valor: 4280,  tipo: 'debito',  status: 'pendente' },
    ];
    const conciliado = simularConciliacao(demo);
    setResultado(conciliado);
    setProcessando(false);
    setEtapa('revisao');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  }

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function conciliarSelecionados() {
    if (!resultado) return;
    const updated = resultado.transacoes.map(t =>
      selectedRows.has(t.id) ? { ...t, status: 'conciliado' as const } : t
    );
    setResultado({
      ...resultado,
      conciliados: updated.filter(t => t.status === 'conciliado').length,
      pendentes:   updated.filter(t => t.status === 'pendente').length,
      semMatch:    updated.filter(t => t.status === 'sem_match').length,
      transacoes:  updated,
    });
    setSelectedRows(new Set());
  }

  function finalizar() { setEtapa('concluido'); }

  function reiniciar() {
    setEtapa('upload'); setArquivo(null);
    setResultado(null); setSelectedRows(new Set());
  }

  // ── Etapa 1: Upload ──────────────────────────────────────────────────────
  if (etapa === 'upload') return (
    <div className="space-y-6">
      {/* Barra de progresso */}
      <div className="flex items-center gap-3">
        {['Upload do extrato', 'Revisão e conciliação', 'Concluído'].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>{i + 1}</div>
              <span className={`text-sm font-medium ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Seleção de conta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">1. Selecione a conta bancária</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'itau-7157',    label: 'Itaú',     desc: 'Ag. 7157 — CC 0099842-3',  cor: '#EC6625' },
            { id: 'bradesco-1804',label: 'Bradesco',  desc: 'Ag. 1804 — CC 0084935-9', cor: '#CC0000' },
            { id: 'inter-0001',   label: 'Inter',     desc: 'Ag. 0001-9 — CC 4596447-5',cor: '#FF7A00' },
          ].map(conta => (
            <button key={conta.id} onClick={() => setContaSelecionada(conta.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                contaSelecionada === conta.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: conta.cor }}>
                {conta.label[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{conta.label}</p>
                <p className="text-xs text-slate-500">{conta.desc}</p>
              </div>
              {contaSelecionada === conta.id && <Check className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Área de upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">2. Faça upload do extrato</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <input ref={inputRef} type="file" accept=".ofx,.csv,.txt" className="hidden" onChange={handleFileInput} />
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">
            {dragging ? 'Solte o arquivo aqui' : 'Arraste o extrato ou clique para selecionar'}
          </p>
          <p className="text-sm text-slate-500">Aceita arquivos <strong>.OFX</strong> e <strong>.CSV</strong> de qualquer banco</p>
        </div>

        {processando && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Processando {arquivo?.nome}...</p>
              <p className="text-xs text-emerald-600">Lendo transações e buscando correspondências</p>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-2">Como exportar o extrato do seu banco</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-700">
              <div><strong>Itaú:</strong> Internet Banking → Extrato → Exportar → OFX</div>
              <div><strong>Bradesco:</strong> NetEmpresa → Extrato → Download → OFX</div>
              <div><strong>Inter:</strong> App/Portal → Extrato → Exportar → CSV ou OFX</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Etapa 2: Revisão ─────────────────────────────────────────────────────
  if (etapa === 'revisao' && resultado) return (
    <div className="space-y-5">
      {/* Progresso */}
      <div className="flex items-center gap-3">
        {['Upload do extrato', 'Revisão e conciliação', 'Concluído'].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>{i < 1 ? <Check className="w-3 h-3" /> : i + 1}</div>
              <span className={`text-sm font-medium ${i <= 1 ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{resultado.conciliados}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Conciliados automaticamente</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{resultado.pendentes}</p>
          <p className="text-xs font-semibold text-amber-600 mt-1">Aguardando revisão</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{resultado.semMatch}</p>
          <p className="text-xs font-semibold text-red-600 mt-1">Sem correspondência</p>
        </div>
      </div>

      {/* Ações em lote */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-800">{selectedRows.size} transação(ões) selecionada(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setSelectedRows(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button onClick={conciliarSelecionados}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition">
              Conciliar selecionados
            </button>
          </div>
        </div>
      )}

      {/* Tabela de transações */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded" onChange={e => {
                if (e.target.checked) setSelectedRows(new Set(resultado.transacoes.filter(t => t.status !== 'conciliado').map(t => t.id)));
                else setSelectedRows(new Set());
              }} /></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Data</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Ação</th>
            </tr>
          </thead>
          <tbody>
            {resultado.transacoes.map((t) => (
              <tr key={t.id} className={`border-b border-slate-100 transition ${
                selectedRows.has(t.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'
              }`}>
                <td className="px-4 py-3 text-center">
                  {t.status !== 'conciliado' && (
                    <input type="checkbox" className="rounded" checked={selectedRows.has(t.id)}
                      onChange={() => toggleRow(t.id)} />
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap">{t.data}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-[260px] truncate">{t.descricao}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    t.tipo === 'credito' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {t.tipo === 'credito' ? '↑ Crédito' : '↓ Débito'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-bold ${
                  t.tipo === 'credito' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {t.tipo === 'credito' ? '+' : '-'}{fmt(t.valor)}
                </td>
                <td className="px-4 py-3 text-center">
                  {t.status === 'conciliado' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Conciliado
                    </span>
                  )}
                  {t.status === 'pendente' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                  )}
                  {t.status === 'sem_match' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                      <AlertTriangle className="w-3 h-3" /> Sem match
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {t.status !== 'conciliado' && (
                    <button onClick={() => {
                      const updated = resultado.transacoes.map(x => x.id === t.id ? { ...x, status: 'conciliado' as const } : x);
                      setResultado({ ...resultado, conciliados: updated.filter(x => x.status === 'conciliado').length, pendentes: updated.filter(x => x.status === 'pendente').length, semMatch: updated.filter(x => x.status === 'sem_match').length, transacoes: updated });
                    }} className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap">
                      <Link className="w-3 h-3 inline mr-1" />Conciliar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ações finais */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={reiniciar} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <X className="w-4 h-4" /> Cancelar e recomeçar
        </button>
        <button onClick={finalizar}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition">
          <Check className="w-4 h-4" /> Finalizar conciliação — {resultado.conciliados} de {resultado.total}
        </button>
      </div>
    </div>
  );

  // ── Etapa 3: Concluído ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Conciliação finalizada!</h2>
        <p className="text-slate-500 text-sm">
          {resultado?.conciliados ?? 0} transações conciliadas •{' '}
          {resultado?.semMatch ?? 0} sem correspondência registradas para revisão
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-2xl font-bold text-emerald-700">{resultado?.conciliados ?? 0}</p>
          <p className="text-xs text-emerald-600">Conciliados</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-700">{resultado?.pendentes ?? 0}</p>
          <p className="text-xs text-amber-600">Pendentes</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-2xl font-bold text-red-700">{resultado?.semMatch ?? 0}</p>
          <p className="text-xs text-red-600">Sem match</p>
        </div>
      </div>
      <button onClick={reiniciar}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition">
        <Upload className="w-4 h-4" /> Conciliar outro extrato
      </button>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function FluxoCaixa() {
  const [projections, setProjections] = useState<any[]>(projecaoSemanalDemo);
  const [periodo, setPeriodo] = useState('2026-03');
  const [saldoAtual, setSaldoAtual] = useState(202320);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'extrato' | 'projecao' | 'contas' | 'conciliacao'>('extrato');

  const kpis = [
    { title: 'Saldo atual',   value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoAtual), subtitle: 'Consolidado — todas as contas', icon: Wallet,        colorClass: 'text-blue-500' },
    { title: 'Entradas (mar)',value: 'R$ 604.200', subtitle: '+8,3% vs fevereiro', icon: ArrowUpRight,   colorClass: 'text-emerald-500' },
    { title: 'Saídas (mar)',  value: 'R$ 420.100', subtitle: '-2,1% vs fevereiro', icon: ArrowDownRight, colorClass: 'text-rose-500' },
    { title: 'Saldo líquido', value: 'R$ 184.100', subtitle: 'Margem 30,5%',       icon: Activity,      colorClass: 'text-purple-500' },
  ];

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [projData, banks] = await Promise.all([
          financeService.getCashflowProjections(),
          financeService.getBankAccounts()
        ]);
        if (!mounted) return;
        if (projData?.length > 0) setProjections(projData);
        const total = banks?.reduce((acc: number, b: any) => acc + (b.balance || 0), 0);
        if (total > 0) setSaldoAtual(total);
      } catch (e) {
        console.error('Erro ao carregar fluxo:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [periodo]);

  const tabs = [
    { id: 'extrato',      label: 'Extrato' },
    { id: 'projecao',     label: 'Projeção 90 dias' },
    { id: 'contas',       label: 'Contas bancárias' },
    { id: 'conciliacao',  label: '⚡ Conciliação OFX/CSV', highlight: true },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Projeção, controle de liquidez e conciliação bancária"
        actions={
          <>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
              <option value="2026-03">Março 2026</option>
              <option value="2026-04">Abril 2026</option>
            </select>
            <ActionButton variant="secondary"><Download className="w-4 h-4" /> Exportar</ActionButton>
            <ActionButton>+ Lançamento</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      <SectionCard title="Projeção de Caixa — Março 2026"
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
                <linearGradient id="gradE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="gradS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} dx={-8} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" fill="url(#gradE)"    strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="saidas"   name="Saídas"   stroke="#f43f5e" fill="url(#gradS)"    strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="saldo"    name="Saldo"    stroke="#3b82f6" fill="url(#gradSaldo)" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard>
        {/* Abas */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setAbaAtiva(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                abaAtiva === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : (tab as any).highlight
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >{tab.label}</button>
          ))}
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400 ml-2 self-center" />}
        </div>

        {/* Extrato */}
        {abaAtiva === 'extrato' && (
          <Table>
            <thead><tr>
              <Th>Data</Th><Th>Descrição</Th><Th>Tipo</Th><Th>Valor</Th><Th>Saldo</Th><Th className="text-center">Conciliado</Th>
            </tr></thead>
            <tbody>
              {extratoDemo.map((item, idx) => (
                <Tr key={idx}>
                  <Td className="text-gray-500 font-medium">{item.data}</Td>
                  <Td className="font-bold">{item.descricao}</Td>
                  <Td><StatusBadge status={item.tipo === 'Entrada' ? 'Pago' : 'saída'} label={item.tipo} /></Td>
                  <Td className={`font-black ${item.tipo === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.valor}</Td>
                  <Td className="font-bold">{item.saldo}</Td>
                  <Td className="text-center">{item.conciliado ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <Clock className="w-4 h-4 text-amber-400 mx-auto" />}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Projeção 90 dias */}
        {abaAtiva === 'projecao' && (
          <div className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projecao90dias} barGap={6} barCategoryGap="35%">
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
            <Table>
              <thead><tr><Th>Mês</Th><Th>Receita prevista</Th><Th>Despesa prevista</Th><Th>Saldo do mês</Th><Th>Caixa acumulado</Th></tr></thead>
              <tbody>
                {projecao90dias.map((item, idx) => (
                  <Tr key={idx}>
                    <Td className="font-bold">{item.mes} 2026</Td>
                    <Td className="text-emerald-600 font-black">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.receita)}</Td>
                    <Td className="text-rose-600 font-black">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.despesa)}</Td>
                    <Td className="font-black">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.saldo)}</Td>
                    <Td className="text-blue-600 font-black">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.acumulado)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Contas bancárias */}
        {abaAtiva === 'contas' && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800">Saldo consolidado — todas as contas</p>
                <p className="text-2xl font-black text-emerald-700">R$ 202.320,00</p>
              </div>
              <ActionButton variant="secondary" className="text-xs"><RefreshCw className="w-3 h-3" /> Sincronizar</ActionButton>
            </div>
            {contasBancarias.map((conta, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200"><Building2 className="w-4 h-4 text-gray-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{conta.banco}</p>
                    <p className="text-xs text-gray-500">Atualizado: {conta.atualizado}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">{conta.saldo}</p>
                  <StatusBadge status={conta.status === 'Conectado' ? 'Pago' : 'Pendente'} label={conta.status} />
                </div>
              </div>
            ))}
            <ActionButton className="w-full mt-2"><Building2 className="w-4 h-4" /> Conectar nova conta bancária</ActionButton>
          </div>
        )}

        {/* Conciliação */}
        {abaAtiva === 'conciliacao' && <TabConciliacao />}
      </SectionCard>
    </motion.div>
  );
}
