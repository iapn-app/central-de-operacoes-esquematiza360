import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Calendar, 
  DollarSign, 
  Users, 
  MoreVertical,
  ShieldCheck,
  Briefcase,
  Leaf
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Mock data for initial MVP
const MOCK_CONTRATOS = [
  {
    id: '1',
    cliente: 'Condomínio Alto Padrão',
    cnpj: '12.345.678/0001-90',
    tipo_servico: 'Multi-serviço',
    servicos: ['Vigilância', 'Limpeza'],
    valor_mensal: 45000,
    profissionais: 12,
    data_inicio: '2025-01-01',
    data_fim: '2026-01-01',
    frequencia: 'Mensal',
    status: 'ATIVO',
    operacao: 'São Paulo - SP'
  },
  {
    id: '2',
    cliente: 'Shopping Center Sul',
    cnpj: '98.765.432/0001-10',
    tipo_servico: 'Vigilância',
    servicos: ['Vigilância'],
    valor_mensal: 120000,
    profissionais: 30,
    data_inicio: '2024-06-15',
    data_fim: '2025-06-15',
    frequencia: 'Mensal',
    status: 'ATIVO',
    operacao: 'Campinas - SP'
  },
  {
    id: '3',
    cliente: 'Hospital Santa Maria',
    cnpj: '45.678.901/0001-23',
    tipo_servico: 'Limpeza',
    servicos: ['Limpeza'],
    valor_mensal: 85000,
    profissionais: 25,
    data_inicio: '2025-03-01',
    data_fim: '2026-03-01',
    frequencia: 'Mensal',
    status: 'ATIVO',
    operacao: 'São Paulo - SP'
  },
  {
    id: '4',
    cliente: 'Indústria Tech Corp',
    cnpj: '33.444.555/0001-66',
    tipo_servico: 'Multi-serviço',
    servicos: ['Vigilância', 'Jardinagem'],
    valor_mensal: 62000,
    profissionais: 15,
    data_inicio: '2023-10-10',
    data_fim: '2024-10-10',
    frequencia: 'Mensal',
    status: 'FINALIZADO',
    operacao: 'São José dos Campos - SP'
  }
];

export function Contratos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('TODOS');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getServiceIcon = (servico: string) => {
    if (servico.includes('Vigilância')) return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    if (servico.includes('Limpeza')) return <Briefcase className="w-4 h-4 text-emerald-500" />;
    if (servico.includes('Jardinagem')) return <Leaf className="w-4 h-4 text-green-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const filteredContratos = MOCK_CONTRATOS.filter(c => {
    const matchesSearch = c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm);
    const matchesStatus = filterStatus === 'TODOS' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAtivos = MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').length;
  const receitaMensal = MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').reduce((acc, curr) => acc + curr.valor_mensal, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20">
              <FileText className="text-white w-7 h-7" />
            </div>
            Gestão de Contratos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
            Gerencie contratos multi-serviços, faturamento recorrente e alocação de equipes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Novo Contrato
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contratos Ativos</p>
          </div>
          <p className="text-3xl font-black text-soft-black dark:text-white">{totalAtivos}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receita Contratada (Mês)</p>
          </div>
          <p className="text-3xl font-black text-soft-black dark:text-white">{formatCurrency(receitaMensal)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profissionais Alocados</p>
          </div>
          <p className="text-3xl font-black text-soft-black dark:text-white">
            {MOCK_CONTRATOS.filter(c => c.status === 'ATIVO').reduce((acc, curr) => acc + curr.profissionais, 0)}
          </p>
        </motion.div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou CNPJ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:text-white transition-all"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativos</option>
              <option value="PAUSADO">Pausados</option>
              <option value="FINALIZADO">Finalizados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Serviços</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Valor Mensal</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vigência</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredContratos.map((contrato) => (
                <tr key={contrato.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-soft-black dark:text-white">{contrato.cliente}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{contrato.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-soft-black dark:text-white">{contrato.tipo_servico}</span>
                      <div className="flex items-center gap-1">
                        {contrato.servicos.map(s => (
                          <div key={s} title={s}>
                            {getServiceIcon(s)}
                          </div>
                        ))}
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">({contrato.profissionais} prof.)</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-soft-black dark:text-white">
                      {formatCurrency(contrato.valor_mensal)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-xs text-soft-black dark:text-white">{new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[10px] text-gray-400">até {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                      contrato.status === 'ATIVO' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : 
                      contrato.status === 'FINALIZADO' ? "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20" :
                      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
                    )}>
                      {contrato.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContratos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Contrato */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Contrato Multi-Serviço"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Cliente</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="">Selecione um cliente...</option>
                <option value="1">Condomínio Alto Padrão</option>
                <option value="2">Shopping Center Sul</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Operação / Filial</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green">
                <option value="">Selecione a operação...</option>
                <option value="sp">São Paulo - SP</option>
                <option value="campinas">Campinas - SP</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Serviços Inclusos</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" />
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-soft-black dark:text-white">Vigilância</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" />
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-soft-black dark:text-white">Limpeza</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" />
                <Leaf className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-soft-black dark:text-white">Jardinagem</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Valor Mensal (R$)</label>
              <input type="number" placeholder="0,00" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Data Início</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Data Fim</label>
              <input type="date" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setIsNewModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setIsNewModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-green text-white hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20"
            >
              Salvar Contrato
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
