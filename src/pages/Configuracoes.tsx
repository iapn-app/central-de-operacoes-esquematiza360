import React, { useState, useEffect } from 'react';
import { Settings, Sliders, ShieldCheck, ToggleLeft, ToggleRight, Save, RefreshCw, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Módulos do sistema ────────────────────────────────────────────────────

type Modulo = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  rota: string;
  ativo: boolean;
  bloqueado?: boolean; // módulos que não podem ser desativados
};

const MODULOS_PADRAO: Modulo[] = [
  // Visão geral
  { id: 'dashboard',              nome: 'Dashboard Executivo',       descricao: 'Painel principal com KPIs e visão consolidada.',          categoria: 'VISÃO GERAL',  rota: '/dashboard',              ativo: true,  bloqueado: true },
  // Operações
  { id: 'operacoes',              nome: 'Centro de Operações',        descricao: 'Monitoramento em tempo real das operações.',             categoria: 'OPERAÇÕES',    rota: '/operacoes',              ativo: true  },
  { id: 'rondas',                 nome: 'Rondas',                     descricao: 'Gestão e rastreamento de rondas.',                       categoria: 'OPERAÇÕES',    rota: '/rondas',                 ativo: true  },
  { id: 'ocorrencias',            nome: 'Ocorrências',                descricao: 'Registro e acompanhamento de ocorrências.',              categoria: 'OPERAÇÕES',    rota: '/ocorrencias',            ativo: true  },
  { id: 'escalas',                nome: 'Escalas',                    descricao: 'Gestão de escalas e turnos.',                            categoria: 'OPERAÇÕES',    rota: '/escalas',                ativo: true  },
  { id: 'vigilantes',             nome: 'Vigilantes',                 descricao: 'Cadastro e gestão de vigilantes.',                       categoria: 'OPERAÇÕES',    rota: '/vigilantes',             ativo: true  },
  { id: 'postos',                 nome: 'Postos',                     descricao: 'Gestão de postos e clientes.',                           categoria: 'OPERAÇÕES',    rota: '/postos',                 ativo: true  },
  { id: 'frota',                  nome: 'Frota',                      descricao: 'Controle da frota de veículos.',                         categoria: 'OPERAÇÕES',    rota: '/frota',                  ativo: true  },
  { id: 'portal-cliente',         nome: 'Portal do Cliente',          descricao: 'Acesso do cliente ao sistema.',                          categoria: 'OPERAÇÕES',    rota: '/portal-cliente',         ativo: true  },
  // Financeiro
  { id: 'financeiro',             nome: 'Dashboard Financeiro',       descricao: 'Painel financeiro consolidado do grupo.',                categoria: 'FINANCEIRO',   rota: '/financeiro',             ativo: true  },
  { id: 'lancamentos',            nome: 'Lançamentos',                descricao: 'Registro de entradas e saídas.',                         categoria: 'FINANCEIRO',   rota: '/financeiro/lancamentos', ativo: true  },
  { id: 'receber',                nome: 'Contas a Receber',           descricao: 'Gestão de faturas e inadimplência.',                     categoria: 'FINANCEIRO',   rota: '/financeiro/receber',     ativo: true  },
  { id: 'pagar',                  nome: 'Contas a Pagar',             descricao: 'Gestão de obrigações financeiras.',                      categoria: 'FINANCEIRO',   rota: '/financeiro/pagar',       ativo: true  },
  { id: 'cobranca',               nome: 'Cobrança',                   descricao: 'Régua de cobrança e recuperação.',                       categoria: 'FINANCEIRO',   rota: '/financeiro/cobranca',    ativo: true  },
  { id: 'fluxo-caixa',            nome: 'Fluxo de Caixa',             descricao: 'Projeção e conciliação bancária.',                       categoria: 'FINANCEIRO',   rota: '/financeiro/fluxo-caixa', ativo: true  },
  { id: 'relatorios-fin',         nome: 'Relatórios Financeiros',     descricao: 'Central de relatórios e exportação.',                    categoria: 'FINANCEIRO',   rota: '/financeiro/relatorios',  ativo: true  },
  // Inteligência
  { id: 'inteligencia-operacional',nome: 'Inteligência Operacional',  descricao: 'IA e análise inteligente de operações.',                 categoria: 'INTELIGÊNCIA', rota: '/inteligencia-operacional',ativo: true  },
  { id: 'mapa-risco',             nome: 'Mapa de Risco',              descricao: 'Visualização geográfica de riscos.',                     categoria: 'INTELIGÊNCIA', rota: '/mapa-risco',             ativo: true  },
  { id: 'performance',            nome: 'Performance',                descricao: 'Indicadores de desempenho.',                             categoria: 'INTELIGÊNCIA', rota: '/performance',            ativo: true  },
  { id: 'simulador-risco',        nome: 'Simulador de Risco',         descricao: 'Simulação e análise de risco por cliente.',              categoria: 'INTELIGÊNCIA', rota: '/simulador-risco',        ativo: true  },
  // Admin
  { id: 'contratos',              nome: 'Contratos',                  descricao: 'Gestão de contratos e faturamento recorrente.',          categoria: 'ADMIN',        rota: '/contratos',              ativo: true  },
  { id: 'configuracoes',          nome: 'Configurações',              descricao: 'Parâmetros e gestão de módulos.',                        categoria: 'ADMIN',        rota: '/configuracoes',          ativo: true,  bloqueado: true },
];

