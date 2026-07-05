-- Módulo Consultas (ex-Pediatria Completa): registro clínico por atendimento.
-- 1 registro por agendamento (anamnese, exame físico, conclusão diagnóstica).
-- Medições ficam em medicoes_pediatricas e prescrições em prescricoes.
create table public.registros_consulta (
  id uuid primary key default uuid_generate_v4(),
  clinica_id uuid not null references public.clinica(id) on delete cascade,
  agendamento_id uuid not null unique references public.agendamentos(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  anamnese text,
  exame_fisico text,
  conclusao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_registros_consulta_paciente on public.registros_consulta(paciente_id);
create index idx_registros_consulta_clinica on public.registros_consulta(clinica_id);

create trigger trg_registros_consulta_updated_at
  before update on public.registros_consulta
  for each row execute function public.fn_updated_at();

alter table public.registros_consulta enable row level security;

-- Mesmo padrão das demais tabelas: isolamento por clinica_id direto.
create policy registros_consulta_all on public.registros_consulta
  for all
  using (private.is_platform_admin() or clinica_id = private.auth_clinica_id())
  with check (private.is_platform_admin() or clinica_id = private.auth_clinica_id());
