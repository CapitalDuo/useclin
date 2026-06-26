-- 1. Intervalo de almoço nos horários de funcionamento
ALTER TABLE public.horarios_funcionamento
  ADD COLUMN IF NOT EXISTS intervalo_inicio time,
  ADD COLUMN IF NOT EXISTS intervalo_fim    time;

-- 2. Serviços prestados pela clínica
CREATE TABLE public.clinica_servicos (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinica_id  uuid        NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  nome        text        NOT NULL,
  valor       numeric(10,2),
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinica_servicos_clinica ON public.clinica_servicos (clinica_id);

ALTER TABLE public.clinica_servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinica_manage_servicos"
  ON public.clinica_servicos
  FOR ALL
  USING  (clinica_id = (SELECT private.auth_clinica_id()))
  WITH CHECK (clinica_id = (SELECT private.auth_clinica_id()));

-- 3. Planos e convênios aceitos pela clínica
CREATE TABLE public.clinica_convenios (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinica_id  uuid        NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  nome        text        NOT NULL,
  valor       numeric(10,2),
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinica_convenios_clinica ON public.clinica_convenios (clinica_id);

ALTER TABLE public.clinica_convenios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinica_manage_convenios"
  ON public.clinica_convenios
  FOR ALL
  USING  (clinica_id = (SELECT private.auth_clinica_id()))
  WITH CHECK (clinica_id = (SELECT private.auth_clinica_id()));
