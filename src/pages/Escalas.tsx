-- Tabela de turnos da escala
CREATE TABLE IF NOT EXISTS public.escala_turnos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vigilante_id    UUID REFERENCES public.folha_pagamento(id) ON DELETE SET NULL,
  vigilante_nome  TEXT NOT NULL,
  posto           TEXT NOT NULL,
  empresa         TEXT NOT NULL DEFAULT 'Vigilância',
  horario         TEXT NOT NULL DEFAULT '07:00 - 19:00',
  tipo_turno      TEXT NOT NULL DEFAULT '12x36 D',
  status          TEXT NOT NULL DEFAULT 'presente'
    CHECK (status IN ('presente','falta','troca_pendente','vago','folga')),
  data            DATE NOT NULL,
  observacao      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Tabela de ocorrências de escala (integração com folha)
CREATE TABLE IF NOT EXISTS public.ocorrencias_escala (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vigilante_id    UUID REFERENCES public.folha_pagamento(id) ON DELETE SET NULL,
  vigilante_nome  TEXT NOT NULL,
  posto           TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('falta','hora_extra','troca','vago')),
  data            DATE NOT NULL,
  impacto_folha   TEXT NOT NULL DEFAULT '—',
  processado      BOOLEAN DEFAULT false,
  observacao      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.escala_turnos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias_escala ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escala leitura" ON public.escala_turnos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escala escrita" ON public.escala_turnos
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Ocorrencias leitura" ON public.ocorrencias_escala
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Ocorrencias escrita" ON public.ocorrencias_escala
  FOR ALL TO authenticated USING (true);
