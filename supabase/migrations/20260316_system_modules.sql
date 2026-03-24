-- Create system_modules table
CREATE TABLE IF NOT EXISTS public.system_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_key TEXT UNIQUE NOT NULL,
    module_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone authenticated can read modules
CREATE POLICY "Enable read access for all authenticated users"
    ON public.system_modules FOR SELECT
    TO authenticated
    USING (true);

-- Only admin_master can update modules
CREATE POLICY "Enable update for admin_master users only"
    ON public.system_modules FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin_master'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin_master'
        )
    );

-- Insert default modules
INSERT INTO public.system_modules (module_key, module_name, enabled) VALUES
    ('dashboard', 'Dashboard / Visão Geral', true),
    ('operacoes', 'Centro de Comando (Operações)', true),
    ('rondas', 'Rondas', true),
    ('ocorrencias', 'Ocorrências', true),
    ('postos', 'Postos', true),
    ('vigilantes', 'Vigilantes', true),
    ('escalas', 'Escalas', true),
    ('clientes', 'Clientes', true),
    ('contratos', 'Contratos', true),
    ('financeiro', 'Financeiro', true),
    ('custos', 'Custos Operacionais', true),
    ('inadimplencia', 'Inadimplência', true),
    ('compliance', 'RH e Compliance', true),
    ('auditoria', 'Auditoria', true),
    ('treinamentos', 'Treinamentos', true),
    ('frota', 'Frota', true),
    ('mapa_risco', 'Mapa de Risco', true),
    ('inteligencia', 'Inteligência e Relatórios', true),
    ('portal_cliente', 'Portal do Cliente', true),
    ('simulador_contratos', 'Simulador de Contratos', true)
ON CONFLICT (module_key) DO NOTHING;
