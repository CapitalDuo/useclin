-- 1 agendamento => no máximo 1 transação (permite upsert via agendamento_id)
create unique index if not exists transacoes_agendamento_unique
  on public.transacoes(agendamento_id)
  where agendamento_id is not null;

-- View consolidada para a aba Financeiro (security_invoker honra a RLS do consumidor)
drop view if exists v_financeiro_entradas;
create view v_financeiro_entradas with (security_invoker = true) as
select
  t.id,
  t.agendamento_id,
  t.paciente_id,
  t.tipo,
  t.valor,
  t.status,
  t.data,
  t.descricao,
  t.forma_pagamento,
  t.created_at,
  p.nome as paciente_nome,
  p.iniciais as paciente_iniciais,
  p.cor as paciente_cor,
  p.clinica_id,
  a.hora_inicio as agendamento_hora,
  tc.nome as tipo_consulta_nome
from transacoes t
join pacientes p on p.id = t.paciente_id
left join agendamentos a on a.id = t.agendamento_id
left join tipos_consulta tc on tc.id = a.tipo_consulta_id;
