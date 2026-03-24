import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SystemModule {
  id: string;
  module_key: string;
  module_name: string;
  enabled: boolean;
  created_at?: string;
}

export function useModules() {
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [allModules, setAllModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_modules')
        .select('id, module_key, module_name, enabled')
        .order('module_name');
      
      if (error) {
        console.error('Error fetching modules:', error);
      } else if (data) {
        setAllModules(data);
        const moduleMap = data.reduce((acc, mod) => {
          acc[mod.module_key] = mod.enabled;
          return acc;
        }, {} as Record<string, boolean>);
        setModules(moduleMap);
      }
    } catch (err) {
      console.error('Unexpected error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const toggleModule = async (module_key: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('system_modules')
        .update({ enabled })
        .eq('module_key', module_key);
      
      if (error) {
        console.error('Error updating module:', error);
        return { error };
      }

      setModules(prev => ({ ...prev, [module_key]: enabled }));
      setAllModules(prev => prev.map(m => m.module_key === module_key ? { ...m, enabled } : m));
      return { error: null };
    } catch (err) {
      console.error('Unexpected error updating module:', err);
      return { error: err };
    }
  };

  return { modules, allModules, loading, toggleModule, refreshModules: fetchModules };
}
