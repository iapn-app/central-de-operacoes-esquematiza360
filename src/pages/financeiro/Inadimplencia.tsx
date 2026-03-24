import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function Inadimplencia() {
  const [inadimplentes, setInadimplentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await financeService.getInadimplencia();
        setInadimplentes(data);
      } catch (error) {
        console.error('Error fetching inadimplentes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Clientes em Atraso" 
        subtitle="Monitoramento de inadimplência"
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por cliente..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <ActionButton variant="secondary" className="w-full sm:w-auto">
            <Filter className="w-4 h-4" /> Filtros
          </ActionButton>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-medium">Carregando dados...</div>
        ) : inadimplentes.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            Nenhum cliente em atraso encontrado.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>Valor Vencido</Th>
                <Th>Dias de Atraso</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {inadimplentes.map((item) => {
                const diffTime = Math.abs(new Date().getTime() - new Date(item.due_date).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return (
                  <Tr key={item.id}>
                    <Td className="font-bold">{item.customers?.name || '-'}</Td>
                    <Td className="font-black text-rose-600">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Td>
                    <Td className="text-gray-500 font-medium">{diffDays} dias</Td>
                    <Td className="text-right">
                      <button className="text-emerald-600 font-bold text-xs hover:underline">Negociar</button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
