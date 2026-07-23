-- FAQ da clínica: perguntas frequentes que alimentam a base do agente de atendimento.
-- Mesma estrutura/RLS de clinica_servicos (gerenciado só pela própria clínica).
CREATE TABLE public.clinica_faq (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinica_id  uuid        NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  pergunta    text        NOT NULL,
  resposta    text        NOT NULL,
  ordem       integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinica_faq_clinica ON public.clinica_faq (clinica_id, ordem);

ALTER TABLE public.clinica_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinica_manage_faq"
  ON public.clinica_faq
  FOR ALL
  USING  (clinica_id = (SELECT private.auth_clinica_id()))
  WITH CHECK (clinica_id = (SELECT private.auth_clinica_id()));
