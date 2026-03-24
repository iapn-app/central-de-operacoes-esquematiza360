import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  ShieldAlert, 
  Car, 
  Users, 
  DollarSign, 
  Wrench, 
  Map, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Filter,
  RefreshCw,
  Zap,
  Clock,
  MapPin,
  AlertOctagon,
  MessageSquare,
  Send,
  Target,
  BarChart3,
  ChevronRight,
  Sparkles,
  Search,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';
import { geminiService } from '../services/geminiService';

const CATEGORIAS = [
  { id: 'Todos', label: 'Todos', icon: Brain },
  { id: 'Operação', label: 'Operação', icon: ShieldAlert },
  { id: 'Frota', label: 'Frota', icon: Car },
  { id: 'RH', label: 'RH', icon: Users },
  { id: 'Financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'Manutenção', label: 'Manutenção', icon: Wrench },
  { id: 'Rondas', label: 'Rondas', icon: Map },
  { id: 'Contratos', label: 'Contratos', icon: TrendingUp }
];

export function InteligenciaOperacional() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [intelligence, setIntelligence] = useState<any>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = {
        vigilantes: [],
        ocorrencias: [],
        postos: [],
        timestamp: new Date().toISOString()
      };
      
      const result = await geminiService.generateAdvancedIntelligence(data);
      if (result) {
        setIntelligence(result);
      }
    } catch (error) {
      console.error("Error refreshing advanced intelligence:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const message = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsTyping(true);

    try {
      const context = {
        intelligence: intelligence,
        activeCategory: activeCategory,
        timestamp: new Date().toISOString()
      };
      const response = await geminiService.chatWithCentral(message, context);
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredInsights = activeCategory === 'Todos' 
    ? intelligence?.insights || []
    : (intelligence?.insights || []).filter((i: any) => i.area === activeCategory);

  const getAreaIcon = (area: string) => {
    const cat = CATEGORIAS.find(c => c.id === area);
    return cat ? cat.icon : Brain;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-green/20">
              Módulo Advanced Intelligence
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Último Diagnóstico: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <h1 className="text-4xl font-black text-soft-black dark:text-white flex items-center gap-4 tracking-tighter">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-green to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-green/30">
              <Brain className="text-white w-8 h-8" />
            </div>
            Inteligência Operacional Avançada
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-base max-w-3xl font-medium leading-relaxed">
            O cérebro analítico do <span className="text-brand-green font-bold">ESQUEMATIZA CENTRAL 360</span>. 
            Processamento em tempo real de padrões, riscos e oportunidades estratégicas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-3 px-6 py-3.5 bg-brand-green text-white rounded-2xl text-sm font-black hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Processando Big Data..." : "Atualizar Diagnóstico"}
          </button>
        </div>
      </div>

      {/* Strategic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          {intelligence?.atencaoImediata?.map((card: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "rounded-2xl p-6 shadow-lg relative overflow-hidden group border",
                card.impacto === 'Crítico' 
                  ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-red-500/30" 
                  : "bg-white dark:bg-[#141414] border-gray-100 dark:border-white/5"
              )}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                    card.impacto === 'Crítico' ? "bg-white/20 text-white" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                  )}>
                    {card.impacto}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    card.impacto === 'Crítico' ? "text-red-100" : "text-gray-400"
                  )}>
                    {card.categoria}
                  </span>
                </div>
                <h3 className={cn("text-lg font-black mb-2", card.impacto === 'Crítico' ? "text-white" : "text-soft-black dark:text-white")}>
                  {card.titulo}
                </h3>
                <p className={cn("text-xs leading-relaxed", card.impacto === 'Crítico' ? "text-red-50" : "text-gray-500 dark:text-gray-400")}>
                  {card.descricao}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-green/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Zap className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Eficiência Projetada</p>
            <h3 className="text-4xl font-black mb-2">+{intelligence?.eficienciaProjetada || 0}%</h3>
            <p className="text-xs text-emerald-50 leading-relaxed">Ganho operacional estimado ao aplicar as recomendações da IA.</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Previsão de Ocorrências */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#141414] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-soft-black dark:text-white flex items-center gap-3">
                <AlertOctagon className="w-7 h-7 text-red-500" />
                Previsão de Ocorrências (Próximas 72h)
              </h3>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <BarChart3 className="w-4 h-4" />
                Análise Preditiva
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {intelligence?.previsoesOcorrencias?.map((previsao: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-red-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider",
                      previsao.probabilidade === 'Alta' ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    )}>
                      {previsao.probabilidade} Probabilidade
                    </span>
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <h4 className="font-black text-soft-black dark:text-white text-lg mb-1">{previsao.posto}</h4>
                  <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Janela Crítica: {previsao.horario}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-red-500/30 pl-3">
                    {previsao.motivo}
                  </p>
                </div>
              ))}
              {(!intelligence?.previsoesOcorrencias || intelligence.previsoesOcorrencias.length === 0) && (
                <div className="col-span-2 py-10 text-center text-gray-500 text-xs font-medium">
                  Nenhuma previsão de ocorrência disponível.
                </div>
              )}
            </div>
          </div>

          {/* Oportunidades de Otimização */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-soft-black dark:text-white flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-amber-500" />
                Oportunidades de Otimização
              </h3>
              <TrendingUp className="w-6 h-6 text-brand-green" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {intelligence?.oportunidadesOtimizacao?.map((opt: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 hover:border-brand-green transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-soft-black dark:text-white text-lg leading-tight group-hover:text-brand-green transition-colors">{opt.titulo}</h4>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Economia Est.</p>
                      <p className="text-sm font-black text-emerald-600">{opt.economiaEstimada}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    {opt.descricao}
                  </p>
                  <button className="flex items-center gap-2 text-xs font-black text-brand-green uppercase tracking-widest hover:gap-3 transition-all">
                    Ver Plano de Ação <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!intelligence?.oportunidadesOtimizacao || intelligence.oportunidadesOtimizacao.length === 0) && (
                <div className="col-span-2 py-10 text-center text-gray-500 text-xs font-medium">
                  Nenhuma oportunidade de otimização identificada.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pergunte à Central - IA Conversacional */}
        <div className="flex flex-col bg-white dark:bg-[#141414] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden h-[800px]">
          <div className="p-6 bg-gradient-to-r from-soft-black to-gray-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Pergunte à Central</h3>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  IA Online e Analisando
                </p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-brand-green" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="font-bold text-soft-black dark:text-white mb-2">Como posso ajudar hoje?</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pergunte sobre riscos em postos, performance de equipes ou sugestões de redução de custos.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                  {[
                    "Quais os postos com maior risco hoje?",
                    "Como reduzir custos na frota?",
                    "Analise a performance da Equipe Sul"
                  ].map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setUserInput(q);
                      }}
                      className="text-[10px] font-bold text-left p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:border-brand-green transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-brand-green text-white rounded-tr-none shadow-lg shadow-brand-green/10" 
                    : "bg-gray-100 dark:bg-white/5 text-soft-black dark:text-gray-300 rounded-tl-none border border-gray-200 dark:border-white/10"
                )}>
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                  {msg.role === 'user' ? "Você" : "Central IA"} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-gray-200 dark:border-white/10">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
            <div className="relative">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua pergunta estratégica..."
                className="w-full pl-4 pr-12 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all shadow-sm"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-green text-white rounded-xl flex items-center justify-center hover:bg-brand-green/90 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {intelligence?.alertasInteligentes?.map((alerta: any, i: number) => (
          <div key={i} className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4 group hover:border-brand-green/30 transition-all">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              alerta.urgencia === 'Alta' ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-brand-green/10 text-brand-green"
            )}>
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-soft-black dark:text-white mb-1">{alerta.titulo}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{alerta.mensagem}</p>
              <button className="text-[10px] font-black text-brand-green uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                {alerta.cta} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Categoria Filters & Insights Grid */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border uppercase tracking-widest",
                  activeCategory === cat.id
                    ? "bg-soft-black dark:bg-white text-white dark:text-soft-black shadow-xl border-soft-black dark:border-white"
                    : "bg-white dark:bg-[#141414] text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/10"
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar insights..."
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all w-full md:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredInsights.map((insight: any, index: number) => {
              const Icon = getAreaIcon(insight.area);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={insight.id || index}
                  className="bg-white dark:bg-[#141414] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl hover:border-brand-green/20 transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{insight.area}</span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            insight.tipo === 'alerta' ? "bg-red-500" : insight.tipo === 'sugestao' ? "bg-amber-500" : "bg-blue-500"
                          )}></div>
                        </div>
                        <h3 className="font-black text-soft-black dark:text-white leading-tight group-hover:text-brand-green transition-colors">{insight.titulo}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1 leading-relaxed">
                    {insight.descricao}
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                        insight.impacto === 'Alto' ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                        insight.impacto === 'Médio' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      )}>
                        Impacto {insight.impacto}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedInsight(insight);
                        setIsActionModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-brand-green hover:text-white text-soft-black dark:text-gray-300 rounded-xl text-xs font-black transition-all group/btn"
                    >
                      <span>{insight.acao}</span>
                      <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Executar Recomendação IA"
        maxWidth="max-w-md"
      >
        {selectedInsight && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-soft-black dark:text-white leading-tight">{selectedInsight.titulo}</h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedInsight.area}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {selectedInsight.descricao}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-soft-black dark:text-white uppercase tracking-widest">Ação Estratégica:</h4>
              <div className="p-5 rounded-2xl bg-brand-green text-white font-black text-sm shadow-xl shadow-brand-green/20">
                {selectedInsight.acao}
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  Esta ação foi gerada pelo motor preditivo do ESQUEMATIZA 360. A execução será registrada em log de auditoria para acompanhamento de ROI operacional.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => setIsActionModalOpen(false)}
                className="px-6 py-3 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setIsActionModalOpen(false);
                }}
                className="px-8 py-3 rounded-xl text-xs font-black bg-soft-black dark:bg-white text-white dark:text-soft-black hover:opacity-90 transition-all uppercase tracking-widest shadow-xl"
              >
                Confirmar Execução
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
