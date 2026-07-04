-- Curvas de crescimento (Pediatria Completa): sexo do paciente + medições.
-- `sexo` é nullable no banco — a obrigatoriedade vale só pra clínicas com a
-- feature pediatria_completa e é validada na server action (decisão de UI,
-- clínicas do tipo geral não são afetadas).
alter table public.pacientes
  add column sexo text check (sexo in ('M', 'F'));

create table public.medicoes_pediatricas (
  id uuid primary key default uuid_generate_v4(),
  clinica_id uuid not null references public.clinica(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  data date not null,
  peso_kg numeric(5,2) check (peso_kg > 0),
  altura_cm numeric(5,1) check (altura_cm > 0),
  perimetro_cefalico_cm numeric(4,1) check (perimetro_cefalico_cm > 0),
  registrado_por uuid references public.profissionais(id) on delete set null,
  created_at timestamptz not null default now(),
  -- linha sem nenhuma medida não serve pra nada
  check (peso_kg is not null or altura_cm is not null or perimetro_cefalico_cm is not null)
);

create index idx_medicoes_pediatricas_paciente on public.medicoes_pediatricas(paciente_id);
create index idx_medicoes_pediatricas_clinica on public.medicoes_pediatricas(clinica_id);
create index idx_medicoes_pediatricas_registrado_por on public.medicoes_pediatricas(registrado_por);

alter table public.medicoes_pediatricas enable row level security;

-- Mesmo padrão de despesas_fixas: isolamento por clinica_id direto.
create policy medicoes_pediatricas_all on public.medicoes_pediatricas
  for all
  using (private.is_platform_admin() or clinica_id = private.auth_clinica_id())
  with check (private.is_platform_admin() or clinica_id = private.auth_clinica_id());
