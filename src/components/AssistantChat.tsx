import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, ChevronRight, Phone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { generateCentralResponse } from '../../lib/ai/generateCentralResponse';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// Respostas restritas para perfil financeiro
function generateFinanceOnlyResponse(question: string): string {
  const q = question.toLowerCase();
  const financeKeywords = [
    'financeiro','financeira','lançamento','lançamentos','receita','despesa',
    'conta','contas','pagar','receber','faturamento','lucro','custo',
    'saldo','inadimplência','inadimplente','cobrança','caixa','banco',
    'dre','fluxo','vencimento','pagamento','valor','boleto','pix',
  ];
  const isFinanceQuestion = financeKeywords.some(k => q.includes(k));

  if (!isFinanceQuestion) {
    return 'Acesso não autorizado para este perfil. Posso responder apenas dúvidas relacionadas ao módulo Financeiro. Tente perguntar sobre lançamentos, contas a pagar/receber, fluxo de caixa ou DRE.';
  }
  return generateCentralResponse(question);
}

const QUICK_QUESTIONS_FULL = [
  'Como está a operação hoje?',
  'Tem conta pra pagar hoje?',
  'Qual o maior risco atual?',
  'Como reduzir custos na frota?',
  'Qual cliente está em atraso?',
  'Onde devo agir primeiro?',
];

const QUICK_QUESTIONS_FINANCE = [
  'Tem conta pra pagar hoje?',
  'Qual cliente está em atraso?',
  'Como está o fluxo de caixa?',
  'Quais lançamentos estão pendentes?',
];

export function PergunteCentral() {
  const { profile } = useAuth();
  const isFinanceProfile = profile?.role === 'financeiro';

  const [isOpen, setIsOpen]     = useState(false);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    text: isFinanceProfile
      ? 'Olá! Sou a **Central IA Financeira**. Posso responder dúvidas sobre lançamentos, contas, fluxo de caixa e DRE do Grupo Esquematiza.'
      : 'Olá, Gestor. Sou a **Central IA**. Analisei os dados da operação de hoje. Como posso ajudar na sua tomada de decisão estratégica?',
  }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const response = isFinanceProfile
      ? generateFinanceOnlyResponse(text)
      : generateCentralResponse(text);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  const quickQuestions = isFinanceProfile ? QUICK_QUESTIONS_FINANCE : QUICK_QUESTIONS_FULL;

  return (
    <>
      {/* Botão flutuante */}
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
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                    {isFinanceProfile
                      ? <Lock className="w-5 h-5 text-amber-400" />
                      : <Sparkles className="w-5 h-5 text-emerald-500" />
                    }
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight">
                      {isFinanceProfile ? 'IA Financeira' : 'Pergunte à Central'}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 text-emerald-500">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {isFinanceProfile ? 'Módulo Financeiro' : 'IA Executiva'}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors relative z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso de restrição */}
            {isFinanceProfile && (
              <div className="px-4 py-2 bg-amber-900/20 border-b border-amber-800/30 flex items-center gap-2">
                <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-400 font-medium">Acesso restrito ao módulo Financeiro</p>
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[90%] ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-white rounded-tr-sm'
                      : 'bg-zinc-800 text-zinc-300 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                  {!isFinanceProfile && m.role === 'assistant' &&
                    ['Posto Alpha', 'falha de comunicação', 'risco crítico'].some(k => m.text.includes(k)) && (
                    <button
                      onClick={() => window.open('https://wa.me/5511999999999?text=Central+360°+detectou+alerta+operacional', '_blank')}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition">
                      <Phone className="w-3 h-3" /> Acionar Supervisor
                    </button>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="self-start flex items-center gap-2 text-zinc-400 text-sm p-4 bg-zinc-800 rounded-2xl rounded-tl-sm">
                  <span className="flex gap-1">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i} animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: d }}>.</motion.span>
                    ))}
                  </span>
                  Analisando...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map(q => (
                  <button key={q} onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-900/30 border border-zinc-700 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 text-xs rounded-full transition-all">
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder={isFinanceProfile ? 'Pergunte sobre o financeiro...' : 'Faça uma pergunta estratégica...'}
                  disabled={isLoading}
                />
                <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                  className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-lg">
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
