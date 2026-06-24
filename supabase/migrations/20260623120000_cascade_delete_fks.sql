-- Permite deletar uma clínica/usuário e ter tudo ligado removido em cascata.
-- prontuarios.profissional_id e transacoes.paciente_id eram NO ACTION,
-- bloqueando o cascade de clinica → profissionais/pacientes.
alter table prontuarios drop constraint prontuarios_profissional_id_fkey;
alter table prontuarios add constraint prontuarios_profissional_id_fkey
  foreign key (profissional_id) references profissionais(id) on delete cascade;

alter table transacoes drop constraint transacoes_paciente_id_fkey;
alter table transacoes add constraint transacoes_paciente_id_fkey
  foreign key (paciente_id) references pacientes(id) on delete cascade;
