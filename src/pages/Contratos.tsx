import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText, Search, Plus, Building2, Calendar, DollarSign,
  Users, MoreVertical, ShieldCheck, Briefcase, Leaf, X,
  RefreshCw, CheckCircle2, AlertTriangle, Clock, Zap,
  ChevronRight, Play, Check, Ban, Eye, RotateCcw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// ─── Dados ─────────────────────────────────────────────────────────────────

const MOCK_CONTRATOS = [
  { id: '1', cliente: 'Condomínio Alto Padrão',   cnpj: '12.345.678/0001-90', tipo_servico: 'Multi-serviço',  servicos: ['Vigilância', 'Limpeza'],     valor_mensal: 45000,  profissionais: 12, data_inicio: '2025-01-01', data_fim: '2026-12-01', frequencia: 'Mensal', status: 'ATIVO',     empresa: 'Vigilância',  dia_faturamento: 1  },
  { id: '2', cliente: 'Shopping Center Sul',       cnpj: '98.765.432/0001-10', tipo_servico: 'Vigilância',     servicos: ['Vigilância'],                valor_mensal: 120000, profissionais: 30, data_inicio: '2024-06-15', data_fim: '2026-06-15', frequencia: 'Mensal', status: 'ATIVO',     empresa: 'Vigilância',  dia_faturamento: 5  },
  { id: '3', cliente: 'Hospital Santa Maria',      cnpj: '45.678.901/0001-23', tipo_servico: 'Limpeza',        servicos: ['Limpeza'],                   valor_mensal: 85000,  profissionais: 25, data_inicio: '2025-03-01', data_fim: '2026-03-01', frequencia: 'Mensal', status: 'ATIVO',     empresa: 'Serviços',    dia_faturamento: 1  },
  { id: '4', cliente: 'Petrobras Duque',           cnpj: '33.000.167/0001-01', tipo_servico: 'Vigilância',     servicos: ['Vigilância'],                valor_mensal: 92400,  profissionais: 28, data_inicio: '2024-01-01', data_fim: '2026-12-31', frequencia: 'Mensal', status: 'ATIVO',     empresa: 'Vigilância',  dia_faturamento: 1  },
  { id: '5', cliente: 'Banco do Brasil RJ',        cnpj: '00.000.000/3253-01', tipo_servico: 'Vigilância',     servicos: ['Vigilância'],                valor_mensal: 64800,  profissionais: 18, data_inicio: '2024-06-01', data_fim: '2026-06-01', frequencia: 'Mensal', status: 'ATIVO',     empresa: 'Vigilância',  dia_faturamento: 1  },
  { id: '6', cliente: 'Indústria Tech Corp',       cnpj: '33.444.555/0001-66', tipo_servico: 'Multi-serviço',  servicos: ['Vigilância', 'Jardinagem'],  valor_mensal: 62000,  profissionais: 15, data_inicio: '2023-10-10', data_fim: '2024-10-10', frequencia: 'Mensal', status: 'FINALIZADO', empresa: 'Patrimonial', dia_faturamento: 10 },
];

const EMPRESAS = ['Vigilância', 'Serviços', 'Patrimonial', 'Prevenção', 'Inteligência'];

