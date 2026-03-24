import { useState, useEffect } from 'react';
import { sidebarService, SidebarModule } from '../services/sidebarService';

export type GroupedModules = Record<string, SidebarModule[]>;

export function useSidebar() {
  const [groupedModules, setGroupedModules] = useState<GroupedModules>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        setLoading(true);
        const data = await sidebarService.getSidebarModules();
        
        // Filter: only enabled modules
        const enabledModules = data.filter(m => m.is_enabled === true);
        console.log('DEBUG: Filtered modules (is_enabled === true):', enabledModules);

        // Group by category
        const grouped = enabledModules.reduce((acc, mod) => {
          const category = mod.category || 'Geral';
          if (!acc[category]) acc[category] = [];
          acc[category].push(mod);
          return acc;
        }, {} as GroupedModules);
        
        console.log('DEBUG: Grouped modules:', grouped);
        setGroupedModules(grouped);
      } catch (error) {
        console.error('Error fetching sidebar modules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  return { groupedModules, loading };
}
