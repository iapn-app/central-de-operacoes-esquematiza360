import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Eye, UserPlus, Users as UsersIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

export function Vigilantes() {
  const [isNewVigilanteModalOpen, setIsNewVigilanteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedVigilante, setSelectedVigilante] = useState<any | null>(null);
  const [vigilantes, setVigilantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVigilantes = vigilantes.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.posto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white">Gestão de Vigilantes</h1>
          <p className="text-gray-500 dark:text-gray-400">Controle de efetivo e status em tempo real.</p>
        </div>
        <button 
          onClick={() => setIsNewVigilanteModalOpen(true)}
          className="btn-primary"
        >
          <UserPlus className="w-5 h-5" />
          Cadastrar Vigilante
        </button>
      </div>

      <div className="card-premium">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou posto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white dark:placeholder-gray-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Vigilante</th>
                <th className="px-6 py-4 font-semibold">Posto Atual</th>
                <th className="px-6 py-4 font-semibold">Turno</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredVigilantes.length > 0 ? (
                filteredVigilantes.sort((a, b) => (b.score || 0) - (a.score || 0)).map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {v.nome.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{v.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{v.posto}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{v.turno}</td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-green">{v.score?.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        v.status === 'Ativo' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
                        v.status === 'Em ronda' && "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
                        v.status === 'Offline' && "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedVigilante(v)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green hover:bg-brand-green/10 dark:hover:bg-brand-green/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-soft-black dark:text-white">Nenhum vigilante encontrado</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Não há vigilantes cadastrados ou que correspondam à sua busca.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Exibindo {filteredVigilantes.length} vigilantes</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors" disabled>Anterior</button>
            <button className="px-3 py-1 border border-brand-green rounded bg-brand-green text-white">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" disabled>Próximo</button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isNewVigilanteModalOpen}
        onClose={() => setIsNewVigilanteModalOpen(false)}
        title="Cadastrar Novo Vigilante"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsNewVigilanteModalOpen(false); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors" placeholder="Ex: João da Silva" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posto de Trabalho</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors" placeholder="Ex: Condomínio Barra Premium" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turno</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option>12x36 Dia</option>
                <option>12x36 Noite</option>
                <option>8h Comercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option>Ativo</option>
                <option>Férias</option>
                <option>Afastado</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsNewVigilanteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors">Salvar Vigilante</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedVigilante}
        onClose={() => setSelectedVigilante(null)}
        title="Detalhes do Vigilante"
      >
        {selectedVigilante && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                {selectedVigilante.nome.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-soft-black dark:text-white">{selectedVigilante.nome}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVigilante.posto}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Turno</p>
                <p className="text-sm font-bold text-soft-black dark:text-white">{selectedVigilante.turno}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Score</p>
                <p className="text-sm font-bold text-brand-green">{selectedVigilante.score?.toFixed(1)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desempenho</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Pontualidade:</p>
                  <p className="font-bold text-soft-black dark:text-white">{selectedVigilante.pontualidade || '0%'}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Rondas:</p>
                  <p className="font-bold text-soft-black dark:text-white">{selectedVigilante.rondasRealizadas || 0}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Ocorrências:</p>
                  <p className="font-bold text-soft-black dark:text-white">{selectedVigilante.ocorrenciasRegistradas || 0}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Atrasos:</p>
                  <p className="font-bold text-soft-black dark:text-white">{selectedVigilante.atrasos || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setSelectedVigilante(null)}
                className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtrar Vigilantes"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="ronda">Em ronda</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Turno</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os turnos</option>
                <option value="12x36d">12x36 Dia</option>
                <option value="12x36n">12x36 Noite</option>
                <option value="8h">8h Comercial</option>
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
