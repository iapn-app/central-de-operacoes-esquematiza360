import React, { useState } from 'react';
import { Map, Clock, Navigation, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function RotasInteligentes() {
  const [selectedRota, setSelectedRota] = useState<any>(null);
  const [rotasSugeridas, setRotasSugeridas] = useState<any[]>([]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">Rotas Inteligentes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Otimização de deslocamento para supervisores de campo.</p>
        </div>
        <button className="px-6 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-brand-green/20">
          Gerar Nova Rota
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Rotas */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-soft-black dark:text-white">Sugestões do Dia</h2>
          {rotasSugeridas.length > 0 ? rotasSugeridas.map((rota) => (
            <motion.div 
              key={rota.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedRota(rota)}
              className={cn(
                "p-5 rounded-2xl border cursor-pointer transition-all",
                selectedRota?.id === rota.id 
                  ? "bg-brand-green/5 border-brand-green shadow-md" 
                  : "bg-white dark:bg-[#141414] border-gray-100 dark:border-white/5 hover:border-gray-200"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-soft-black dark:text-white">{rota.nome}</h3>
                <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-md">{rota.distancia}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {rota.tempoTotal}</div>
                <div className="flex items-center gap-1.5"><Map className="w-4 h-4" /> {rota.postos?.length || 0} postos</div>
              </div>
            </motion.div>
          )) : (
            <div className="py-10 text-center text-gray-500 text-xs font-medium">
              Nenhuma rota sugerida para hoje.
            </div>
          )}
        </div>

        {/* Detalhes da Rota e Mapa */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRota ? (
            <>
              <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <h2 className="text-xl font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
                  <Navigation className="w-6 h-6 text-brand-green" />
                  Sequência de Deslocamento
                </h2>
                <div className="space-y-3">
                  {selectedRota.postos?.map((posto: any, index: number) => (
                    <div key={posto.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-soft-black dark:text-white">{posto.nome}</p>
                        <p className="text-xs text-gray-500">Tempo estimado de visita: 30 min</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mapa Simulado */}
              <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-8 h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-bold">Visualização do Mapa</p>
                  <p className="text-sm">Rota sugerida traçada sobre o mapa da região.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12">
              <Navigation className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-bold">Selecione uma rota para visualizar os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
