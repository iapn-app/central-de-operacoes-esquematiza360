import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  AlertTriangle, 
  Map as MapIcon, 
  Users, 
  Car, 
  Radar, 
  Filter, 
  ChevronRight, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Layers,
  Search,
  Maximize2,
  Info
} from 'lucide-react';
import { MOCK_POSTOS, MOCK_VIGILANTES, MOCK_OCORRENCIAS } from '../constants/mockData';
import { geminiService } from '../services/geminiService';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Heatmap Layer
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !points.length) return;
    
    // @ts-ignore
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const MapaRisco: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'street' | 'satellite'>('street');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showVigilantes, setShowVigilantes] = useState(true);
  const [showViaturas, setShowViaturas] = useState(true);
  const [geoAnalysis, setGeoAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  // Center of Rio (Barra da Tijuca area based on mock data)
  const center: [number, number] = [-23.0000, -43.3600];

  useEffect(() => {
    const fetchGeoAnalysis = async () => {
      setLoading(true);
      const analysis = await geminiService.generateGeospatialRiskAnalysis({
        postos: MOCK_POSTOS,
        ocorrencias: MOCK_OCORRENCIAS,
        vigilantes: MOCK_VIGILANTES
      });
      setGeoAnalysis(analysis);
      setLoading(false);
    };

    fetchGeoAnalysis();
  }, []);

  const heatmapPoints = useMemo(() => {
    return MOCK_OCORRENCIAS
      .filter(o => o.lat && o.lng)
      .map(o => [o.lat!, o.lng!, o.severidade === 'Crítica' ? 1 : o.severidade === 'Alta' ? 0.8 : 0.5] as [number, number, number]);
  }, []);

  const renderVigilanteIcon = (status: string) => {
    const color = status === 'Em ronda' ? '#10b981' : status === 'Ativo' ? '#3b82f6' : '#ef4444';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const renderPostoIcon = (vulnerabilidade: number) => {
    const color = vulnerabilidade > 70 ? '#ef4444' : vulnerabilidade > 40 ? '#f59e0b' : '#10b981';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2)">${vulnerabilidade}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 overflow-hidden">
      {/* Header / Filters */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Radar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mapa de Risco Geoespacial</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Central de Inteligência 360</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['24h', '7d', '30d'].map(period => (
              <button
                key={period}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${selectedFilter === period ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setSelectedFilter(period)}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <Filter size={20} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
              <Maximize2 size={18} />
              <span className="text-sm font-medium">Modo Comando</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Left: Vulnerability & Stats */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto z-10 shadow-xl">
          <div className="p-4 space-y-6">
            {/* Ranking de Setores */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp size={16} className="text-red-500" />
                  Setores Críticos
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">TOP 5</span>
              </div>
              <div className="space-y-3">
                {geoAnalysis?.setoresCriticos?.map((setor: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{setor.nome}</span>
                      <span className={`text-[10px] font-bold ${setor.variacao.includes('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                        {setor.variacao}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full ${setor.vulnerabilidade > 70 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${setor.vulnerabilidade}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Score: {setor.vulnerabilidade}</span>
                      <span>T. Resposta: {setor.tempoResposta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Ocorrências por Tipo */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                <Activity size={16} className="text-emerald-500" />
                Tipologia de Eventos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Invasão', val: 12, color: 'bg-red-500' },
                  { label: 'Falha Tec', val: 45, color: 'bg-amber-500' },
                  { label: 'Ronda Off', val: 28, color: 'bg-blue-500' },
                  { label: 'Outros', val: 15, color: 'bg-slate-400' }
                ].map((item, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800">{item.val}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Alertas Geo em Tempo Real */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Alertas Geográficos
              </h3>
              <div className="space-y-3">
                {geoAnalysis?.alertasGeo?.map((alerta: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-xl border-l-4 ${alerta.urgencia === 'Alta' ? 'bg-red-50 border-red-100 border-l-red-500' : 'bg-amber-50 border-amber-100 border-l-amber-500'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{alerta.local}</span>
                      <Clock size={12} className="text-slate-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{alerta.titulo}</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{alerta.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer 
            center={center} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url={activeLayer === 'street' 
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              }
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Heatmap Layer */}
            {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

            {/* Risk Zones (AI Generated) */}
            {showRiskZones && geoAnalysis?.zonasRisco?.map((zona: any) => (
              <Circle
                key={zona.id}
                center={zona.centro}
                radius={zona.raio}
                pathOptions={{
                  fillColor: zona.nivel === 'Crítico' ? '#ef4444' : zona.nivel === 'Alto' ? '#f59e0b' : '#3b82f6',
                  color: 'transparent',
                  fillOpacity: 0.2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-red-600 mb-1">Zona de Risco: {zona.nivel}</h4>
                    <p className="text-xs text-slate-600">{zona.motivo}</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Postos Markers */}
            {MOCK_POSTOS.map(posto => (
              <Marker 
                key={posto.id} 
                position={[posto.lat!, posto.lng!]}
                icon={renderPostoIcon(posto.vulnerabilidade || 0)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{posto.nome}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${posto.statusRonda === 'Realizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {posto.statusRonda}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vulnerabilidade:</span>
                        <span className="font-bold text-slate-700">{posto.vulnerabilidade}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Última Ronda:</span>
                        <span className="font-bold text-slate-700">{posto.ultimaRonda}</span>
                      </div>
                      <button className="w-full mt-2 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition-colors">
                        VER DETALHES DO POSTO
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Vigilantes Markers */}
            {showVigilantes && MOCK_VIGILANTES.map(vig => (
              vig.lat && vig.lng && (
                <Marker 
                  key={vig.id} 
                  position={[vig.lat, vig.lng]}
                  icon={renderVigilanteIcon(vig.status)}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${vig.status === 'Em ronda' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <h4 className="font-bold text-slate-800 text-sm">{vig.nome}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{vig.posto}</p>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">CHAMAR</button>
                        <button className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">HISTÓRICO</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <div className="bg-white p-1 rounded-lg shadow-xl border border-slate-200 flex flex-col">
                <button 
                  onClick={() => setActiveLayer('street')}
                  className={`p-2 rounded-md transition-all ${activeLayer === 'street' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Mapa de Ruas"
                >
                  <MapIcon size={20} />
                </button>
                <button 
                  onClick={() => setActiveLayer('satellite')}
                  className={`p-2 rounded-md transition-all ${activeLayer === 'satellite' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Satélite"
                >
                  <Layers size={20} />
                </button>
              </div>

              <div className="bg-white p-1 rounded-lg shadow-xl border border-slate-200 flex flex-col">
                <button 
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`p-2 rounded-md transition-all ${showHeatmap ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Heatmap de Ocorrências"
                >
                  <Activity size={20} />
                </button>
                <button 
                  onClick={() => setShowRiskZones(!showRiskZones)}
                  className={`p-2 rounded-md transition-all ${showRiskZones ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Zonas de Risco"
                >
                  <Shield size={20} />
                </button>
                <button 
                  onClick={() => setShowVigilantes(!showVigilantes)}
                  className={`p-2 rounded-md transition-all ${showVigilantes ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  title="Vigilantes em Tempo Real"
                >
                  <Users size={20} />
                </button>
              </div>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 min-w-[200px]">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Legenda Operacional</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-xs font-medium text-slate-700">Risco Crítico / Vulnerabilidade Alta</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-xs font-medium text-slate-700">Risco Médio / Atenção</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700">Operação Normal / Seguro</span>
                </div>
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                  <span className="text-xs font-medium text-slate-700">Vigilante Ativo</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  <span className="text-xs font-medium text-slate-700">Vigilante em Ronda</span>
                </div>
              </div>
            </div>

            {/* AI Insights Overlay */}
            <div className="absolute bottom-6 right-6 z-[1000] max-w-xs">
              <AnimatePresence>
                {geoAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-emerald-500 rounded-lg">
                        <Radar size={16} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Geo-Inteligência Central</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                      Análise geoespacial detectou aumento de 22% na vulnerabilidade do Setor Norte devido a falhas de iluminação pública e padrão de rondas previsível.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] font-medium text-slate-400">Cobertura Ideal</span>
                        <span className="text-[10px] font-bold text-emerald-400">94.2%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] font-medium text-slate-400">Tempo de Resposta</span>
                        <span className="text-[10px] font-bold text-amber-400">4.5 min</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </MapContainer>
        </div>
      </div>

      {/* Footer Stats Bar */}
      <div className="bg-slate-900 text-white p-3 flex items-center justify-around z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sistema Online</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">Vigilantes Monitorados:</span>
            <span className="text-xs font-bold">94</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">Viaturas em Campo:</span>
            <span className="text-xs font-bold">12</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">Postos Críticos:</span>
            <span className="text-xs font-bold text-red-400">03</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <Info size={14} className="text-emerald-400" />
            <span className="text-[10px] font-medium">Última atualização: Agora</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaRisco;
