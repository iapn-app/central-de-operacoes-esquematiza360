import React, { useState } from 'react';
import { 
  Package, 
  Radio, 
  Zap, 
  Shield, 
  Target, 
  Scan, 
  Smartphone, 
  Car, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  User, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical,
  ChevronRight,
  Activity,
  Settings,
  ShieldCheck,
  Clock,
  Shirt,
  Battery,
  Plug,
  ArrowRightLeft,
  ClipboardCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Mock Data for Equipment & Assets
const MOCK_EQUIPAMENTOS = [
  {
    id: 'EQ-001',
    nome: 'Rádio Digital Motorola DGP8550',
    categoria: 'Rádios',
    codigo: 'RD-042',
    numeroSerie: 'S/N-987654321',
    responsavel: 'Carlos Oliveira',
    posto: 'Barra Premium',
    status: 'em_uso',
    ultimaManutencao: '15/01/2026',
    proximaRevisao: '15/07/2026',
    saude: 95
  },
  {
    id: 'EQ-002',
    nome: 'Colete Balístico Nível III-A',
    categoria: 'Coletes',
    codigo: 'CL-128',
    numeroSerie: 'S/N-123456789',
    responsavel: 'André Santos',
    posto: 'Shopping Américas',
    status: 'em_uso',
    ultimaManutencao: '10/12/2025',
    proximaRevisao: '10/12/2026',
    saude: 100
  },
  {
    id: 'EQ-003',
    nome: 'Viatura Toyota Corolla (V-04)',
    categoria: 'Viaturas',
    codigo: 'VT-004',
    numeroSerie: 'CHASSI-98765',
    responsavel: 'Felipe Costa',
    posto: 'Patrulha Móvel',
    status: 'manutencao',
    ultimaManutencao: '05/03/2026',
    proximaRevisao: '10/03/2026',
    saude: 65
  },
  {
    id: 'EQ-004',
    nome: 'Smartphone Samsung Rugged X',
    categoria: 'Smartphones',
    codigo: 'SP-089',
    numeroSerie: 'IMEI-1234567890',
    responsavel: '-',
    posto: 'Base Operacional',
    status: 'disponivel',
    ultimaManutencao: '20/02/2026',
    proximaRevisao: '20/08/2026',
    saude: 100
  },
  {
    id: 'EQ-005',
    nome: 'Detector de Metais Garrett',
    categoria: 'Detectores',
    codigo: 'DM-012',
    numeroSerie: 'S/N-456123789',
    responsavel: 'Ricardo Almeida',
    posto: 'Sede Administrativa',
    status: 'em_uso',
    ultimaManutencao: '12/11/2025',
    proximaRevisao: '12/03/2026',
    saude: 25
  },
  {
    id: 'EQ-006',
    nome: 'Lanterna Tática Fenix TK22',
    categoria: 'Lanternas',
    codigo: 'LT-055',
    numeroSerie: 'S/N-789456123',
    responsavel: '-',
    posto: 'Estoque Central',
    status: 'disponivel',
    ultimaManutencao: '01/02/2026',
    proximaRevisao: '01/08/2026',
    saude: 90
  },
  {
    id: 'EQ-007',
    nome: 'Uniforme Tático Completo (G)',
    categoria: 'Uniformes',
    codigo: 'UN-102',
    numeroSerie: 'LOTE-2025-A',
    responsavel: 'João Pereira',
    posto: 'Centro Empresarial',
    status: 'em_uso',
    ultimaManutencao: '-',
    proximaRevisao: '-',
    saude: 80
  },
  {
    id: 'EQ-008',
    nome: 'Bateria Extra Motorola DGP',
    categoria: 'Baterias',
    codigo: 'BT-045',
    numeroSerie: 'S/N-BAT9988',
    responsavel: '-',
    posto: 'Estoque Central',
    status: 'manutencao',
    ultimaManutencao: '01/03/2026',
    proximaRevisao: '15/03/2026',
    saude: 40
  }
];

const CATEGORIAS = [
  { id: 'radios', label: 'Rádios', icon: Radio, count: 45 },
  { id: 'lanternas', label: 'Lanternas', icon: Zap, count: 32 },
  { id: 'coletes', label: 'Coletes', icon: Shield, count: 120 },
  { id: 'armamentos', label: 'Armamentos', icon: Target, count: 15 },
  { id: 'smartphones', label: 'Smartphones', icon: Smartphone, count: 50 },
  { id: 'detectores', label: 'Detectores', icon: Scan, count: 18 },
  { id: 'uniformes', label: 'Uniformes', icon: Shirt, count: 200 },
  { id: 'viaturas', label: 'Viaturas', icon: Car, count: 12 },
  { id: 'baterias', label: 'Baterias', icon: Battery, count: 80 },
  { id: 'carregadores', label: 'Carregadores', icon: Plug, count: 60 },
];

const INDICADORES = [
  { label: 'Total de Equipamentos', value: '632', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Itens em Uso', value: '415', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Itens Disponíveis', value: '185', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Em Manutenção', value: '32', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function EquipamentosAtivos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isNovoItemModalOpen, setIsNovoItemModalOpen] = useState(false);
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false);
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-100 dark:border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> DISPONÍVEL
        </span>;
      case 'em_uso':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase border border-blue-100 dark:border-blue-500/20">
          <Activity className="w-3 h-3" /> EM USO
        </span>;
      case 'manutencao':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-100 dark:border-amber-500/20">
          <Wrench className="w-3 h-3" /> MANUTENÇÃO
        </span>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIAS.find(c => c.label === category);
    if (!cat) return Package;
    return cat.icon;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-soft-black dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white w-6 h-6" />
            </div>
            Inventário e Manutenção
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle total de equipamentos operacionais da empresa.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setIsNovoItemModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INDICADORES.map((ind, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={ind.label}
            className="bg-white dark:bg-[#141414] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 group hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 dark:bg-opacity-10 dark:text-opacity-90", ind.bg, ind.color)}>
              <ind.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{ind.label}</p>
              <h3 className="text-2xl font-black text-soft-black dark:text-white leading-tight">{ind.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setIsEntregaModalOpen(true)}
          className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-soft-black dark:text-white">Controle de Entrega</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Registrar cautela para funcionário</p>
          </div>
        </button>
        <button 
          onClick={() => setIsManutencaoModalOpen(true)}
          className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-soft-black dark:text-white">Registro de Manutenção</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Abrir OS para equipamento</p>
          </div>
        </button>
        <button 
          onClick={() => setIsMovimentacaoModalOpen(true)}
          className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-soft-black dark:text-white">Movimentação de Estoque</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Transferir entre postos/bases</p>
          </div>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2",
            selectedCategory === null ? "bg-soft-black dark:bg-gray-800 text-white border-soft-black dark:border-gray-800 shadow-md" : "bg-white dark:bg-[#141414] text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-brand-green/30 dark:hover:border-brand-green/30"
          )}
        >
          <Package className="w-4 h-4" />
          TODOS
        </button>
        {CATEGORIAS.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.label)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2",
              selectedCategory === cat.label ? "bg-soft-black dark:bg-gray-800 text-white border-soft-black dark:border-gray-800 shadow-md" : "bg-white dark:bg-[#141414] text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-brand-green/30 dark:hover:border-brand-green/30"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label.toUpperCase()}
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-md text-[9px]",
              selectedCategory === cat.label ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500"
            )}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Main Content: Table & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Equipment List Table */}
        <div className="lg:col-span-3 bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-green" />
              Lista de Equipamentos
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar código, série, nome..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-64 dark:text-white transition-all"
                />
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-xl border border-gray-100 dark:border-white/10 transition-all"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Equipamento / Série</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Responsável / Posto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Saúde</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {MOCK_EQUIPAMENTOS
                  .filter(e => (selectedCategory === null || e.categoria === selectedCategory) && 
                              (e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || e.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((item) => {
                    const Icon = getCategoryIcon(item.categoria);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-colors">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-soft-black dark:text-white leading-none mb-1">{item.nome}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{item.codigo} • {item.numeroSerie}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-soft-black dark:text-white flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {item.responsavel}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {item.posto}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-16 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  item.saude > 80 ? "bg-emerald-500" : item.saude > 50 ? "bg-amber-500" : "bg-red-500"
                                )} 
                                style={{ width: `${item.saude}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{item.saude}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/30 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">Mostrando {MOCK_EQUIPAMENTOS.length} equipamentos</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-soft-black dark:hover:text-white">Anterior</button>
              <button className="px-3 py-1 text-xs font-bold text-brand-green bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/10 rounded-lg shadow-sm">1</button>
              <button className="px-3 py-1 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-soft-black dark:hover:text-white">Próximo</button>
            </div>
          </div>
        </div>

        {/* Sidebar: Maintenance & Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Histórico Recente
            </h3>
            <div className="space-y-4">
              {[
                { event: 'Cautela: Rádio RD-042', user: 'Carlos Oliveira', time: 'Há 2h' },
                { event: 'Devolução: Viatura VT-004', user: 'Felipe Costa', time: 'Há 4h' },
                { event: 'Transferência: Colete CL-128', user: 'Base -> Shopping', time: 'Há 6h' },
                { event: 'OS Aberta: Bateria BT-045', user: 'Suporte Técnico', time: 'Há 12h' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-soft-black dark:text-white">{log.event}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-soft-black dark:hover:text-white transition-all flex items-center justify-center gap-2">
              Ver histórico completo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-[#141414] dark:to-amber-500/5 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm">
            <h3 className="text-sm font-bold text-soft-black dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas de Revisão
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Manutenção Crítica</p>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Detector DM-012</p>
                <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mt-1">Revisão obrigatória vencida há 2 dias.</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Próxima Revisão</p>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Viatura VT-004</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">Agendada para amanhã (10/03).</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-bold text-soft-black dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Configurações
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-600 dark:text-gray-400 transition-all">Gerenciar Categorias</button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-600 dark:text-gray-400 transition-all">Relatórios de Manutenção</button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-600 dark:text-gray-400 transition-all">Configurar Alertas</button>
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isNovoItemModalOpen}
        onClose={() => setIsNovoItemModalOpen(false)}
        title="Cadastrar Novo Equipamento"
        maxWidth="max-w-2xl"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsNovoItemModalOpen(false); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nome do Equipamento</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: Rádio Digital Motorola"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Categoria</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione a categoria</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Código Interno</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: RD-042"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Número de Série</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: S/N-987654321"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto / Base Atual</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o local</option>
                <option value="estoque">Estoque Central</option>
                <option value="barra">Condomínio Barra Premium</option>
                <option value="shopping">Shopping Américas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsNovoItemModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Cadastrar Equipamento
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEntregaModalOpen}
        onClose={() => setIsEntregaModalOpen(false)}
        title="Controle de Entrega (Cautela)"
        maxWidth="max-w-md"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsEntregaModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Equipamento</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o equipamento</option>
                {MOCK_EQUIPAMENTOS.filter(e => e.status === 'disponivel').map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nome} ({eq.codigo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Funcionário Responsável</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o funcionário</option>
                <option value="carlos">Carlos Oliveira</option>
                <option value="andre">André Santos</option>
                <option value="felipe">Felipe Costa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Data de Entrega</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Observações</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green min-h-[80px] resize-none"
                placeholder="Estado do equipamento, acessórios entregues..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsEntregaModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Registrar Cautela
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isManutencaoModalOpen}
        onClose={() => setIsManutencaoModalOpen(false)}
        title="Registro de Manutenção"
        maxWidth="max-w-md"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsManutencaoModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Equipamento</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o equipamento</option>
                {MOCK_EQUIPAMENTOS.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nome} ({eq.codigo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Manutenção</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o tipo</option>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Descrição do Problema / Serviço</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green min-h-[100px] resize-none"
                placeholder="Descreva o defeito ou o serviço a ser realizado..."
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsManutencaoModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Abrir Ordem de Serviço
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMovimentacaoModalOpen}
        onClose={() => setIsMovimentacaoModalOpen(false)}
        title="Movimentação de Estoque"
        maxWidth="max-w-md"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsMovimentacaoModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Equipamento</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o equipamento</option>
                {MOCK_EQUIPAMENTOS.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nome} ({eq.codigo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto / Base de Origem</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green opacity-70 cursor-not-allowed"
                value="Estoque Central"
                disabled
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto / Base de Destino</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o destino</option>
                <option value="barra">Condomínio Barra Premium</option>
                <option value="shopping">Shopping Américas</option>
                <option value="centro">Centro Empresarial</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsMovimentacaoModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Confirmar Transferência
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filtros de Equipamentos"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os status</option>
                <option value="disponivel">Disponível</option>
                <option value="em_uso">Em Uso</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto / Base</label>
              <select className="w-full px-4 py-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm dark:text-white transition-colors">
                <option value="">Todos os locais</option>
                <option value="estoque">Estoque Central</option>
                <option value="barra">Condomínio Barra Premium</option>
                <option value="shopping">Shopping Américas</option>
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
