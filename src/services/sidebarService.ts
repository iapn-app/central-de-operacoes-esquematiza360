import { supabase } from '../lib/supabase';

export interface SidebarModule {
  key: string;
  label: string;
  icon: string;
  route: string;
  category: string | null;
  is_enabled: boolean;
  is_active: boolean;
}

export const sidebarService = {
  async getSidebarModules(): Promise<SidebarModule[]> {
    console.log('DEBUG: Calling RPC get_my_sidebar_modules...');
    const { data, error } = await supabase.rpc('get_my_sidebar_modules');
    
    if (error) {
      console.error('DEBUG: RPC Error:', error);
      throw error;
    }
    
    console.log('DEBUG: RPC Response:', data);
    return data || [];
  }
};
