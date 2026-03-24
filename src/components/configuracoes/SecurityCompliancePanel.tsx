import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  Server, 
  History, 
  Info,
  Settings,
  Sliders
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export function SecurityCompliancePanel() {
  const pillars = [
    {
      id: 'criptografia',
      title: 'Criptografia',
      description: 'Camada de proteção ativa para dados sensíveis.',
      icon: Lock,
      badge: 'Protegido',
      microcopy: 'Dados e comunicações seguem práticas modernas de proteção e transmissão segura.'
    },
    {
      id: 'secrets',
      title: 'Secrets',
      description: 'Gestão controlada de credenciais e variáveis críticas.',
      icon: Key,
      badge: 'Controlado',
      microcopy: 'Credenciais e chaves são tratadas de forma protegida e separada do código visível.'
    },
    {
      id: 'autenticacao',
      title: 'Autenticação',
      description: 'Controle de acesso rigoroso e perfis de autorização.',
      icon: UserCheck,
      badge: 'Seguro',
      microcopy: 'O sistema utiliza camadas de controle de acesso e autenticação segura para usuários autorizados.'
    },
    {
      id: 'infraestrutura',
      title: 'Infraestrutura',
      description: 'Ambiente operacional estável e resiliente.',
      icon: Server,
      badge: 'Monitorado',
      microcopy: 'A aplicação opera em ambiente moderno, com deploy controlado e práticas de proteção operacional.'
    },
    {
      id: 'logs',
      title: 'Logs',
      description: 'Rastreabilidade e governança para eventos relevantes.',
      icon: History,
      badge: 'Auditável',
      microcopy: 'Ações relevantes e eventos importantes podem ser rastreados para reforçar transparência e auditoria.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-white/5 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-brand-green" />
          Segurança e Compliance
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
          Visão consolidada dos pilares de proteção, governança e integridade operacional do sistema.
        </p>
      </div>

      {/* Grid de Pilares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={pillar.id}
            className="group relative bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:border-brand-green/30 dark:hover:border-brand-green/30 transition-all overflow-hidden"
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform duration-300">
                  <pillar.icon className="w-6 h-6 text-brand-green" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                  {pillar.badge}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
                {pillar.description}
              </p>
              
              <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  {pillar.microcopy}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bloco Institucional Final */}
      <div className="mt-8 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5 flex items-start gap-4">
        <div className="p-2 bg-white dark:bg-[#141414] rounded-lg shadow-sm shrink-0">
          <Info className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Nota Institucional</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Este painel tem finalidade exclusivamente informativa e oferece uma visão consolidada dos fundamentos de segurança e compliance da plataforma para acompanhamento do proprietário. Nenhuma ação operacional é necessária nesta tela.
          </p>
        </div>
      </div>
    </div>
  );
}
