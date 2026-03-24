import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Users, 
  UserMinus, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Clock, 
  Filter, 
  Search,
  MoreVertical,
  UserPlus,
  Shield,
  MapPin,
  CalendarDays,
  CalendarRange,
  CalendarClock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Mock Data for Schedules
const MOCK_SCHEDULE_STATS = [
  { label: 'Postos Cobertos', value: '64/67', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+2' },
  { label: 'Faltas Hoje', value: '03', icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50', trend: 'Atenção' },
  { label: 'Trocas Pendentes', value: '05', icon: ArrowLeftRight, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Urgente' },
  { label: 'Vigilantes Disponíveis', value: '18', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Reserva' },
];

const MOCK_POSTS_SCHEDULE = [
  { 
    id: 1, 
    post: 'Condomínio Barra Premium', 
    client: 'Barra Premium',
    shifts: [
      { id: 101, vigilante: 'Carlos Silva', time: '07:00 - 19:00', status: 'present', type: '12x36 D' },
      { id: 102, vigilante: 'André Santos', time: '19:00 - 07:00', status: 'present', type: '12x36 N' },
    ]
  },
  { 
    id: 2, 
    post: 'Shopping Américas', 
    client: 'Américas Mall',
    shifts: [
      { id: 201, vigilante: 'Marcos Oliveira', time: '08:00 - 20:00', status: 'absent', type: '12x36 D' },
      { id: 202, vigilante: 'Ricardo Alves', time: '20:00 - 08:00', status: 'present', type: '12x36 N' },
    ]
  },
  { 
    id: 3, 
    post: 'Centro Empresarial Rio', 
    client: 'Rio Office',
    shifts: [
      { id: 301, vigilante: 'Felipe Costa', time: '07:00 - 19:00', status: 'swap_pending', type: '12x36 D' },
      { id: 302, vigilante: 'Sérgio Costa', time: '19:00 - 07:00', status: 'present', type: '12x36 N' },
    ]
  },
  { 
    id: 4, 
    post: 'Residencial Recreio', 
    client: 'Recreio Life',
    shifts: [
      { id: 401, vigilante: 'João Pereira', time: '07:00 - 19:00', status: 'present', type: '12x36 D' },
      { id: 402, vigilante: 'VAGO', time: '19:00 - 07:00', status: 'uncovered', type: '12x36 N' },
    ]
  },
];

const PENDING_SWAPS = [
  { id: 1, from: 'Felipe Costa', to: 'Lucas Lima', date: '12 Mar', post: 'Centro Empresarial', status: 'waiting' },
  { id: 2, from: 'Roberto Dias', to: 'Carlos Silva', date: '15 Mar', post: 'Cond. Barra Premium', status: 'waiting' },
];

const REPLACEMENT_SUGGESTIONS = [
  { id: 1, name: 'Paulo Souza', distance: '2.4km', rating: 4.8, status: 'available' },
  { id: 2, name: 'Fernando Lima', distance: '3.1km', rating: 4.9, status: 'available' },
];

export function Escalas() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEscalaModalOpen, setIsNewEscalaModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [allocatingShift, setAllocatingShift] = useState<{post: string, shift: any} | null>(null);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <CalendarIcon className="text-white w-6 h-6" />
            </div>
            Gestão de Escalas Operacionais
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle de turnos, alocação de postos e substituições críticas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <button 
            onClick={() => setView('day')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'day' ? "bg-brand-green text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <CalendarClock className="w-4 h-4" />
            DIÁRIO
          </button>
          <button 
            onClick={() => setView('week')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'week' ? "bg-brand-green text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <CalendarRange className="w-4 h-4" />
            SEMANAL
          </button>
          <button 
            onClick={() => setView('month')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === 'month' ? "bg-brand-green text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            MENSAL
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {MOCK_SCHEDULE_STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-premium p-4 flex items-center gap-4 group"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 dark:bg-opacity-10 dark:text-opacity-90", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-soft-black dark:text-white">{stat.value}</h3>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  stat.color === 'text-emerald-500' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : 
                  stat.color === 'text-red-600' ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                )}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Schedule Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card-premium p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all dark:text-gray-300"><ChevronLeft className="w-5 h-5" /></button>
                <span className="font-bold text-soft-black dark:text-white min-w-[140px] text-center">10 de Março, 2026</span>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all dark:text-gray-300"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <button className="text-xs font-bold text-brand-green hover:underline">Ir para Hoje</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar posto ou vigilante..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-64 dark:text-white"
                />
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-brand-green transition-all"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsNewEscalaModalOpen(true)}
                className="bg-brand-green text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-green/20 flex items-center gap-2 hover:bg-brand-green/90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nova Escala
              </button>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Posto / Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Turno Diurno (07-19)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Turno Noturno (19-07)</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {MOCK_POSTS_SCHEDULE.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-soft-black dark:text-white">{item.post}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">{item.client}</p>
                        </div>
                      </div>
                    </td>
                    {item.shifts.map((shift) => (
                      <td key={shift.id} className="px-6 py-4">
                        <div className={cn(
                          "p-3 rounded-xl border transition-all relative overflow-hidden",
                          shift.status === 'present' ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm" :
                          shift.status === 'absent' ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" :
                          shift.status === 'swap_pending' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" :
                          "bg-gray-50 dark:bg-gray-800 border-dashed border-gray-300 dark:border-gray-700"
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">{shift.type}</span>
                            {shift.status === 'present' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            {shift.status === 'absent' && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
                            {shift.status === 'swap_pending' && <ArrowLeftRight className="w-3 h-3 text-amber-500" />}
                            {shift.status === 'uncovered' && <AlertCircle className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
                          </div>
                          <p className={cn(
                            "text-xs font-bold",
                            shift.status === 'uncovered' ? "text-gray-400 dark:text-gray-500 italic" : "text-soft-black dark:text-white"
                          )}>
                            {shift.vigilante}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{shift.time}</p>
                          
                          {shift.status === 'uncovered' && (
                            <button 
                              onClick={() => setAllocatingShift({ post: item.post, shift })}
                              className="mt-2 w-full py-1.5 bg-brand-green text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-brand-green/90 transition-all"
                            >
                              ALOCAR AGORA
                            </button>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Swaps & Suggestions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pending Swaps */}
          <div className="card-premium flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-amber-50/30 dark:bg-amber-500/10">
              <h3 className="font-bold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <ArrowLeftRight className="w-4 h-4" />
                Trocas Pendentes
              </h3>
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {PENDING_SWAPS.length}
              </span>
            </div>
            <div className="p-3 space-y-3">
              {PENDING_SWAPS.map((swap) => (
                <div key={swap.id} className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{swap.date}</span>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded">AGUARDANDO</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center flex-1">
                      <p className="text-[10px] font-bold text-soft-black dark:text-white truncate">{swap.from}</p>
                      <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase">Saindo</p>
                    </div>
                    <ArrowLeftRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                    <div className="text-center flex-1">
                      <p className="text-[10px] font-bold text-soft-black dark:text-white truncate">{swap.to}</p>
                      <p className="text-[8px] text-gray-400 dark:text-gray-500 uppercase">Entrando</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex gap-2">
                    <button className="flex-1 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-all">APROVAR</button>
                    <button className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">RECUSAR</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Replacement Suggestions */}
          <div className="card-premium flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-soft-black dark:text-white">
                <UserPlus className="w-4 h-4 text-brand-green" />
                Sugestões de Reserva
              </h3>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Disponíveis</span>
            </div>
            <div className="p-3 space-y-3">
              {REPLACEMENT_SUGGESTIONS.map((sug) => (
                <div key={sug.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-brand-green/20 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-xs">
                      {sug.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-soft-black dark:text-white truncate">{sug.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {sug.distance}
                        </span>
                        <span className="text-[9px] text-amber-500 font-bold">★ {sug.rating}</span>
                      </div>
                    </div>
                    <button className="p-1.5 bg-white dark:bg-gray-800 rounded-lg text-brand-green opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 dark:border-gray-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-brand-green transition-all uppercase tracking-widest">
                Ver Todos Disponíveis
              </button>
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isNewEscalaModalOpen}
        onClose={() => setIsNewEscalaModalOpen(false)}
        title="Criar Nova Escala"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsNewEscalaModalOpen(false); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posto de Trabalho</label>
            <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
              <option>Selecione um posto...</option>
              <option>Condomínio Barra Premium</option>
              <option>Shopping Américas</option>
              <option>Centro Empresarial Rio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vigilante</label>
            <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
              <option>Selecione um vigilante...</option>
              <option>Carlos Silva</option>
              <option>André Santos</option>
              <option>Marcos Oliveira</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
              <input type="date" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turno</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option>12x36 Dia (07:00 - 19:00)</option>
                <option>12x36 Noite (19:00 - 07:00)</option>
                <option>Comercial (08:00 - 18:00)</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsNewEscalaModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors">Salvar Escala</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!allocatingShift}
        onClose={() => setAllocatingShift(null)}
        title="Alocar Vigilante Substituto"
      >
        {allocatingShift && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Posto Descoberto</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">{allocatingShift.post} • {allocatingShift.shift.type} ({allocatingShift.shift.time})</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Vigilantes Disponíveis (Reserva)</h4>
              <div className="space-y-3">
                {REPLACEMENT_SUGGESTIONS.map((sug) => (
                  <div key={sug.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {sug.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-soft-black dark:text-white">{sug.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{sug.distance} de distância</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAllocatingShift(null)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg group-hover:bg-brand-green group-hover:text-white transition-colors"
                    >
                      Selecionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setAllocatingShift(null)}
                className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Escala"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status do Turno</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os status</option>
                <option value="present">Presente</option>
                <option value="absent">Falta</option>
                <option value="swap_pending">Troca Pendente</option>
                <option value="uncovered">Descoberto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cliente</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os clientes</option>
                <option value="barra_premium">Barra Premium</option>
                <option value="americas_mall">Américas Mall</option>
                <option value="rio_office">Rio Office</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Limpar
            </button>
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
