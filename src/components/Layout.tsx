import React from 'react';
import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  Menu 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { profile } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Removed setInterval to prevent unnecessary re-renders
  // React.useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getModuleTitle = (path: string) => {
    const titles: { [key: string]: string } = {
      '/': 'Visão Geral',
      '/operacoes': 'Centro de Comando',
      '/portal-cliente': 'Portal do Cliente',
      '/vigilantes': 'Gestão de Vigilantes',
      '/escalas': 'Escalas de Serviço',
      '/escalas-inteligentes': 'Escalas Inteligentes (IA)',
      '/postos': 'Gestão de Postos',
      '/rondas': 'Monitoramento de Rondas',
      '/ocorrencias': 'Ocorrências e Alertas',
      '/crise': 'Gestão de Emergências',
      '/clientes': 'Carteira de Clientes',
      '/contratos': 'Gestão de Contratos',
      '/supervisao': 'Painel do Supervisor',
      '/ativos': 'Inventário e Manutenção',
      '/frota': 'Gestão de Frota',
      '/funcionarios': 'Quadro de Funcionários',
      '/treinamentos': 'Treinamentos e Capacitação',
      '/compliance': 'Compliance e Normas',
      '/receitas': 'Controle de Receitas',
      '/financeiro-contratos': 'Contratos Financeiros',
      '/inadimplencia': 'Controle de Inadimplência',
      '/custos': 'Custos Operacionais',
      '/financeiro-operacional': 'Financeiro Operacional',
      '/financeiro': 'Módulo Financeiro',
      '/contas-pagar': 'Contas a Pagar',
      '/contas-receber': 'Contas a Receber',
      '/inteligencia-operacional': 'Inteligência Operacional',
      '/simulador-risco': 'Simulador de Risco por Cliente',
      '/inteligencia': 'Relatórios e BI',
      '/indicadores': 'Indicadores de Performance',
      '/mapa-risco': 'Mapa de Risco',
      '/performance': 'Análise de Performance',
      '/usuarios': 'Gestão de Usuários',
      '/perfis': 'Perfis de Acesso',
      '/configuracoes': 'Configurações do Sistema',
    };
    return titles[path] || 'Sistema 360°';
  };

  const notifications = [
    { id: 1, title: 'Atenção: Boleto de Aluguel vence hoje!', time: 'Agora', type: 'critical', read: false },
    { id: 2, title: 'Alerta: 3 contas críticas exigem ação hoje.', time: 'Há 10 min', type: 'warning', read: false },
    { id: 3, title: 'Alerta: Conta de Energia vence em 24h.', time: 'Há 1 hora', type: 'warning', read: false },
    { id: 4, title: 'Aviso: Licença de Rádio vence amanhã.', time: 'Há 2 horas', type: 'info', read: true },
    { id: 5, title: 'Confirmação: Pagamento da Internet registrado com sucesso.', time: 'Há 3 horas', type: 'success', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          onClick={onMenuOpen}
          className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green hover:bg-brand-green/5 dark:hover:bg-brand-green/10 rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-base lg:text-lg font-bold text-soft-black dark:text-white leading-none mb-1">{getModuleTitle(location.pathname)}</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sessão Segura</span>
          </div>
        </div>
        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 hidden md:block"></div>
        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Horário Local</p>
          <p className="text-xs font-bold text-soft-black dark:text-white">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <ThemeToggle />
        
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "p-2 lg:p-2.5 rounded-xl transition-all relative",
              isNotificationsOpen 
                ? "bg-brand-green/10 text-brand-green dark:bg-brand-green/20" 
                : "text-gray-400 dark:text-gray-500 hover:text-brand-green dark:hover:text-brand-green hover:bg-brand-green/5 dark:hover:bg-brand-green/10"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notificações</h3>
                  <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-2 py-1 rounded-full">
                    {unreadCount} Novas
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto scrollbar-hide">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex gap-3",
                        !notif.read && "bg-brand-green/5 dark:bg-brand-green/10"
                      )}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-500" />}
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm",
                          !notif.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-center">
                  <button className="text-xs font-bold text-brand-green hover:text-emerald-700 transition-colors">
                    Marcar todas como lidas
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 pl-3 lg:pl-6 border-l border-gray-100 dark:border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-soft-black dark:text-white leading-none mb-1">{profile?.nome || 'Usuário'}</p>
            <p className="text-[10px] font-bold text-brand-green uppercase tracking-wider">{profile?.role === 'admin_master' ? 'Admin Master' : (profile?.role === 'financeiro' ? 'Financeiro' : 'Usuário')}</p>
          </div>
          <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-green/20 ring-2 ring-white dark:ring-gray-900 text-sm lg:text-base">
            {profile?.nome ? profile.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'US'}
          </div>
        </div>
      </div>
    </header>
  );
}
