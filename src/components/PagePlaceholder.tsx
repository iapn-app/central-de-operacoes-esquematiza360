import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-soft-black dark:text-white">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="card-premium p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="bg-brand-green/10 dark:bg-brand-green/20 p-6 rounded-full mb-6">
          <Icon className="w-12 h-12 text-brand-green" />
        </div>
        <h2 className="text-xl font-bold text-soft-black dark:text-white mb-2">Módulo em Desenvolvimento</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Este módulo está sendo estruturado para oferecer a gestão completa de {title.toLowerCase()} do Grupo Esquematiza.
        </p>
        <div className="mt-8 flex gap-4">
          <div className="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-green w-1/3"></div>
          </div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Arquitetura 360°</span>
        </div>
      </div>
    </motion.div>
  );
}
