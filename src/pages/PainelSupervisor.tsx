import React, { useState, useEffect } from 'react';
import { 
  Navigation,
  RefreshCw,
  Map as MapIcon,
  Flag,
  AlertCircle,
  MapPin,
  Users,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const RouteIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10b981; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

// Component to center map on route
const RecenterMap = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

export function PainelSupervisor() {
  const [loading, setLoading] = useState(false);
  const [tacticalData, setTacticalData] = useState<any>(null);
  const [selectedPosto, setSelectedPosto] = useState<any>(null);

  const fetchTacticalData = async () => {
    setLoading(true);
    // Real implementation would fetch from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTacticalData();
  }, []);

  const routePoints: [number, number][] = tacticalData?.rotaSugerida?.map((p: any) => [p.lat, p.lng]) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Tático */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green text-white rounded-2xl shadow-lg shadow-emerald-200">
            <Navigation size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Central de Decisão Tática</h1>
            <p className="text-sm text-slate-500 font-medium">Comando e Controle de Supervisão de Campo</p>
          </div>
        </div>

        <button 
          onClick={fetchTacticalData}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          RECALCULAR PRIORIDADES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Prioridades e Mapa */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mapa de Rota Sugerida */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-[400px] relative">
            <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MapIcon size={14} className="text-brand-green" />
                Rota Tática Sugerida
              </h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                IA otimizou seu deslocamento priorizando postos com anomalias críticas detectadas nos últimos 60 min.
              </p>
            </div>
            
            <MapContainer 
              center={[-23.5505, -46.6333]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {routePoints.length > 0 && (
                <>
                  <Polyline positions={routePoints} color="#10b981" weight={4} opacity={0.6} dashArray="10, 10" />
                  {tacticalData.rotaSugerida.map((p: any, i: number) => (
                    <Marker key={i} position={[p.lat, p.lng]} icon={RouteIcon}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-bold text-xs">{p.nome}</p>
                          <p className="text-[10px] text-slate-500">Parada #{i + 1}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <RecenterMap points={routePoints} />
                </>
              )}
            </MapContainer>
          </div>

          {/* Ranking de Prioridades */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Flag size={18} className="text-red-500" />
                Ranking de Prioridades de Visita
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baseado em Risco Operacional</span>
            </div>
            <div className="divide-y divide-slate-50">
              {tacticalData?.prioridadesVisita?.length > 0 ? (
                tacticalData.prioridadesVisita.map((posto: any, idx: number) => (
                  <motion.div 
                    key={posto.id}
                    onClick={() => setSelectedPosto(posto)}
                    className={cn(
                      "p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 group",
                      selectedPosto?.id === posto.id && "bg-emerald-50/50 border-l-4 border-emerald-500"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm",
                        idx === 0 ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{posto.nome}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle size={10} className={posto.risco > 80 ? 'text-red-500' : 'text-amber-500'} />
                            Risco: {posto.risco}%
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">•</span>
                          <span className="text-[10px] font-medium text-slate-500 italic">{posto.motivo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impacto</p>
                        <p className="text-[10px] font-black text-red-600">{posto.impacto}</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <Flag size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Nenhuma prioridade de visita identificada no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Detalhes do Posto e Checklist */}
        <div className="space-y-8">
          {/* Card de Ação do Posto Selecionado */}
          <AnimatePresence mode="wait">
            {selectedPosto ? (
              <motion.div 
                key={selectedPosto.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black bg-red-600 px-3 py-1 rounded-full uppercase tracking-widest">Urgente</span>
                    <MapPin size={20} className="text-emerald-400" />
                  </div>
                  
                  <h2 className="text-xl font-black mb-2 uppercase italic">{selectedPosto.nome}</h2>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    {selectedPosto.recomendacao}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Checklist de Visita IA</h4>
                      <div className="space-y-2">
                        {tacticalData?.checklistVisita?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center">
                              {item.obrigatorio && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                            </div>
                            <span className="text-[10px] text-slate-300">{item.item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3">
                    <Navigation size={18} />
                    INICIAR DESLOCAMENTO
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white text-center py-20">
                <Navigation size={32} className="text-slate-700 mx-auto mb-4" />
                <p className="text-xs text-slate-500">Selecione um posto para ver detalhes da ação tática.</p>
              </div>
            )}
          </AnimatePresence>

          {/* Vigilantes em Alerta */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              Vigilantes em Alerta
            </h3>
            <div className="space-y-4">
              {tacticalData?.vigilantesAlerta?.length > 0 ? (
                tacticalData.vigilantesAlerta.map((v: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400">
                      {v.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{v.nome}</h4>
                      <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{v.problema}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{v.posto}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum alerta de efetivo.</p>
              )}
            </div>
          </div>

          {/* Insights Táticos */}
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Zap size={18} className="text-emerald-600" />
              Insights Táticos (IA)
            </h3>
            <div className="space-y-4">
              {tacticalData?.insightsTaticos?.length > 0 ? (
                tacticalData.insightsTaticos.map((insight: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-emerald-900">{insight.titulo}</h4>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                        insight.urgencia === 'Alta' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {insight.urgencia}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700/70 leading-relaxed">
                      {insight.insight}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-600/60 text-center py-4 italic">Aguardando processamento de dados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
