import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Busca dados reais do Supabase ─────────────────────────────────────────

// Wrapper com timeout para evitar Promise travada por RLS ou rede
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function fetchFinanceContext() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const mesInicio = hoje.slice(0, 7) + '-01';

    const empty = { data: [], error: null };

    // Cada query tem timeout de 4s — se RLS bloquear, retorna [] e não trava
    const [pagar, receber, inadimplentes, lancamentos] = await Promise.all([
      withTimeout(
        supabase.from('lancamentos')
          .select('valor, descricao, data_vencimento')
          .eq('tipo', 'despesa').eq('status', 'pendente')
          .order('data_vencimento', { ascending: true }).limit(20),
        4000, empty
      ),
      withTimeout(
        supabase.from('lancamentos')
          .select('valor, descricao, data_vencimento')
          .eq('tipo', 'receita').eq('status', 'pendente')
          .order('data_vencimento', { ascending: true }).limit(20),
        4000, empty
      ),
      withTimeout(
        supabase.from('lancamentos')
          .select('valor, descricao, data_vencimento')
          .eq('tipo', 'receita').eq('status', 'pendente')
          .lt('data_vencimento', hoje).limit(10),
        4000, empty
      ),
      withTimeout(
        supabase.from('lancamentos')
          .select('tipo, valor, status')
          .gte('data_vencimento', mesInicio)
          .lte('data_vencimento', hoje)
          .neq('status', 'cancelado'),
        4000, empty
      ),
    ]);

    const pagarData   = (pagar as any).data      ?? [];
    const receberData = (receber as any).data     ?? [];
    const inadData    = (inadimplentes as any).data ?? [];
    const lancData    = (lancamentos as any).data   ?? [];

    const totalPagar   = pagarData.reduce((s: number, r: any) => s + Number(r.valor), 0);
    const totalReceber = receberData.reduce((s: number, r: any) => s + Number(r.valor), 0);
    const totalInadim  = inadData.reduce((s: number, r: any) => s + Number(r.valor), 0);
    const receitaMes   = lancData.filter((r: any) => r.tipo === 'receita').reduce((s: number, r: any) => s + Number(r.valor), 0);
    const despesaMes   = lancData.filter((r: any) => r.tipo === 'despesa').reduce((s: number, r: any) => s + Number(r.valor), 0);
    const venceHoje    = pagarData.filter((r: any) => r.data_vencimento?.startsWith(hoje));

    return {
      totalPagar, totalReceber, totalInadim,
      receitaMes, despesaMes,
      lucroMes: receitaMes - despesaMes,
      qtdPagar: pagarData.length,
      qtdReceber: receberData.length,
      qtdInadim: inadData.length,
      venceHoje,
      inadimplentes: inadData,
      contasPagar: pagarData,
      contasReceber: receberData,
      temDados: lancData.length > 0 || pagarData.length > 0 || receberData.length > 0,
      semConexao: false,
    };
  } catch (e) {
    console.error('fetchFinanceContext:', e);
    // Retorna contexto vazio mas válido — não trava o chat
    return {
      totalPagar: 0, totalReceber: 0, totalInadim: 0,
      receitaMes: 0, despesaMes: 0, lucroMes: 0,
      qtdPagar: 0, qtdReceber: 0, qtdInadim: 0,
      venceHoje: [], inadimplentes: [], contasPagar: [], contasReceber: [],
      temDados: false, semConexao: true,
    };
  }
}

// ─── Gera resposta com dados reais ─────────────────────────────────────────

