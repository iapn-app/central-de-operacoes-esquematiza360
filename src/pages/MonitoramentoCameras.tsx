import React, { useState, useEffect } from 'react';
import { Camera, Search, Filter, Circle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function MonitoramentoCameras() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cameras, setCameras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCameras = cameras.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <Camera className="text-white w-7 h-7" />
            </div>
            Monitoramento por Câmeras
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Central de monitoramento em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar câmera..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCameras.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <motion.div 
              key={camera.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
            >
              <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                {camera.status === 'online' ? (
                  <div className="text-brand-green/50 font-mono text-xs">FEED AO VIVO</div>
                ) : (
                  <div className="text-gray-600 flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-xs">Offline</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Circle className={cn("w-2 h-2", camera.status === 'online' ? "fill-brand-green text-brand-green" : "fill-red-500 text-red-500")} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{camera.status}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-soft-black dark:text-white">{camera.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{camera.location}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">Última atividade: {camera.lastActivity}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 p-20 text-center">
          <Camera className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-soft-black dark:text-white">Nenhuma câmera encontrada</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Não há câmeras cadastradas ou que correspondam à sua busca.</p>
        </div>
      )}
    </div>
  );
}
