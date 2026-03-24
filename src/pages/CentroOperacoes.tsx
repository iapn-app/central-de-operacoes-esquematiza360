import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Map, 
  Users, 
  Activity, 
  AlertTriangle, 
  Radio, 
  Crosshair, 
  Eye, 
  Siren, 
  PhoneCall, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Layers,
  Video,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';

import { CameraFeedCard } from '../components/CameraFeedCard';

// Custom Icons for Map
const createIcon = (color: string, pulse: boolean = false) => L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      ${pulse ? `<span class="absolute inline-flex h-full w-full rounded-full bg-${color}-500 opacity-75 animate-ping"></span>` : ''}
      <div class="relative inline-flex rounded-full w-4 h-4 bg-${color}-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const iconOnline = createIcon('emerald');
const iconWarning = createIcon('amber', true);
const iconCritical = createIcon('red', true);

// Map Center Component
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function CentroOperacoes() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.9068, -43.1729]);
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'rondas'>('all');
  const [postos, setPostos] = useState<any[]>([]);
  const [cameraFeeds, setCameraFeeds] = useState<any[]>([]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // Using empty arrays as the system is being reset for real implementation
      const result = await geminiService.generateSOCAnalysis({
        postos: [],
        vigilantes: [],
        ocorrencias: []
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Error fetching SOC analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen -m-6 p-6 text-slate-50 font-sans selection:bg-brand-green/30">
      {/* Top Bar - SOC Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 relative">
              <Crosshair className="w-7 h-7 text-brand-green" />
            </div>
            {analysis?.statusSistema?.nivel === 'Crítico' && (
              <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-20 z-0"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black tracking-tighter uppercase">Centro de Comando</h1>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-black rounded uppercase tracking-widest border border-slate-700">SOC Nível 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", 
                  analysis?.statusSistema?.nivel === 'Crítico' ? 'bg-red-400' : 'bg-emerald-400'
                )}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2",
                  analysis?.statusSistema?.nivel === 'Crítico' ? 'bg-red-500' : 'bg-emerald-500'
                )}></span>
              </span>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Status Global: <span className={cn("font-bold", analysis?.statusSistema?.nivel === 'Crítico' ? 'text-red-400' : 'text-emerald-400')}>{analysis?.statusSistema?.nivel || 'Conectando...'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Latência: 12ms</span>
          </div>
          <button 
            onClick={fetchAnalysis}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white hover:border-slate-700 transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center gap-2">
            <Siren className="w-4 h-4" />
            Protocolo de Crise
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vigilantes Online', val: analysis?.kpis?.online || 0, icon: Users, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Rondas Ativas', val: analysis?.kpis?.rondasAtivas || 0, icon: Activity, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'Postos com Atraso', val: analysis?.kpis?.atrasos || 0, icon: Clock, color: 'text-amber-400', border: 'border-amber-500/20', pulse: (analysis?.kpis?.atrasos || 0) > 0 },
          { label: 'Ocorrências Críticas', val: analysis?.kpis?.ocorrenciasCriticas || 0, icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500/20', pulse: (analysis?.kpis?.ocorrenciasCriticas || 0) > 0 }
        ].map((kpi, i) => (
          <div key={i} className={cn("bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-800 relative overflow-hidden group", kpi.pulse && `border-${kpi.color.split('-')[1]}-500/50`)}>
            {kpi.pulse && <div className={`absolute inset-0 bg-${kpi.color.split('-')[1]}-500/5 animate-pulse`}></div>}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                <h3 className={cn("text-3xl font-black tracking-tighter", kpi.color)}>{kpi.val}</h3>
              </div>
              <div className={cn("p-2 rounded-lg bg-slate-800/50 border", kpi.border)}>
                <kpi.icon size={20} className={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Map & Layers (Span 2) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Map Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex-1 min-h-[500px] shadow-2xl">
            {/* Map Controls Overlay */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
              <div className="bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <button 
                  onClick={() => setActiveLayer('all')}
                  className={cn("p-2 rounded-lg transition-all", activeLayer === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white')}
                  title="Visão Geral"
                >
                  <Map size={18} />
                </button>
                <button 
                  onClick={() => setActiveLayer('critical')}
                  className={cn("p-2 rounded-lg transition-all", activeLayer === 'critical' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-red-400')}
                  title="Apenas Críticos"
                >
                  <AlertTriangle size={18} />
                </button>
                <button 
                  onClick={() => setActiveLayer('rondas')}
                  className={cn("p-2 rounded-lg transition-all", activeLayer === 'rondas' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-blue-400')}
                  title="Rondas Ativas"
                >
                  <Activity size={18} />
                </button>
              </div>
            </div>

            {/* Live Feed Overlay (Bottom Left) */}
            <div className="absolute bottom-4 left-4 z-[400] max-w-sm">
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Radio size={12} className="text-brand-green animate-pulse" />
                  Live Feed Operacional
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {analysis?.liveFeed?.length > 0 ? analysis.liveFeed.map((feed: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1">
                        {feed.severidade === 'critical' ? <AlertTriangle size={14} className="text-red-500" /> :
                         feed.severidade === 'warning' ? <AlertTriangle size={14} className="text-amber-500" /> :
                         <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{feed.evento}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-slate-500 font-mono">{feed.horario}</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider truncate max-w-[150px]">{feed.local}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center py-4">Aguardando feeds...</p>
                  )}
                </div>
              </div>
            </div>

            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', background: '#020617' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapUpdater center={mapCenter} />

              {/* Render Markers based on Active Layer */}
              {postos.map((posto) => {
                const isCritical = posto.statusRonda === 'Atrasada';
                if (activeLayer === 'critical' && !isCritical) return null;

                return (
                  <Marker 
                    key={posto.id} 
                    position={[posto.lat || 0, posto.lng || 0]}
                    icon={isCritical ? iconCritical : iconOnline}
                  >
                    <Popup className="soc-popup">
                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-white w-48">
                        <h4 className="font-bold text-sm mb-1 truncate">{posto.nome}</h4>
                        <p className="text-xs text-slate-400 mb-2">Última ronda: {posto.ultimaRonda}</p>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                          <span className={isCritical ? 'text-red-400' : 'text-emerald-400'}>
                            {posto.statusRonda}
                          </span>
                          <button className="text-brand-green hover:text-white transition-colors">Detalhes</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Render Risk Heatmap Circles */}
              {analysis?.heatmapRisco?.map((risk: any, i: number) => {
                const matchedPosto = postos.find(p => p.nome.includes(risk.local) || risk.local.includes(p.nome));
                const lat = matchedPosto ? matchedPosto.lat : mapCenter[0] + (Math.random() - 0.5) * 0.05;
                const lng = matchedPosto ? matchedPosto.lng : mapCenter[1] + (Math.random() - 0.5) * 0.05;

                return (
                  <Circle
                    key={`risk-${i}`}
                    center={[lat, lng]}
                    radius={800}
                    pathOptions={{ 
                      color: risk.nivelRisco === 'Extremo' ? '#ef4444' : '#f59e0b', 
                      fillColor: risk.nivelRisco === 'Extremo' ? '#ef4444' : '#f59e0b', 
                      fillOpacity: 0.2,
                      weight: 1
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right Col: Priorities & Actions (Span 1) */}
        <div className="space-y-6 flex flex-col">
          {/* Prioridades Críticas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Zap size={16} className="text-red-500" />
                Prioridades Críticas
              </h3>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded uppercase tracking-widest border border-red-500/20">
                {analysis?.prioridadesCriticas?.length || 0} Ações
              </span>
            </div>

            <div className="space-y-4">
              {analysis?.prioridadesCriticas?.map((prioridade: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 group hover:border-red-500/50 transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {prioridade.tempoDecorrido}
                    </span>
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                      Ação Imediata
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{prioridade.problema}</h4>
                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                    <MapPin size={12} /> {prioridade.local}
                  </p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <PhoneCall size={12} />
                      {prioridade.acaoRecomendada}
                    </button>
                    <button className="w-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-all border border-slate-700">
                      <Video size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {(!analysis?.prioridadesCriticas || analysis.prioridadesCriticas.length === 0) && (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-3 opacity-50" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nenhuma prioridade crítica</p>
                </div>
              )}
            </div>
          </div>

          {/* Câmeras / Feed Rápido */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white mb-4">
              <Eye size={16} className="text-blue-500" />
              Monitoramento Ativo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {cameraFeeds.length > 0 ? cameraFeeds.map((feed) => (
                <CameraFeedCard 
                  key={feed.id}
                  id={feed.id}
                  name={feed.name}
                  src={feed.src}
                  status="LIVE"
                />
              )) : (
                <div className="col-span-2 py-10 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">Nenhuma câmera ativa</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Leaflet Popups in Dark Mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