async function generateRealResponse(question: string, financeOnly: boolean): Promise<string> {
  const q = question.toLowerCase();
  const ctx = await fetchFinanceContext();

  // Erro de conexão
  if (!ctx) {
    return 'Não foi possível conectar ao banco de dados. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.';
  }
  if ((ctx as any).semConexao) {
    return 'Não consegui me conectar ao Supabase no momento. Verifique as configurações de ambiente e tente novamente.';
  }

  // Sem dados ainda
  if (!ctx.temDados) {
    const semDados = 'Ainda não há lançamentos cadastrados no sistema. Assim que a equipe financeira registrar as primeiras entradas e saídas, poderei responder com dados reais.';

    if (financeOnly) return semDados;

    // Para perfil geral, responde o que puder sem dados financeiros
    if (['operação', 'posto', 'vigilante', 'ronda', 'ocorrência'].some(w => q.includes(w))) {
      return 'Os dados operacionais (postos, vigilantes, rondas) ainda não estão conectados ao módulo de IA. Em breve trarei informações em tempo real desta área.';
    }
    return semDados;
  }

  // ── Perguntas financeiras ──────────────────────────────────────────────

  if (['conta pra pagar', 'contas a pagar', 'pagar hoje', 'tem que pagar'].some(w => q.includes(w))) {
    if (ctx.qtdPagar === 0) {
      return 'Não há contas a pagar pendentes no sistema no momento. Tudo em dia! ✅';
    }
    let resp = `Há **${ctx.qtdPagar} conta(s) a pagar** totalizando **${fmt(ctx.totalPagar)}**.\n`;
    if (ctx.venceHoje.length > 0) {
      resp += `\n⚠️ Vencem **hoje**: ${ctx.venceHoje.map((r: any) => `${r.descricao} (${fmt(Number(r.valor))})`).join(', ')}.`;
    } else {
      resp += `\nNenhuma vence hoje especificamente.`;
    }
    return resp;
  }

  if (['conta a receber', 'contas a receber', 'receber', 'receita pendente'].some(w => q.includes(w))) {
    if (ctx.qtdReceber === 0) {
      return 'Não há contas a receber pendentes cadastradas no momento.';
    }
    return `Há **${ctx.qtdReceber} conta(s) a receber** totalizando **${fmt(ctx.totalReceber)}**. ${ctx.qtdInadim > 0 ? `Destes, **${ctx.qtdInadim}** já estão vencidos, somando **${fmt(ctx.totalInadim)}** em inadimplência.` : 'Todos dentro do prazo.'}`;
  }

  if (['inadimplên', 'atraso', 'vencido', 'cliente em atraso', 'quem deve'].some(w => q.includes(w))) {
    if (ctx.qtdInadim === 0) {
      return 'Não há clientes em atraso no momento. Inadimplência zerada! ✅';
    }
    const lista = ctx.inadimplentes.slice(0, 3).map((r: any) =>
      `• ${r.descricao} — ${fmt(Number(r.valor))} (venceu ${new Date(r.data_vencimento).toLocaleDateString('pt-BR')})`
    ).join('\n');
    return `Há **${ctx.qtdInadim} lançamento(s) vencido(s)** totalizando **${fmt(ctx.totalInadim)}**:\n\n${lista}${ctx.qtdInadim > 3 ? `\n\n...e mais ${ctx.qtdInadim - 3} outros.` : ''}`;
  }

  if (['faturamento', 'receita', 'quanto entrou', 'receita do mês'].some(w => q.includes(w))) {
    if (ctx.receitaMes === 0) {
      return 'Não há receitas registradas para o mês atual ainda.';
    }
    return `O faturamento do mês atual é de **${fmt(ctx.receitaMes)}** em receitas registradas. As despesas somam **${fmt(ctx.despesaMes)}**, resultando em **${fmt(ctx.lucroMes)}** de resultado líquido.`;
  }

  if (['lucro', 'resultado', 'margem', 'sobrou'].some(w => q.includes(w))) {
    if (ctx.receitaMes === 0 && ctx.despesaMes === 0) {
      return 'Ainda não há lançamentos suficientes para calcular o resultado do mês.';
    }
    const sinal = ctx.lucroMes >= 0 ? 'positivo' : 'negativo';
    return `O resultado do mês está **${sinal}**: receitas de **${fmt(ctx.receitaMes)}** menos despesas de **${fmt(ctx.despesaMes)}** = **${fmt(ctx.lucroMes)}**.`;
  }

  if (['fluxo de caixa', 'caixa', 'saldo'].some(w => q.includes(w))) {
    return `Resumo do mês: entradas **${fmt(ctx.receitaMes)}** | saídas **${fmt(ctx.despesaMes)}** | resultado **${fmt(ctx.lucroMes)}**. A receber ainda: **${fmt(ctx.totalReceber)}**. A pagar ainda: **${fmt(ctx.totalPagar)}**.`;
  }

  if (['resumo', 'situação financeira', 'como está o financeiro', 'visão geral'].some(w => q.includes(w))) {
    return `📊 **Situação financeira atual:**\n\n• Receitas do mês: ${fmt(ctx.receitaMes)}\n• Despesas do mês: ${fmt(ctx.despesaMes)}\n• Resultado: ${fmt(ctx.lucroMes)}\n• A receber (pendente): ${fmt(ctx.totalReceber)} (${ctx.qtdReceber} lançamentos)\n• A pagar (pendente): ${fmt(ctx.totalPagar)} (${ctx.qtdPagar} lançamentos)\n• Inadimplência: ${fmt(ctx.totalInadim)} (${ctx.qtdInadim} vencidos)`;
  }

  // ── Perguntas não-financeiras para perfil restrito ──────────────────────
  if (financeOnly) {
    return 'Acesso não autorizado para este perfil. Posso responder apenas dúvidas relacionadas ao módulo Financeiro — lançamentos, contas a pagar/receber, fluxo de caixa, inadimplência e DRE.';
  }

  // ── Perguntas gerais (perfil ADM) ───────────────────────────────────────
  if (['operação', 'posto', 'vigilante', 'ronda', 'ocorrência', 'supervisor'].some(w => q.includes(w))) {
    return 'Os dados operacionais em tempo real (postos, vigilantes, rondas) ainda estão sendo conectados ao módulo de IA. Para acompanhamento operacional, acesse o Centro de Operações no menu lateral.';
  }

  if (['onde agir', 'prioridade', 'o que fazer'].some(w => q.includes(w))) {
    const prioridades = [];
    if (ctx.venceHoje.length > 0) prioridades.push(`pagar ${ctx.venceHoje.length} conta(s) que vencem hoje (${fmt(ctx.venceHoje.reduce((s: number, r: any) => s + Number(r.valor), 0))})`);
    if (ctx.qtdInadim > 0) prioridades.push(`cobrar ${ctx.qtdInadim} cliente(s) em atraso (${fmt(ctx.totalInadim)})`);
    if (prioridades.length === 0) return 'Financeiramente, não há urgências identificadas no momento. Tudo em dia!';
    return `Prioridades identificadas:\n${prioridades.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  return `Posso ajudar com informações financeiras do Grupo Esquematiza. Tente perguntar sobre contas a pagar, contas a receber, inadimplência, faturamento ou fluxo de caixa. Resumo rápido: receitas do mês **${fmt(ctx.receitaMes)}** | a pagar **${fmt(ctx.totalPagar)}** | a receber **${fmt(ctx.totalReceber)}**.`;
}

// ─── Componente ─────────────────────────────────────────────────────────────

const QUICK_QUESTIONS_FULL = [
  'Como está o financeiro?',
  'Tem conta pra pagar hoje?',
  'Qual cliente está em atraso?',
  'Qual o faturamento do mês?',
  'Onde devo agir primeiro?',
  'Qual o resultado do mês?',
];

const QUICK_QUESTIONS_FINANCE = [
  'Tem conta pra pagar hoje?',
  'Qual cliente está em atraso?',
  'Qual o faturamento do mês?',
  'Como está o fluxo de caixa?',
];

export function PergunteCentral() {
  const { profile } = useAuth();
  const isFinanceProfile = profile?.role === 'financeiro';

  const [isOpen, setIsOpen]       = useState(false);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([{
    role: 'assistant',
    text: isFinanceProfile
      ? 'Olá! Sou a **Central IA Financeira**. Consulto os dados reais do Supabase para responder. Como posso ajudar?'
      : 'Olá, Gestor. Sou a **Central IA**. Consulto os dados reais do sistema para responder. Como posso ajudar?',
  }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);
    try {
      const response = await generateRealResponse(text, isFinanceProfile);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erro ao consultar os dados. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = isFinanceProfile ? QUICK_QUESTIONS_FINANCE : QUICK_QUESTIONS_FULL;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] flex items-center justify-center z-50 transition-all hover:scale-105 group border border-zinc-700"
      >
        <Sparkles className="w-7 h-7 text-emerald-500 group-hover:animate-pulse" />
        <span className="absolute right-full mr-4 bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 shadow-xl flex items-center gap-2">
          {isFinanceProfile ? 'Central IA Financeira' : 'Pergunte à Central'}
          <ChevronRight size={14} className="text-emerald-500" />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-zinc-950 shadow-2xl z-[60] border-l border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                  {isFinanceProfile
                    ? <Lock className="w-5 h-5 text-amber-400" />
                    : <Sparkles className="w-5 h-5 text-emerald-500" />
                  }
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {isFinanceProfile ? 'IA Financeira' : 'Central IA'}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Dados reais · Supabase
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors relative z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isFinanceProfile && (
              <div className="px-4 py-2 bg-amber-900/20 border-b border-amber-800/30 flex items-center gap-2">
                <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-400 font-medium">Acesso restrito ao módulo Financeiro</p>
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[90%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-zinc-800 text-white rounded-tr-sm'
                      : 'bg-zinc-900 text-zinc-200 rounded-tl-sm border border-zinc-800'
                  }`}>
                    {m.text.split('**').map((part, idx) =>
                      idx % 2 === 1
                        ? <strong key={idx} className="text-emerald-400">{part}</strong>
                        : part
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="self-start flex items-center gap-2 text-zinc-400 text-sm p-4 bg-zinc-900 rounded-2xl rounded-tl-sm border border-zinc-800">
                  <span className="flex gap-1">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: d }}>
                        •
                      </motion.span>
                    ))}
                  </span>
                  Consultando Supabase...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map(q => (
                  <button key={q} onClick={() => handleSend(q)} disabled={isLoading}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-900/30 border border-zinc-700 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 text-xs rounded-full transition-all disabled:opacity-40">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder={isFinanceProfile ? 'Pergunte sobre o financeiro...' : 'Faça uma pergunta...'}
                  disabled={isLoading}
                />
                <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                  className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-40 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
