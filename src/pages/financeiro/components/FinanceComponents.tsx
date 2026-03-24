import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function KpiCard({ title, value, subtitle, icon: Icon, colorClass }: { title: string, value: string | React.ReactNode, subtitle?: string, icon: LucideIcon, colorClass: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={cn("p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</div>
        {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{subtitle}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string, label?: string }) {
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  
  const s = status.toLowerCase();
  if (['ativo', 'emitida', 'paga', 'pago', 'entrada', 'positivo', 'aprovados'].includes(s)) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30';
  } else if (['renovar', 'pendente', 'aguardar'].includes(s)) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
  } else if (['inadimplente', 'vencida', 'saída', 'urgente', 'atrasado', 'cancelado'].includes(s)) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30';
  }

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", colorClass)}>
      {label || status}
    </span>
  );
}

export function ActionButton({ children, onClick, variant = 'primary', className, disabled }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'danger' | 'ghost', className?: string, disabled?: boolean }) {
  const baseClass = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow shadow-emerald-600/20",
    secondary: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow shadow-rose-600/20",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseClass, variants[variant], className)}>
      {children}
    </button>
  );
}

export function SectionCard({ title, children, action }: { title?: string, children: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      {(title || action) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {title && <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string, subtitle?: string, actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={cn("px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={cn("px-5 py-4 border-b border-gray-50 dark:border-gray-800/50 text-gray-700 dark:text-gray-300", className)}>
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={cn("hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group", className)}>
      {children}
    </tr>
  );
}
