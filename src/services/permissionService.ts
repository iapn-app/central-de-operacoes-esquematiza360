import { supabase } from '../lib/supabase';

export interface ModulePermissions {
  module_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

export const permissionService = {
  async getMyPermissions(): Promise<ModulePermissions[]> {
    const { data, error } = await supabase.rpc('get_my_module_permissions');
    if (error) throw error;
    return data || [];
  }
};
