import React, { useState, useEffect } from 'react';
import { 
  Siren, 
  AlertTriangle, 
  ShieldAlert, 
  Phone, 
  Mic, 
  Video, 
  MessageSquare, 
  Send, 
  MapPin, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Radio, 
  Activity,
  History,
  Navigation,
  MoreVertical,
  Maximize2,
  Volume2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Mock Crisis Data
const ACTIVE_CRISIS = {
  id: 'CR-911-042',
  vigilante: 'Marcos Oliveira',
  posto: 'Centro Empresarial Rio - Setor G3',
  localizacao: 'Av. das Américas, 5000 - Barra da Tijuca',
  horario: '10:25:45',
  nivel: 'CRÍTICO',
  tipo: 'PÂNICO ACIONADO',
  status: 'EM RESPOSTA',
  bateria: '84%',
  sinal: 'FORTE',
  coordenadas: '-23.0001, -43.3658'
};

const CRISIS_FEED = [
  { id: 1, type: 'panic', label: 'Botão de Pânico Ativado', post: 'Barra Premium', time: '10:25', status: 'critical' },
  { id: 2, type: 'geofence', label: 'Geocerca Rompida', post: 'Shopping Américas', time: '10:22', status: 'high' },
  { id: 3, type: 'unresponsive', label: 'Posto Sem Resposta', post: 'Residencial Recreio', time: '10:18', status: 'high' },
  { id: 4, type: 'incident', label: 'Ocorrência Crítica', post: 'Guarita Norte', time: '10:10', status: 'medium' },
];

const CHAT_MESSAGES = [
  { id: 1, sender: 'Central', text: 'Marcos, recebemos seu alerta de pânico. Qual a situação?', time: '10:25:50', type: 'out' },
  { id: 2, sender: 'Vig. Marcos', text: 'Indivíduo armado tentando acesso pelo portão secundário.', time: '10:26:05', type: 'in' },
  { id: 3, sender: 'Central', text: 'Entendido. Apoio tático e Polícia Militar acionados. Mantenha-se em local seguro.', time: '10:26:15', type: 'out' },
  { id: 4, sender: 'Vig. Marcos', text: 'Copiado. Estou abrigado na guarita blindada.', time: '10:26:30', type: 'in' },
];

const CRISIS_TIMELINE = [
  { id: 1, event: 'Alerta de Pânico Recebido', time: '10:25:45', status: 'completed' },
  { id: 2, event: 'Central de Comando Ativada', time: '10:25:50', status: 'completed' },
  { id: 3, event: 'Supervisor Notificado', time: '10:26:10', status: 'completed' },
  { id: 4, event: 'Apoio Tático em Deslocamento', time: '10:26:45', status: 'current' },
  { id: 5, event: 'Caso Encerrado / Relatório', time: '--:--', status: 'pending' },
];

export function GestaoCrise() {
  const [pulse, setPulse] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] dark:bg-[#050505] -m-8 p-8 text-white font-sans overflow-hidden">
      {/* Tactical Header / Critical Alert */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "mb-8 p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 shadow-2xl",
          pulse ? "bg-red-950/40 dark:bg-red-950/20 border-red-600 shadow-red-900/20" : "bg-red-900/20 dark:bg-red-900/10 border-red-900 dark:border-red-900/50 shadow-transparent"
        )}
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
              pulse ? "bg-red-600 opacity-50" : "bg-red-900 opacity-20"
            )}></div>
            <div className="relative w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Siren className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                ALERTA CRÍTICO ATIVO
              </span>
              <span className="text-red-400 text-xs font-bold font-mono">{ACTIVE_CRISIS.id}</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              {ACTIVE_CRISIS.tipo}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8 border-l border-red-900/50 pl-8">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Vigilante</p>
            <p className="text-lg font-bold text-white leading-none">{ACTIVE_CRISIS.vigilante}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Posto Operacional</p>
            <p className="text-lg font-bold text-white leading-none">{ACTIVE_CRISIS.posto}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Horário do Evento</p>
            <p className="text-lg font-bold text-white leading-none font-mono">{ACTIVE_CRISIS.horario}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-white dark:bg-white/10 text-red-600 dark:text-red-500 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-50 dark:hover:bg-white/20 transition-all shadow-xl dark:shadow-none">
            ASSUMIR COMANDO
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-240px)]">
        
        {/* Left Column: Crisis Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#141414] dark:bg-[#0A0A0A] rounded-2xl border border-white/5 dark:border-white/10 p-5 flex-1 flex flex-col">
            <h3 className="text-xs font-black text-white/40 dark:text-white/50 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Painel de Resposta
            </h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
              {CRISIS_FEED.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer group",
                    item.status === 'critical' ? "bg-red-600/10 border-red-600/30 hover:bg-red-600/20" : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                      item.status === 'critical' ? "bg-red-600 text-white" : "bg-white/10 text-white/60"
                    )}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold text-white/30 font-mono">{item.time}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{item.label}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.post}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Status do Sistema</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3" /> OPERACIONAL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Conexão Satélite</span>
                <span className="text-blue-500 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3" /> CRIPTOGRAFADA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Command Center */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Video Feed Simulation */}
          <div className="bg-[#141414] dark:bg-[#0A0A0A] rounded-2xl border border-white/5 dark:border-white/10 overflow-hidden relative aspect-video group shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover opacity-60 dark:opacity-40 group-hover:scale-105 transition-transform duration-[10s]"
              alt="Tactical Feed"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            
            {/* HUD Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded text-[10px] font-black tracking-widest">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE FEED: CAM-042
              </div>
              <div className="bg-black/60 backdrop-blur px-3 py-1 rounded text-[10px] font-mono text-white/80">
                LAT: {ACTIVE_CRISIS.coordenadas}
              </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-2">
              <button className="p-2 bg-black/60 backdrop-blur rounded-lg hover:bg-white/10 transition-all">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-black/60 backdrop-blur rounded-lg hover:bg-white/10 transition-all">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Localização</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" /> {ACTIVE_CRISIS.localizacao}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-all">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tactical Chat */}
          <div className="bg-[#141414] dark:bg-[#0A0A0A] rounded-2xl border border-white/5 dark:border-white/10 flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 dark:border-white/10 flex items-center justify-between bg-white/2 dark:bg-white/5">
              <h3 className="text-[10px] font-black text-white/40 dark:text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Comunicação Tática
              </h3>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                VIGILANTE ONLINE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {CHAT_MESSAGES.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.type === 'out' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{msg.sender}</span>
                    <span className="text-[9px] font-bold text-white/20 font-mono">{msg.time}</span>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm font-medium",
                    msg.type === 'out' ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/5 text-white/80 rounded-tl-none border border-white/5"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/2 dark:bg-white/5 border-t border-white/5 dark:border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enviar comando tático..." 
                  className="w-full bg-white/5 dark:bg-[#141414] border border-white/10 dark:border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12 text-white placeholder-white/40"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Protocol */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#141414] dark:bg-[#0A0A0A] rounded-2xl border border-white/5 dark:border-white/10 p-5 flex-1 flex flex-col shadow-2xl">
            <h3 className="text-xs font-black text-white/40 dark:text-white/50 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              Timeline da Crise
            </h3>

            <div className="space-y-0 relative flex-1">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5"></div>
              {CRISIS_TIMELINE.map((step) => (
                <div key={step.id} className="relative pl-10 pb-8 last:pb-0">
                  <div className={cn(
                    "absolute left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#141414] shadow-sm z-10",
                    step.status === 'completed' ? "bg-emerald-500" : 
                    step.status === 'current' ? "bg-red-500 animate-pulse" : "bg-white/10"
                  )}></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-bold",
                      step.status === 'completed' ? "text-white/60" : 
                      step.status === 'current' ? "text-red-500" : "text-white/20"
                    )}>
                      {step.event}
                    </span>
                    <span className="text-[10px] font-bold text-white/20 font-mono">{step.time}</span>
                  </div>
                  {step.status === 'current' && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Ação Necessária</p>
                      <p className="text-[10px] text-white/60">Confirmar chegada da equipe de apoio no local.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <button className="w-full py-3 bg-white/5 dark:bg-white/10 border border-white/10 dark:border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                Ver no Mapa Global
              </button>
              <button className="w-full py-3 bg-red-600 dark:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 dark:hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 dark:shadow-none">
                ENCERRAR INCIDENTE
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
