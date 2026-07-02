-- Permite cada clínica escolher a escala do grid da agenda (20/40/60/90 min).
-- Mora em clinica junto com as outras preferências da clínica (descricao, etc).
alter table clinica
  add column agenda_intervalo_minutos smallint not null default 60
  check (agenda_intervalo_minutos in (20, 40, 60, 90));
