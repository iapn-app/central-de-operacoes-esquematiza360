import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight,
  Activity,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';
import { RiskScoreBadge } from '../components/RiskScoreBadge';
import { getRiskBand } from '../utils/riskScore';

export function PostosClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosto, setSelectedPosto] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [postos, setPostos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial state is empty as requested for the first stage of real implementation
    setPostos([]);
    setLoading(false);
  }, []);

  const sortedPostos = [...postos].sort((a, b) => b.score - a.score);
  const filteredPostos = sortedPostos.filter(p => p.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

  const topCritical = sortedPostos.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <Building2 className="text-white w-7 h-7" />
            </div>
            Postos e Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Gestão de postos monitorados e análise preditiva de Score de Risco Operacional.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total de Postos</p>
            <h3 className="text-2xl font-black text-soft-black dark:text-white leading-tight">{postos.length}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Postos Críticos</p>
            <h3 className="text-2xl font-black text-soft-black dark:text-white leading-tight">
              {postos.filter(p => getRiskBand(p.score) === 'Crítico').length}
            </h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Média de Risco</p>
            <h3 className="text-2xl font-black text-soft-black dark:text-white leading-tight">
              {postos.length > 0 ? Math.round(postos.reduce((acc, curr) => acc + curr.score, 0) / postos.length) : 0}
            </h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Vigilantes Alocados</p>
            <h3 className="text-2xl font-black text-soft-black dark:text-white leading-tight">
              {postos.reduce((acc, curr) => acc + curr.vigilantes, 0)}
            </h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ranking de Risco */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-white/5">
              <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Ranking de Risco Crítico
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Postos que exigem atenção imediata.</p>
            </div>
            <div className="p-4 space-y-4">
              {topCritical.length > 0 ? topCritical.map((posto, index) => (
                <div key={posto.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    getRiskBand(posto.score) === 'Crítico' ? 'bg-red-500' : 'bg-orange-500'
                  )}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">#{index + 1} Maior Risco</span>
                      <span className="text-xs font-black text-soft-black dark:text-white">{posto.score}/100</span>
                    </div>
                    <h4 className="text-sm font-bold text-soft-black dark:text-white mb-1">{posto.cliente}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-500" /> {posto.ocorrencias30d} Ocorrências
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" /> {posto.rondasAtrasadas} Atrasos
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-500 text-xs font-medium">Nenhum posto crítico identificado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Postos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-green" />
                Todos os Postos
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar posto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
                  />
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg border border-gray-100 dark:border-white/10"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Posto / Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vigilantes</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ocorrências (30d)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Score de Risco</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {filteredPostos.map((posto) => (
                    <tr key={posto.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-soft-black dark:text-white">{posto.cliente}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{posto.tipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {posto.vigilantes}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-bold flex items-center gap-1.5",
                          posto.ocorrencias30d > 10 ? "text-red-600 dark:text-red-400" : posto.ocorrencias30d > 5 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          <AlertTriangle className="w-4 h-4" /> {posto.ocorrencias30d}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RiskScoreBadge score={posto.score} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedPosto(posto);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-colors inline-flex"
                          title="Ver Detalhes e Score"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPostos.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum posto encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Score */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Análise de Score de Risco"
        maxWidth="max-w-2xl"
      >
        {selectedPosto && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-xl font-black text-soft-black dark:text-white mb-1">{selectedPosto.cliente}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {selectedPosto.endereco}
                </p>
              </div>
              <div className="shrink-0">
                <RiskScoreBadge score={selectedPosto.score} className="px-4 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ocorrências (30d)</p>
                <p className="text-xl font-black text-soft-black dark:text-white">{selectedPosto.ocorrencias30d}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-center">
                <Clock className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Rondas Atrasadas</p>
                <p className="text-xl font-black text-soft-black dark:text-white">{selectedPosto.rondasAtrasadas}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-center">
                <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Horário de Pico</p>
                <p className="text-sm font-black text-soft-black dark:text-white mt-1">{selectedPosto.horarioPico}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 text-center">
                <Users className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Vigilantes</p>
                <p className="text-xl font-black text-soft-black dark:text-white">{selectedPosto.vigilantes}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-green" />
                Composição do Score
              </h4>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Peso: Histórico de Ocorrências (40%)</span>
                    <span className="text-soft-black dark:text-white">{Math.min(selectedPosto.ocorrencias30d * 4, 40)}/40</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(Math.min(selectedPosto.ocorrencias30d * 4, 40) / 40) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Peso: Falhas de Ronda (30%)</span>
                    <span className="text-soft-black dark:text-white">{Math.min(selectedPosto.rondasAtrasadas * 5, 30)}/30</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(Math.min(selectedPosto.rondasAtrasadas * 5, 30) / 30) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Peso: Vulnerabilidade de Efetivo (30%)</span>
                    <span className="text-soft-black dark:text-white">{Math.max(30 - (selectedPosto.vigilantes * 2), 0)}/30</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(Math.max(30 - (selectedPosto.vigilantes * 2), 0) / 30) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Fechar
              </button>
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  // Action to notify or create task
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
              >
                Gerar Plano de Ação
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Filtros */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Postos"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nível de Risco</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="todos">Todos os Níveis</option>
                <option value="critico">Crítico (&gt; 80)</option>
                <option value="alto">Alto (60-80)</option>
                <option value="medio">Médio (40-60)</option>
                <option value="baixo">Baixo (&lt; 40)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Posto</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="todos">Todos os Tipos</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="corporativo">Corporativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Limpar Filtros
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