type FaturaRecorrente = {
  id: string;
  contrato_id: string;
  cliente: string;
  empresa: string;
  valor: number;
  competencia: string;
  vencimento: string;
  status: 'pendente' | 'gerada' | 'cancelada' | 'enviada';
  nf: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function gerarFaturasMes(mes: string): FaturaRecorrente[] {
  const [ano, m] = mes.split('-').map(Number);
  return MOCK_CONTRATOS
    .filter(c => c.status === 'ATIVO')
    .map((c, i) => {
      const dia = String(c.dia_faturamento).padStart(2, '0');
      const mesStr = String(m).padStart(2, '0');
      // Vencimento = dia_faturamento do próximo mês
      const proxMes = m === 12 ? 1 : m + 1;
      const proxAno = m === 12 ? ano + 1 : ano;
      const venc = `${String(proxMes).padStart(2,'0')}/${dia}/${proxAno}`;
      const statuses: FaturaRecorrente['status'][] = ['gerada', 'pendente', 'enviada', 'gerada', 'pendente'];
      return {
        id: `fat-${c.id}-${mes}`,
        contrato_id: c.id,
        cliente: c.cliente,
        empresa: c.empresa,
        valor: c.valor_mensal,
        competencia: `${mesStr}/${ano}`,
        vencimento: `${dia}/${mesStr}/${proxAno}`,
        status: statuses[i] ?? 'pendente',
        nf: statuses[i] === 'enviada' ? `NF-${3240 + i}` : '—',
      };
    });
}

function getStatusFatura(s: FaturaRecorrente['status']) {
  if (s === 'gerada')    return { label: 'Gerada',    cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (s === 'enviada')   return { label: 'Enviada',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (s === 'cancelada') return { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-200' };
  return                        { label: 'Pendente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' };
}

function getServiceIcon(s: string) {
  if (s.includes('Vigilância')) return <ShieldCheck className="w-4 h-4 text-blue-500" />;
  if (s.includes('Limpeza'))    return <Briefcase className="w-4 h-4 text-emerald-500" />;
  if (s.includes('Jardinagem')) return <Leaf className="w-4 h-4 text-green-500" />;
  return <FileText className="w-4 h-4 text-gray-500" />;
}

// ─── Aba Recorrente ────────────────────────────────────────────────────────

function TabRecorrente() {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const [mes, setMes] = useState(mesAtual);
  const [faturas, setFaturas] = useState<FaturaRecorrente[]>(() => gerarFaturasMes(mesAtual));
  const [gerando, setGerando] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i - 1, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  });

  function mudarMes(novoMes: string) {
    setMes(novoMes);
    setFaturas(gerarFaturasMes(novoMes));
    setSelecionadas(new Set());
  }

  async function gerarTodas() {
    setGerando(true);
    await new Promise(r => setTimeout(r, 1200));
    setFaturas(prev => prev.map(f => f.status === 'pendente' ? { ...f, status: 'gerada' } : f));
    setGerando(false);
  }

  function toggleSel(id: string) {
    setSelecionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function acao(ids: string[], status: FaturaRecorrente['status']) {
    setFaturas(prev => prev.map(f => ids.includes(f.id) ? { ...f, status } : f));
    setSelecionadas(new Set());
  }

  const pendentes  = faturas.filter(f => f.status === 'pendente').length;
  const geradas    = faturas.filter(f => f.status === 'gerada').length;
  const enviadas   = faturas.filter(f => f.status === 'enviada').length;
  const totalMes   = faturas.reduce((a, f) => a + f.valor, 0);

  return (
    <div className="space-y-6">

      {/* Cabeçalho recorrente */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-emerald-500 rounded-xl shrink-0">
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-emerald-800 text-sm">Faturamento Recorrente Automático</p>
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">AUTO</span>
          </div>
          <p className="text-emerald-700 text-xs">
            Baseado nos {MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').length} contratos ativos — gera as faturas do mês com 1 clique.
            Total contratado: <strong>{fmt(MOCK_CONTRATOS.filter(c=>c.status==='ATIVO').reduce((a,c)=>a+c.valor_mensal,0))}/mês</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <select value={mes} onChange={e => mudarMes(e.target.value)}
            className="text-sm font-semibold border border-emerald-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500">
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={gerarTodas} disabled={gerando || pendentes === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {gerando
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Gerando...</>
              : <><Zap className="w-4 h-4" /> Gerar {pendentes} fatura{pendentes !== 1 ? 's' : ''}</>
            }
          </button>
        </div>
      </div>

      {/* KPIs do mês */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total do mês',  value: fmt(totalMes),        icon: DollarSign,   bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Pendentes',     value: String(pendentes),    icon: Clock,        bg: 'bg-amber-50',   cor: 'text-amber-600' },
          { label: 'Geradas',       value: String(geradas),      icon: CheckCircle2, bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Enviadas/NF',   value: String(enviadas),     icon: FileText,     bg: 'bg-emerald-50', cor: 'text-emerald-600' },
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

      {/* Ações em lote */}
      {selecionadas.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-blue-800">{selecionadas.size} fatura(s) selecionada(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setSelecionadas(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button onClick={() => acao([...selecionadas], 'gerada')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 border border-blue-200 bg-white hover:bg-blue-50 transition">
              <Play className="w-3 h-3" /> Gerar selecionadas
            </button>
            <button onClick={() => acao([...selecionadas], 'enviada')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 bg-white hover:bg-emerald-50 transition">
              <Check className="w-3 h-3" /> Marcar como enviada
            </button>
            <button onClick={() => acao([...selecionadas], 'cancelada')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 border border-red-200 bg-white hover:bg-red-50 transition">
              <Ban className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de faturas */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">
            Faturas — {meses.find(m => m.value === mes)?.label}
          </p>
          <p className="text-xs text-slate-500">{faturas.length} faturas • {fmt(totalMes)}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="rounded" onChange={e => {
                  if (e.target.checked) setSelecionadas(new Set(faturas.map(f => f.id)));
                  else setSelecionadas(new Set());
                }} />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Competência</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vencimento</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Valor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">NF</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {faturas.map(f => {
              const st = getStatusFatura(f.status);
              return (
                <tr key={f.id} className={`border-b border-slate-100 transition ${selecionadas.has(f.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 text-center">
                    <input type="checkbox" className="rounded" checked={selecionadas.has(f.id)} onChange={() => toggleSel(f.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{f.cliente}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">{f.empresa}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">{f.competencia}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">{f.vencimento}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(f.valor)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${f.nf !== '—' ? 'text-emerald-700' : 'text-slate-400'}`}>{f.nf}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {f.status === 'pendente' && (
                        <button onClick={() => acao([f.id], 'gerada')} title="Gerar"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.status === 'gerada' && (
                        <button onClick={() => acao([f.id], 'enviada')} title="Marcar como enviada"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.status === 'cancelada' && (
                        <button onClick={() => acao([f.id], 'pendente')} title="Reativar"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {f.status !== 'cancelada' && (
                        <button onClick={() => acao([f.id], 'cancelada')} title="Cancelar"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 mb-1">Como funciona a receita recorrente</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Todo início de mês o sistema gera automaticamente uma fatura para cada contrato ativo, com base no valor mensal e dia de faturamento configurado.
            Você revisa, aprova e marca como enviada — e ao integrar com NFS-e, a nota fiscal é emitida diretamente.
            O histórico fica registrado em Lançamentos como entradas a receber.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Aba Contratos ─────────────────────────────────────────────────────────

function TabContratos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterEmpresa, setFilterEmpresa] = useState('TODAS');

  const filtered = MOCK_CONTRATOS.filter(c => {
    const matchSearch = c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm);
    const matchStatus  = filterStatus === 'TODOS'   || c.status  === filterStatus;
    const matchEmpresa = filterEmpresa === 'TODAS'  || c.empresa === filterEmpresa;
    return matchSearch && matchStatus && matchEmpresa;
  });

  const totalAtivos    = MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').length;
  const receitaMensal  = MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').reduce((a, c) => a + c.valor_mensal, 0);
  const totalProfs     = MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').reduce((a, c) => a + c.profissionais, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Contratos Ativos',         value: String(totalAtivos),   icon: FileText,   bg: 'bg-emerald-50', cor: 'text-emerald-600' },
          { label: 'Receita Contratada (Mês)', value: fmt(receitaMensal),    icon: DollarSign, bg: 'bg-blue-50',    cor: 'text-blue-600' },
          { label: 'Profissionais Alocados',   value: String(totalProfs),    icon: Users,      bg: 'bg-purple-50',  cor: 'text-purple-600' },
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
              <input type="text" placeholder="Buscar cliente ou CNPJ..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODOS">Todos os status</option>
              <option value="ATIVO">Ativos</option>
              <option value="PAUSADO">Pausados</option>
              <option value="FINALIZADO">Finalizados</option>
            </select>
            <select value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="TODAS">Todas as empresas</option>
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <button onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Novo Contrato
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {['Cliente', 'Empresa', 'Serviços', 'Valor Mensal', 'Vigência', 'Fat. Dia', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.cliente}</p>
                        <p className="text-[10px] text-gray-400">{c.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">{c.empresa}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {c.servicos.map(s => <div key={s} title={s}>{getServiceIcon(s)}</div>)}
                      <span className="text-[10px] text-gray-400 ml-1">({c.profissionais})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900 text-sm">{fmt(c.valor_mensal)}</td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-600">
                      <p>{new Date(c.data_inicio).toLocaleDateString('pt-BR')}</p>
                      <p className="text-gray-400">até {new Date(c.data_fim).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">Dia {c.dia_faturamento}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                      c.status === 'ATIVO'     ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      c.status === 'FINALIZADO'? "bg-gray-50 text-gray-600 border-gray-200" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    )}>{c.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">Nenhum contrato encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Novo Contrato" maxWidth="max-w-2xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
              <input type="text" placeholder="Nome do cliente" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Empresa do Grupo</label>
              <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Selecione...</option>
                {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Valor Mensal (R$)</label>
              <input type="number" placeholder="0,00" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Data Início</label>
              <input type="date" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Dia de Faturamento</label>
              <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                {[1,5,10,15,20,25,30].map(d => <option key={d} value={d}>Dia {d}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Serviços</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Vigilância', icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
                { label: 'Limpeza',    icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
                { label: 'Jardinagem', icon: <Leaf className="w-4 h-4 text-green-500" /> },
              ].map(s => (
                <label key={s.label} className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                  <input type="checkbox" className="rounded border-gray-300" />
                  {s.icon}
                  <span className="text-sm font-medium text-slate-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setIsNewModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
            <button onClick={() => setIsNewModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm">Salvar Contrato</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function Contratos() {
  const [aba, setAba] = useState<'contratos' | 'recorrente'>('contratos');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <FileText className="text-white w-5 h-5" />
            </div>
            Gestão de Contratos
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Gerencie contratos e faturamento recorrente automático.</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl w-fit">
        <button onClick={() => setAba('contratos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            aba === 'contratos' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <FileText className="w-4 h-4" /> Contratos
        </button>
        <button onClick={() => setAba('recorrente')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            aba === 'recorrente' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <RefreshCw className="w-4 h-4" />
          Recorrente
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            {MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').length}
          </span>
        </button>
      </div>

      {aba === 'contratos'   && <TabContratos />}
      {aba === 'recorrente'  && <TabRecorrente />}

    </div>
  );
}