const STORAGE_KEY = 'esquematiza_modulos_ativos';

function carregarModulos(): Modulo[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return MODULOS_PADRAO;
    const savedMap: Record<string, boolean> = JSON.parse(saved);
    return MODULOS_PADRAO.map(m => ({ ...m, ativo: m.bloqueado ? true : (savedMap[m.id] ?? m.ativo) }));
  } catch { return MODULOS_PADRAO; }
}

function salvarModulos(modulos: Modulo[]) {
  const map: Record<string, boolean> = {};
  modulos.forEach(m => { map[m.id] = m.ativo; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────

function ToggleSwitch({ ativo, onChange, disabled }: { ativo: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
        ativo ? "bg-emerald-500" : "bg-gray-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
        ativo ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}

// ─── Aba Módulos ───────────────────────────────────────────────────────────

function TabModulos() {
  const [modulos, setModulos] = useState<Modulo[]>(carregarModulos);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const categorias = [...new Set(MODULOS_PADRAO.map(m => m.categoria))];

  function toggleModulo(id: string) {
    setModulos(prev => prev.map(m => m.id === id && !m.bloqueado ? { ...m, ativo: !m.ativo } : m));
    setSalvo(false);
  }

  function ativarTodos(categoria: string) {
    setModulos(prev => prev.map(m => m.categoria === categoria ? { ...m, ativo: true } : m));
    setSalvo(false);
  }

  function desativarTodos(categoria: string) {
    setModulos(prev => prev.map(m => m.categoria === categoria && !m.bloqueado ? { ...m, ativo: false } : m));
    setSalvo(false);
  }

  async function salvar() {
    setSalvando(true);
    salvarModulos(modulos);
    await new Promise(r => setTimeout(r, 600));
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
    // Força reload para refletir na sidebar
    window.dispatchEvent(new Event('modulos-atualizados'));
  }

  const ativos   = modulos.filter(m => m.ativo).length;
  const inativos = modulos.filter(m => !m.ativo).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Atenção — Controle de Acesso</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Módulos desativados ficam invisíveis na sidebar para todos os usuários.
              Módulos bloqueados (🔒) são essenciais e não podem ser desativados.
              As alterações só aplicam após clicar em "Salvar alterações".
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-500">Ativos: <strong className="text-emerald-600">{ativos}</strong></p>
            <p className="text-xs text-gray-500">Inativos: <strong className="text-gray-500">{inativos}</strong></p>
          </div>
          <button onClick={salvar} disabled={salvando}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm",
              salvo ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
              salvando && "opacity-70 cursor-not-allowed"
            )}>
            {salvando ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</>
             : salvo   ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
             :            <><Save className="w-4 h-4" /> Salvar alterações</>}
          </button>
        </div>
      </div>

      {/* Módulos por categoria */}
      {categorias.map(cat => {
        const modulosCat = modulos.filter(m => m.categoria === cat);
        const ativosCat  = modulosCat.filter(m => m.ativo).length;
        return (
          <div key={cat} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{cat}</span>
                <span className="text-xs font-semibold text-slate-400">{ativosCat}/{modulosCat.length} ativos</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => ativarTodos(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition">
                  Ativar todos
                </button>
                <button onClick={() => desativarTodos(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                  Desativar todos
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {modulosCat.map(m => (
                <div key={m.id} className={cn("flex items-center justify-between px-5 py-3.5 transition", !m.ativo && "opacity-50")}>
                  <div className="flex items-center gap-3">
                    {m.bloqueado && <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.nome}</p>
                      <p className="text-xs text-slate-400">{m.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn("text-xs font-semibold", m.ativo ? "text-emerald-600" : "text-slate-400")}>
                      {m.ativo ? "Ativo" : "Inativo"}
                    </span>
                    <ToggleSwitch ativo={m.ativo} onChange={() => toggleModulo(m.id)} disabled={m.bloqueado} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Aba Permissões de Usuários ────────────────────────────────────────────

function TabPermissoes() {
  const usuarios = [
    { email: 'douglas@grupoesquematiza.com',          nome: 'Douglas',       role: 'admin_master', acesso: 'Acesso total ao sistema' },
    { email: 'panza@grupoesquematiza.com',            nome: 'Panza',         role: 'admin_master', acesso: 'Acesso total ao sistema' },
    { email: 'william@grupoesquematiza.com',          nome: 'William',       role: 'admin_master', acesso: 'Acesso total ao sistema' },
    { email: 'mellaurj@gmail.com',                    nome: 'Administrador', role: 'admin_master', acesso: 'Acesso total ao sistema' },
    { email: 'qualidade@esquematizavigilancia.com.br',nome: 'Fernanda',      role: 'financeiro',   acesso: 'Somente módulo Financeiro' },
  ];

  const roleColors: Record<string, string> = {
    admin_master: 'bg-purple-50 text-purple-700 border-purple-200',
    financeiro:   'bg-blue-50 text-blue-700 border-blue-200',
    operacional:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const roleLabels: Record<string, string> = {
    admin_master: 'Admin Master',
    financeiro:   'Financeiro',
    operacional:  'Operacional',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Controle de acesso por perfil</p>
          <p className="text-xs text-blue-700 mt-0.5">
            <strong>Admin Master:</strong> acesso total. &nbsp;
            <strong>Financeiro:</strong> somente módulo financeiro — outros módulos aparecem bloqueados.
            Para alterar permissões, acesse o Supabase → Authentication → Users.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Usuários cadastrados</span>
        </div>
        <div className="divide-y divide-slate-50">
          {usuarios.map(u => (
            <div key={u.email} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                  {u.nome[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{u.nome}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="text-xs text-slate-500 hidden md:block">{u.acesso}</p>
                <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", roleColors[u.role] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
                  {roleLabels[u.role] ?? u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-bold text-slate-700 mb-2">Como funciona o acesso da Fernanda</p>
        <div className="space-y-2 text-xs text-slate-600">
          <p>✅ <strong>Ela vê:</strong> Dashboard Financeiro, Lançamentos, Contas a Receber, Contas a Pagar, Cobrança, Fluxo de Caixa, Relatórios.</p>
          <p>🔒 <strong>Ela não vê:</strong> Operações, Rondas, Vigilantes, Inteligência, Contratos e qualquer outro módulo.</p>
          <p>⚠️ Se tentar acessar uma rota bloqueada diretamente, é redirecionada para <code className="bg-white px-1 py-0.5 rounded border border-slate-200">/financeiro</code>.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Aba Segurança ─────────────────────────────────────────────────────────

function TabSeguranca() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { titulo: 'Autenticação', desc: 'Supabase Auth com JWT — sessão expira em 1h com renovação automática.', status: 'ok' },
          { titulo: 'Criptografia', desc: 'HTTPS obrigatório (TLS 1.3). Dados em repouso criptografados no Supabase (AES-256).', status: 'ok' },
          { titulo: 'Row Level Security (RLS)', desc: 'Cada usuário acessa apenas seus próprios dados. Políticas RLS ativas no Supabase.', status: 'ok' },
          { titulo: 'Controle de roles', desc: 'admin_master, financeiro, operacional — cada role tem acesso restrito às suas rotas.', status: 'ok' },
          { titulo: 'Logs de auditoria', desc: 'Todas as ações críticas são registradas com usuário, data e IP.', status: 'pendente' },
          { titulo: 'Aprovação por alçada', desc: 'Pagamentos acima de R$ 10.000 exigem 2ª aprovação de admin_master.', status: 'pendente' },
        ].map(item => (
          <div key={item.titulo} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", item.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-400')} />
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.titulo}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              <span className={cn("text-xs font-semibold mt-1 inline-block", item.status === 'ok' ? 'text-emerald-600' : 'text-amber-600')}>
                {item.status === 'ok' ? '✓ Implementado' : '⏳ Em desenvolvimento'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState<'modulos' | 'permissoes' | 'seguranca'>('modulos');

  const tabs = [
    { id: 'modulos',    label: 'Módulos do Sistema', icon: ToggleRight },
    { id: 'permissoes', label: 'Usuários e Permissões', icon: ShieldCheck },
    { id: 'seguranca',  label: 'Segurança', icon: Lock },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Settings className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Configurações do Sistema</h1>
          <p className="text-gray-500 text-sm">Gestão de módulos, permissões e segurança.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'modulos'    && <TabModulos />}
      {activeTab === 'permissoes' && <TabPermissoes />}
      {activeTab === 'seguranca'  && <TabSeguranca />}
    </div>
  );
}
