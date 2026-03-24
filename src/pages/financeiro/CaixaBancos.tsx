import React, { useState, useEffect } from 'react';
import { Building2, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { KpiCard, StatusBadge, ActionButton, SectionCard, PageHeader, Table, Th, Td, Tr } from './components/FinanceComponents';

export function CaixaBancos() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accs, trans] = await Promise.all([
          financeService.getBankAccounts(),
          financeService.getBankTransactions()
        ]);
        setAccounts(accs);
        setTransactions(trans);
      } catch (error) {
        console.error('Error fetching bank data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-500 font-medium">Carregando dados...</div>;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Caixa e Bancos" 
        subtitle="Saldos e extratos bancários"
        actions={
          <ActionButton>
            <Plus className="w-4 h-4 mr-2" /> Nova Conta
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <KpiCard 
            key={acc.id} 
            title={acc.name} 
            value={`R$ ${acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            subtitle="Saldo atual" 
            icon={Building2} 
            colorClass="text-emerald-500" 
          />
        ))}
      </div>

      <SectionCard title="Extrato Simplificado" action={<ActionButton variant="ghost">Ver todos</ActionButton>}>
        <Table>
          <thead>
            <tr>
              <Th>Descrição</Th>
              <Th>Data</Th>
              <Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <Tr key={t.id}>
                <Td className="font-bold">{t.description}</Td>
                <Td className="text-gray-500 font-medium">{new Date(t.date).toLocaleDateString('pt-BR')}</Td>
                <Td className={`font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'credit' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>
    </div>
  );
}
