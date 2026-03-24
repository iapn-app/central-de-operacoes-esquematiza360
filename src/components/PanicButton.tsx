import React from 'react';
import { AlertTriangle, MapPin, Clock, Shield, Phone, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PanicButtonProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PanicButton({ isOpen, onClose }: PanicButtonProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-red-600 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Pulsing background effect */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-red-500 opacity-50 rounded-full"
          />

          <motion.div 
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="bg-red-700 p-8 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur">
                  <Siren className="w-10 h-10 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">ALERTA CRÍTICO</h2>
                  <p className="text-red-100 font-medium">BOTÃO DE PÂNICO ACIONADO</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <span className="sr-only">Fechar</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vigilante</label>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl">
                        RS
                      </div>
                      <div>
                        <p className="text-xl font-bold text-soft-black">Ricardo Santos</p>
                        <p className="text-sm text-gray-500">ID: 4429-X</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Posto / Localização</label>
                    <div className="flex items-start gap-3 mt-1">
                      <MapPin className="w-6 h-6 text-red-600 mt-1" />
                      <div>
                        <p className="text-xl font-bold text-soft-black">Shopping Central Plaza</p>
                        <p className="text-sm text-gray-500">Setor de Carga/Descarga - Docas 04</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Horário</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-5 h-5 text-red-600" />
                        <p className="text-xl font-bold text-soft-black">16:42:15</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                        <p className="text-xl font-bold text-red-600 uppercase">Em Emergência</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-2xl overflow-hidden relative min-h-[200px]">
                  <img 
                    src="https://picsum.photos/seed/panic/600/400" 
                    alt="Localização" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-2xl animate-bounce"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-200">
                  <Phone className="w-5 h-5" />
                  LIGAR PARA POSTO
                </button>
                <button className="flex items-center justify-center gap-2 bg-soft-black hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-gray-200">
                  <Shield className="w-5 h-5" />
                  ACIONAR REFORÇO
                </button>
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200">
                  <AlertTriangle className="w-5 h-5" />
                  POLÍCIA MILITAR
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
