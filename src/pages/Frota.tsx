import React, { useState } from 'react';
import { 
  Car, 
  Truck, 
  Fuel, 
  Wrench, 
  Map, 
  Navigation, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Gauge,
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  ChevronRight,
  User,
  Activity,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { VehicleSummaryTab } from '../components/frota/tabs/VehicleSummaryTab';
import { VehicleMaintenanceTab } from '../components/frota/tabs/VehicleMaintenanceTab';
import { VehicleFuelTab } from '../components/frota/tabs/VehicleFuelTab';
import { VehicleCostsTab } from '../components/frota/tabs/VehicleCostsTab';
import { Modal } from '../components/Modal';

// Mock Data for Fleet
const MOCK_VEICULOS = [
  {
    id: 'V-001',
    modelo: 'Toyota Corolla',
    placa: 'BRA-2E19',
    ano: '2023',
    motorista: 'Ricardo Mendes',
    status: 'ativo',
    kmAtual: 42500,
    consumoMedio: 12.5,
    custoPorKm: 0.45,
    gastoMensal: 1250.00,
    manutencoes: [
      { id: 1, tipo: 'Troca de Óleo', data: '10/02/2026', km: 40000, proxima: '50000 km' },
      { id: 2, tipo: 'Revisão Geral', data: '15/08/2025', km: 30000, proxima: '40000 km' }
    ],
    abastecimentos: [
      { id: 1, data: '08/03/2026', km: 42500, litros: 40, valor: 220.00, posto: 'Posto Shell Barra' },
      { id: 2, data: '01/03/2026', km: 42000, litros: 42, valor: 231.00, posto: 'Posto Ipiranga Recreio' }
    ]
  },
  {
    id: 'V-002',
    modelo: 'Mitsubishi L200',
    placa: 'KLS-4J88',
    ano: '2022',
    motorista: 'André Luiz',
    status: 'ativo',
    kmAtual: 15200,
    consumoMedio: 9.2,
    custoPorKm: 0.65,
    gastoMensal: 2100.00,
    manutencoes: [
      { id: 1, tipo: 'Troca de Pneus', data: '05/01/2026', km: 15000, proxima: '55000 km' }
    ],
    abastecimentos: [
      { id: 1, data: '09/03/2026', km: 15200, litros: 60, valor: 350.00, posto: 'Posto BR Centro' }
    ]
  },
  {
    id: 'V-003',
    modelo: 'Renault Logan',
    placa: 'GHT-9P22',
    ano: '2021',
    motorista: 'Sérgio Ramos',
    status: 'manutencao',
    kmAtual: 88900,
    consumoMedio: 14.1,
    custoPorKm: 0.38,
    gastoMensal: 850.00,
    manutencoes: [
      { id: 1, tipo: 'Troca de Pastilhas', data: '01/12/2025', km: 85000, proxima: '105000 km' }
    ],
    abastecimentos: [
      { id: 1, data: '05/03/2026', km: 88900, litros: 35, valor: 190.00, posto: 'Posto Shell Barra' }
    ]
  },
  {
    id: 'V-004',
    modelo: 'Fiat Strada',
    placa: 'OIP-3M11',
    ano: '2024',
    motorista: 'Carlos Eduardo',
    status: 'ativo',
    kmAtual: 32150,
    consumoMedio: 11.8,
    custoPorKm: 0.48,
    gastoMensal: 1420.00,
    manutencoes: [
      { id: 1, tipo: 'Revisão de Suspensão', data: '20/01/2026', km: 30000, proxima: '40000 km' }
    ],
    abastecimentos: [
      { id: 1, data: '07/03/2026', km: 32150, litros: 45, valor: 245.00, posto: 'Posto Ipiranga Recreio' }
    ]
  }
];

const INDICADORES = [
  { label: 'Total da Frota', value: '24', icon: Car, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Veículos Ativos', value: '21', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Em Manutenção', value: '03', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Gasto Mensal (Comb.)', value: 'R$ 14.5K', icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
];

export function Frota() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(MOCK_VEICULOS[0]);
  const [activeTab, setActiveTab] = useState<'resumo' | 'manutencao' | 'abastecimento' | 'custos'>('resumo');
  const [isNovoVeiculoModalOpen, setIsNovoVeiculoModalOpen] = useState(false);
  const [isRegManutencaoModalOpen, setIsRegManutencaoModalOpen] = useState(false);
  const [isRegAbastecimentoModalOpen, setIsRegAbastecimentoModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase border border-emerald-100 dark:border-emerald-500/20">
          <Navigation className="w-3 h-3" /> ATIVO
        </span>;
      case 'manutencao':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-100 dark:border-amber-500/20">
          <Wrench className="w-3 h-3" /> MANUTENÇÃO
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-soft-black dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="text-white w-6 h-6" />
            </div>
            Gestão de Frota
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle completo de veículos operacionais, manutenção e combustível.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setIsNovoVeiculoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Novo Veículo
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vehicle List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-[800px]">
            <div className="p-6 border-b border-gray-50 dark:border-white/5">
              <h3 className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-brand-green" />
                Veículos Operacionais
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Buscar placa ou modelo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-hide">
              {MOCK_VEICULOS
                .filter(v => v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || v.placa.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((veiculo) => (
                  <div 
                    key={veiculo.id} 
                    onClick={() => setSelectedVehicle(veiculo)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all border",
                      selectedVehicle.id === veiculo.id 
                        ? "bg-brand-green/5 dark:bg-brand-green/10 border-brand-green/30 dark:border-brand-green/30 shadow-sm" 
                        : "bg-white dark:bg-[#141414] border-transparent hover:border-gray-200 dark:hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          selectedVehicle.id === veiculo.id ? "bg-brand-green/10 text-brand-green" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                        )}>
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-soft-black dark:text-white leading-none mb-1">{veiculo.placa}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{veiculo.modelo}</p>
                        </div>
                      </div>
                      {getStatusBadge(veiculo.status)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-white/5 pt-3 mt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {veiculo.motorista}</span>
                      <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {veiculo.kmAtual.toLocaleString()} km</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Selected Vehicle Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info */}
          <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-soft-black dark:text-white leading-none">{selectedVehicle.placa}</h2>
                    {getStatusBadge(selectedVehicle.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVehicle.modelo} • Ano {selectedVehicle.ano}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsRegManutencaoModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all border border-amber-100 dark:border-amber-500/20"
                >
                  <Wrench className="w-4 h-4" />
                  Reg. Manutenção
                </button>
                <button 
                  onClick={() => setIsRegAbastecimentoModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all border border-blue-100 dark:border-blue-500/20"
                >
                  <Fuel className="w-4 h-4" />
                  Reg. Abastecimento
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-white/5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Motorista Atual</p>
                <p className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> {selectedVehicle.motorista}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Quilometragem</p>
                <p className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-400" /> {selectedVehicle.kmAtual.toLocaleString()} km
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Consumo Médio</p>
                <p className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> {selectedVehicle.consumoMedio} km/l
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Custo por KM</p>
                <p className="text-sm font-bold text-soft-black dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-500" /> R$ {selectedVehicle.custoPorKm.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* History Tabs */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-gray-100 dark:border-white/5 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('resumo')}
                className={cn(
                  "flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 whitespace-nowrap",
                  activeTab === 'resumo' 
                    ? "border-brand-green text-brand-green bg-brand-green/5" 
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <Activity className="w-4 h-4" />
                Resumo
              </button>
              <button 
                onClick={() => setActiveTab('manutencao')}
                className={cn(
                  "flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 whitespace-nowrap",
                  activeTab === 'manutencao' 
                    ? "border-brand-green text-brand-green bg-brand-green/5" 
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <Wrench className="w-4 h-4" />
                Manutenção
              </button>
              <button 
                onClick={() => setActiveTab('abastecimento')}
                className={cn(
                  "flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 whitespace-nowrap",
                  activeTab === 'abastecimento' 
                    ? "border-brand-green text-brand-green bg-brand-green/5" 
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <Fuel className="w-4 h-4" />
                Abastecimento
              </button>
              <button 
                onClick={() => setActiveTab('custos')}
                className={cn(
                  "flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 whitespace-nowrap",
                  activeTab === 'custos' 
                    ? "border-brand-green text-brand-green bg-brand-green/5" 
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-soft-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <DollarSign className="w-4 h-4" />
                Custos
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'resumo' && <VehicleSummaryTab />}
              {activeTab === 'manutencao' && <VehicleMaintenanceTab vehicle={selectedVehicle} />}
              {activeTab === 'abastecimento' && <VehicleFuelTab vehicle={selectedVehicle} />}
              {activeTab === 'custos' && <VehicleCostsTab vehicle={selectedVehicle} />}
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isNovoVeiculoModalOpen}
        onClose={() => setIsNovoVeiculoModalOpen(false)}
        title="Cadastrar Novo Veículo"
        maxWidth="max-w-2xl"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsNovoVeiculoModalOpen(false); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Modelo do Veículo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: Toyota Corolla"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Placa</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: BRA-2E19"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Ano</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: 2024"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quilometragem Inicial</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: 0"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Motorista Responsável</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="">Sem motorista fixo</option>
                <option value="ricardo">Ricardo Mendes</option>
                <option value="andre">André Luiz</option>
                <option value="sergio">Sérgio Ramos</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsNovoVeiculoModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Cadastrar Veículo
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRegManutencaoModalOpen}
        onClose={() => setIsRegManutencaoModalOpen(false)}
        title="Registrar Manutenção"
        maxWidth="max-w-md"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsRegManutencaoModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Veículo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green opacity-70 cursor-not-allowed"
                value={`${selectedVehicle.modelo} (${selectedVehicle.placa})`}
                disabled
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Manutenção</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" required>
                <option value="">Selecione o tipo</option>
                <option value="oleo">Troca de Óleo</option>
                <option value="pneus">Troca de Pneus</option>
                <option value="revisao">Revisão Geral</option>
                <option value="pastilhas">Troca de Pastilhas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Data</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">KM Atual</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  defaultValue={selectedVehicle.kmAtual}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Próxima Manutenção (KM ou Data)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: 50000 km ou 10/09/2026"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsRegManutencaoModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRegAbastecimentoModalOpen}
        onClose={() => setIsRegAbastecimentoModalOpen(false)}
        title="Registrar Abastecimento"
        maxWidth="max-w-md"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsRegAbastecimentoModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Veículo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green opacity-70 cursor-not-allowed"
                value={`${selectedVehicle.modelo} (${selectedVehicle.placa})`}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Data</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">KM Atual</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  defaultValue={selectedVehicle.kmAtual}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Litros</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="Ex: 40.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Valor Pago (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="Ex: 220.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Posto de Combustível</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Ex: Posto Shell Barra"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button"
              onClick={() => setIsRegAbastecimentoModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Relatório de Frota"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Período</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="current_month">Mês Atual</option>
                <option value="last_month">Mês Anterior</option>
                <option value="last_3_months">Últimos 3 Meses</option>
                <option value="ytd">Acumulado do Ano</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo de Relatório</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="geral">Visão Geral da Frota</option>
                <option value="manutencao">Histórico de Manutenções</option>
                <option value="abastecimento">Histórico de Abastecimentos</option>
                <option value="custos">Custos por Veículo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Formato do Arquivo</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-brand-green bg-brand-green/5 text-brand-green font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
                  <FileText className="w-4 h-4" />
                  Excel (XLSX)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsExportModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                setTimeout(() => setIsExportModalOpen(false), 800);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 dark:shadow-none"
            >
              <Download className="w-4 h-4" />
              Baixar Relatório
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
