-- Tipo de clínica + overrides de features por clínica.
-- Os DEFAULTS por tipo vivem em código (src/lib/features.ts) — assim uma
-- feature nova vale pra todas as clínicas sem migration/backfill. A coluna
-- `features` guarda SÓ overrides individuais (ex: '{"atendimento": false}').
alter table public.clinica
  add column tipo_clinica text not null default 'geral',
  add column features jsonb not null default '{}'::jsonb;
