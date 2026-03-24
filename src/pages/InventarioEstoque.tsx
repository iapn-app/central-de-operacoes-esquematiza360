import React, { useState } from 'react';
import { Package, AlertTriangle, History, Plus, ArrowRightLeft, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Modal } from '../components/Modal';

// Mock Data for Stock
const MOCK_ESTOQUE = [
  { id: 1, nome: 'Rádio Digital Motorola DGP8550', categoria: 'Rádios', disponivel: 15, minimo: 20, historico: [{ data: '10/03/2026', tipo: 'Saída', qtd: 2 }, { data: '05/03/2026', tipo: 'Entrada', qtd: 5 }] },
  { id: 2, nome: 'Colete Balístico Nível III-A', categoria: 'Coletes', disponivel: 50, minimo: 30, historico: [{ data: '08/03/2026', tipo: 'Entrada', qtd: 10 }] },
  { id: 3, nome: 'Smartphone Samsung Rugged X', categoria: 'Smartphones', disponivel: 5, minimo: 10, historico: [{ data: '09/03/2026', tipo: 'Saída', qtd: 3 }] },
  { id: 4, nome: 'Lanterna Tática Fenix TK22', categoria: 'Lanternas', disponivel: 25, minimo: 20, historico: [] },
];

export function InventarioEstoque() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_ESTOQUE[0] | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-soft-black dark:text-white tracking-tight">Controle de Estoque</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Gestão avançada de níveis de estoque e reposição.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-brand-green/20">
          <Plus className="w-5 h-5" /> Nova Movimentação
        </button>
      </div>

      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-soft-black dark:text-white">Itens em Estoque</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar item..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm focus:outline-none w-64 dark:text-white"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Disp.</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mín.</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {MOCK_ESTOQUE.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-soft-black dark:text-white">{item.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.categoria}</td>
                <td className="px-6 py-4 font-mono font-bold text-soft-black dark:text-white">{item.disponivel}</td>
                <td className="px-6 py-4 font-mono text-gray-500">{item.minimo}</td>
                <td className="px-6 py-4">
                  {item.disponivel < item.minimo ? (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" /> Repor
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">OK</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => { setSelectedItem(item); setIsHistoryModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Histórico: ${selectedItem?.nome}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {selectedItem?.historico.map((h, i) => (
            <div key={i} className="flex justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm">
              <span className="font-bold text-soft-black dark:text-white">{h.data}</span>
              <span className={cn("font-bold", h.tipo === 'Entrada' ? 'text-emerald-600' : 'text-red-600')}>{h.tipo} ({h.qtd})</span>
            </div>
          ))}
          {selectedItem?.historico.length === 0 && <p className="text-sm text-gray-500">Sem movimentações recentes.</p>}
        </div>
      </Modal>
    </div>
  );
}
