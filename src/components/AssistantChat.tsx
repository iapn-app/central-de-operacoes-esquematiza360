import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, ChevronRight, Mic, Phone } from 'lucide-react';
import { generateCentralResponse } from "../../lib/ai/generateCentralResponse";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}


export function PergunteCentral() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: 'Olá, Gestor. Sou a **Central IA**. Analisei os dados da operação de hoje. Como posso ajudar na sua tomada de decisão estratégica?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Simular delay de 700ms
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const aiResponse = generateCentralResponse(userMessage);
    
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] flex items-center justify-center z-50 transition-all hover:scale-105 group border border-zinc-700"
      >
        <Sparkles className="w-7 h-7 text-emerald-500 group-hover:animate-pulse" />
        <span className="absolute right-full mr-4 bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 shadow-xl flex items-center gap-2">
          Pergunte à Central <ChevronRight size={14} className="text-emerald-500" />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-zinc-950 shadow-2xl z-[60] border-l border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center shadow-inner border border-zinc-800">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight">Pergunte à Central</h2>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> IA Executiva
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6" ref={scrollRef}>
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn("flex flex-col max-w-[90%]", m.role === 'user' ? "self-end items-end" : "self-start items-start")}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm", 
                    m.role === 'user' 
                      ? "bg-zinc-900 text-white rounded-tr-sm" 
                      : "bg-zinc-800 text-zinc-300 rounded-tl-sm"
                  )}>
                    {m.text}
                  </div>
                  {m.role === 'assistant' && ["Posto Alpha", "risco crítico", "falha de comunicação", "supervisor"].some(keyword => m.text.toLowerCase().includes(keyword.toLowerCase())) && (
                    <button
                      onClick={() => window.open("https://wa.me/5511999999999?text=Olá%20Ricardo%20Mendes.%20A%20Central%20360°%20detectou%20falha%20de%20comunicação%20no%20Posto%20Alpha%20há%2030%20minutos.%20Favor%20verificar%20imediatamente.", '_blank')}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                    >
                      <Phone className="w-3 h-3" />
                      Acionar Supervisor via WhatsApp
                    </button>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="self-start flex items-center gap-2 text-zinc-400 text-sm p-4 bg-zinc-800 rounded-2xl rounded-tl-sm">
                  <span className="flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                  </span>
                  Analisando o contexto operacional da Central 360°...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Como está a operação hoje?",
                  "Tem conta pra pagar hoje?",
                  "Qual o maior risco atual?",
                  "Como reduzir custos na frota?",
                  "Qual cliente está em atraso?",
                  "Onde devo agir primeiro?"
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => {
                      setInput(question);
                      // Trigger send after a short delay to allow state update
                      setTimeout(() => {
                        const sendButton = document.getElementById('send-button');
                        if (sendButton) (sendButton as HTMLButtonElement).click();
                      }, 100);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-emerald-900/30 border border-zinc-700 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 text-xs rounded-full transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 pl-4 pr-24 py-4 rounded-2xl border border-zinc-700 bg-zinc-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                  placeholder="Faça uma pergunta estratégica..."
                  disabled={isLoading}
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button 
                    onClick={() => {
                      const message = "Olá Ricardo Mendes. A Central 360° detectou falha de comunicação no Posto Alpha há 30 minutos. Favor verificar imediatamente.";
                      const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
                      window.open(url, '_blank');
                    }}
                    className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors"
                    title="Acionar Supervisor"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    id="send-button"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
