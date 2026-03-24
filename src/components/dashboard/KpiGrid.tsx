"use client";

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { availableKPIs } from './DashboardCustomizer';

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: string;
}

interface KpiGridProps {
  allStats: Stat[];
}

export function KpiGrid({ allStats }: KpiGridProps) {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_kpis');
    setSelectedKPIs(saved ? JSON.parse(saved) : availableKPIs);
  }, []);

  const filteredStats = allStats.filter(stat => selectedKPIs.includes(stat.label));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {filteredStats.map((stat, index) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="card-premium p-4 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${stat.bg} ${stat.color} dark:bg-opacity-10 dark:text-opacity-90 w-10 h-10 rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            {stat.trend && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{stat.trend}</span>}
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
          <h3 className="text-xl font-bold text-soft-black dark:text-white">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}
