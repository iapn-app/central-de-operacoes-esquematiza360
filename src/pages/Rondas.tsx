import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  Search, 
  Filter, 
  ChevronRight, 
  Navigation, 
  AlertTriangle, 
  Activity,
  MoreVertical,
  History,
  LayoutGrid,
  List,
  Eye,
  ShieldAlert,
  User,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Data for Advanced Patrols (Initial empty state)
const MOCK_RONDAS_DETALHADAS: any[] = [];

export function Rondas() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedRonda, setSelectedRonda] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizada': return 'bg-emerald-500';
      case 'pendente': return 'bg-gray-400';
      case 'atrasada': return 'bg-orange-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'critica': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'realizada': return 'Realizada';
      case 'pendente': return 'Pendente';
      case 'atrasada': return 'Atrasada';
      case 'em_andamento': return 'Em Andamento';
      case 'critica': return 'Crítica';
      default: return status;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'realizada': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pendente': return 'bg-gray-50 text-gray-600 border-gray-100';
      case 'atrasada': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'em_andamento': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'critica': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">Monitoramento de Rondas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestão operacional e conformidade de patrulhamento preventivo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-[#141414] p-1 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-brand-green text-white shadow-md" : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-brand-green text-white shadow-md" : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-green/20 dark:shadow-none flex items-center gap-2 hover:bg-brand-green/90 transition-all"
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Hoje', value: '0', color: 'text-soft-black dark:text-white', bg: 'bg-white dark:bg-[#141414]' },
          { label: 'Realizadas', value: '0', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Em Andamento', value: '0', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Atrasadas', value: '0', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { label: 'Críticas', value: '0', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm", stat.bg)}>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={cn("text-2xl font-bold", stat.color)}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Patrols List/Grid */}
        <div className={cn("lg:col-span-2 space-y-4", viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0")}>
          <div className={cn("flex items-center justify-between mb-2", viewMode === 'grid' && "col-span-full")}>
            <h3 className="font-bold text-soft-black dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              Rondas do Dia
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar posto..." 
                  className="pl-10 pr-4 py-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-48 dark:text-white dark:placeholder-gray-500"
                />
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="p-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green transition-all"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {MOCK_RONDAS_DETALHADAS.length > 0 ? (
            MOCK_RONDAS_DETALHADAS.map((ronda) => (
              <motion.div
                layout
                key={ronda.id}
                onClick={() => setSelectedRonda(ronda.id)}
                className={cn(
                  "card-premium p-5 cursor-pointer transition-all border-l-4 group relative overflow-hidden",
                  selectedRonda === ronda.id ? "ring-2 ring-brand-green ring-offset-2" : "hover:shadow-md",
                  ronda.status === 'realizada' && "border-l-emerald-500",
                  ronda.status === 'pendente' && "border-l-gray-300",
                  ronda.status === 'atrasada' && "border-l-orange-500",
                  ronda.status === 'em_andamento' && "border-l-blue-500",
                  ronda.status === 'critica' && "border-l-red-600",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getStatusBg(ronda.status), "dark:bg-opacity-10")}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-soft-black dark:text-white group-hover:text-brand-green dark:group-hover:text-brand-green transition-colors">{ronda.posto}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {ronda.vigilante}
                      </p>
                    </div>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border", getStatusBg(ronda.status), "dark:bg-opacity-10")}>
                    {getStatusLabel(ronda.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Previsto</p>
                    <p className="text-xs font-bold text-soft-black dark:text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ronda.horarioPrevisto}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Realizado</p>
                    <p className="text-xs font-bold text-soft-black dark:text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {ronda.horarioRealizado}
                    </p>
                  </div>
                </div>

                {ronda.status === 'critica' && (
                  <div className="mb-4 p-2 bg-red-600 text-white rounded-lg flex items-center gap-2 animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{ronda.alert}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {ronda.checkpoints.map((cp: any) => (
                        <div 
                          key={cp.id} 
                          className={cn(
                            "w-2.5 h-2.5 rounded-full border border-white dark:border-[#141414]",
                            cp.status === 'ok' ? "bg-emerald-500" : cp.status === 'critical' ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"
                          )}
                        ></div>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {ronda.checkpoints.filter((c: any) => c.status === 'ok' || c.status === 'critical').length}/{ronda.checkpoints.length} Checkpoints
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-green dark:group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-20 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-soft-black dark:text-white">Nenhuma ronda registrada</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Não há rondas programadas ou realizadas para o período selecionado.</p>
            </div>
          )}
        </div>

        {/* Details & Timeline Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedRonda ? (
              <motion.div
                key={selectedRonda}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card-premium h-full flex flex-col sticky top-24"
              >
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-soft-black dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-brand-green" />
                    Detalhes da Ronda
                  </h3>
                  <button 
                    onClick={() => setSelectedRonda(null)}
                    className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                  >
                    Fechar
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                  {/* Info Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">ID: {selectedRonda}</span>
                      <span className={cn(
                        "w-3 h-3 rounded-full",
                        getStatusColor(MOCK_RONDAS_DETALHADAS.find(r => r.id === selectedRonda)?.status || '')
                      )}></span>
                    </div>
                    <h4 className="text-xl font-bold text-soft-black dark:text-white mb-1">
                      {MOCK_RONDAS_DETALHADAS.find(r => r.id === selectedRonda)?.posto}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Vigilante: <span className="font-bold text-soft-black dark:text-white">{MOCK_RONDAS_DETALHADAS.find(r => r.id === selectedRonda)?.vigilante}</span>
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-6">
                    <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Timeline da Ronda
                    </h5>
                    <div className="space-y-0 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-white/10"></div>
                      {MOCK_RONDAS_DETALHADAS.find(r => r.id === selectedRonda)?.checkpoints.map((cp, i) => (
                        <div key={cp.id} className="relative pl-10 pb-6 last:pb-0">
                          <div className={cn(
                            "absolute left-[13px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#141414] shadow-sm z-10",
                            cp.status === 'ok' ? "bg-emerald-500" : cp.status === 'critical' ? "bg-red-600" : "bg-gray-300 dark:bg-gray-700"
                          )}></div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-soft-black dark:text-white">{cp.local}</span>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{cp.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {cp.status === 'ok' && 'Checkpoint validado via NFC.'}
                            {cp.status === 'critical' && 'ALERTA: GEOCERCA ROMPIDA!'}
                            {cp.status === 'pending' && 'Aguardando validação.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                    <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Observações Operacionais</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{MOCK_RONDAS_DETALHADAS.find(r => r.id === selectedRonda)?.observacoes}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      onClick={() => setIsMapModalOpen(true)}
                      className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                      <MapIcon className="w-4 h-4" />
                      Ver no Mapa
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                      <MoreVertical className="w-4 h-4" />
                      Mais Ações
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card-premium h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-white/5 border-dashed border-2 border-gray-200 dark:border-white/10">
                <div className="w-16 h-16 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-soft-black dark:text-white mb-2">Selecione uma Ronda</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Clique em uma ronda na lista ao lado para visualizar o detalhamento completo, timeline de checkpoints e conformidade operacional.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Histórico de Rondas"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <input type="date" className="px-3 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" />
            <select className="px-3 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
              <option>Todos os Postos</option>
              <option>Condomínio Barra Premium</option>
              <option>Shopping Américas</option>
            </select>
            <button className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-bold hover:bg-brand-green/90 transition-colors">Filtrar</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Data/Hora</th>
                  <th className="px-4 py-3 font-semibold">Posto</th>
                  <th className="px-4 py-3 font-semibold">Vigilante</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">09/03/2026 10:00</td>
                    <td className="px-4 py-3 text-sm font-medium text-soft-black dark:text-white">Condomínio Barra Premium</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Carlos Silva</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Realizada
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Mapa da Ronda"
        maxWidth="max-w-4xl"
      >
        <div className="h-[500px] rounded-xl overflow-hidden relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58751.06540125642!2d-43.4350!3d-23.0100!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bd0a2c2665973%3A0x88969f6a5b29013e!2sBarra%20da%20Tijuca%2C%20Rio%20de%20Janeiro%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[1.1] dark:invert dark:hue-rotate-180 dark:opacity-80"
          ></iframe>
          
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-soft-black dark:text-white mb-1">Rota da Ronda</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">4 Checkpoints validados</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Rondas"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status da Ronda</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os status</option>
                <option value="realizada">Realizada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="atrasada">Atrasada</option>
                <option value="critica">Crítica</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os postos</option>
                <option value="barra_premium">Condomínio Barra Premium</option>
                <option value="shopping_americas">Shopping Américas</option>
                <option value="centro_empresarial">Centro Empresarial Rio</option>
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
