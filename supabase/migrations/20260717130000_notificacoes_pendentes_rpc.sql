-- Disparo de notificações (lembrete de consulta + aniversário) consumido pelo n8n.
-- Toda a lógica de "quem recebe agora" vive aqui; o n8n só lê, envia e marca.

-- Dedup de aniversário: guarda o ano do último envio (1 mensagem por ano por paciente).
alter table pacientes add column if not exists aniversario_enviado_ano smallint null;

-- Retorna as mensagens prontas para envio neste instante.
create or replace function public.fn_notificacoes_pendentes()
returns table (
  tipo text,
  agendamento_id uuid,
  paciente_id uuid,
  numero text,
  texto text,
  token text
)
language sql
security definer
set search_path = ''
as $$
  with agora as (
    select (now() at time zone 'America/Sao_Paulo') as ts
  ),
  -- Uma instância WhatsApp conectada por clínica (mais recente).
  instancia as (
    select distinct on (clinica_id) clinica_id, api_key
    from public.whatsapp_instancias
    where api_key is not null and status = 'conectado'
    order by clinica_id, created_at desc
  ),
  lembretes as (
    select
      'lembrete_consulta'::text as tipo,
      a.id as agendamento_id,
      p.id as paciente_id,
      regexp_replace(coalesce(p.whatsapp, p.telefone), '\D', '', 'g') as numero_raw,
      'Olá ' || split_part(p.nome, ' ', 1)
        || ', lembrete da sua consulta na ' || c.nome
        || ' em ' || to_char(a.data, 'DD/MM')
        || ' às ' || to_char(a.hora_inicio, 'HH24:MI') || '.' as texto,
      i.api_key as token
    from public.agendamentos a
    join public.profissionais pr on pr.id = a.profissional_id
    join public.clinica c on c.id = pr.clinica_id
    join public.pacientes p on p.id = a.paciente_id
    join public.notificacao_config nc
      on nc.clinica_id = pr.clinica_id and nc.tipo = 'lembrete_consulta' and nc.ativo
    join instancia i on i.clinica_id = pr.clinica_id
    cross join agora
    where a.lembrete_enviado = false
      and a.status not in ('cancelado', 'concluido')
      and coalesce(p.whatsapp, p.telefone) is not null
      and (a.data + a.hora_inicio) > agora.ts
      and (a.data + a.hora_inicio) <= agora.ts + make_interval(hours => coalesce(nc.horas_antes, 24)::int)
  ),
  aniversarios as (
    select
      'aniversario'::text as tipo,
      null::uuid as agendamento_id,
      p.id as paciente_id,
      regexp_replace(coalesce(p.whatsapp, p.telefone), '\D', '', 'g') as numero_raw,
      replace(nc.mensagem, '{nome}', split_part(p.nome, ' ', 1)) as texto,
      i.api_key as token
    from public.pacientes p
    join public.notificacao_config nc
      on nc.clinica_id = p.clinica_id and nc.tipo = 'aniversario' and nc.ativo
    join instancia i on i.clinica_id = p.clinica_id
    cross join agora
    where p.protegido = false
      and p.data_nascimento is not null
      and to_char(p.data_nascimento, 'MM-DD') = to_char(agora.ts, 'MM-DD')
      and extract(hour from agora.ts) >= 8  -- não manda de madrugada
      and coalesce(p.aniversario_enviado_ano, 0) <> extract(year from agora.ts)::int
      and coalesce(p.whatsapp, p.telefone) is not null
      and nc.mensagem is not null and length(trim(nc.mensagem)) > 0
  ),
  todos as (
    select * from lembretes
    union all
    select * from aniversarios
  )
  -- ponytail: número BR local (<=11 dígitos) ganha DDI 55; já com DDI passa direto.
  select
    tipo, agendamento_id, paciente_id,
    case when length(numero_raw) <= 11 then '55' || numero_raw else numero_raw end as numero,
    texto, token
  from todos
  where length(numero_raw) >= 10;
$$;

-- Marca a notificação como enviada (chamado pelo n8n após o envio dar certo).
create or replace function public.fn_marcar_notificacao_enviada(
  p_tipo text,
  p_agendamento_id uuid,
  p_paciente_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_tipo = 'lembrete_consulta' then
    update public.agendamentos set lembrete_enviado = true where id = p_agendamento_id;
  elsif p_tipo = 'aniversario' then
    update public.pacientes
      set aniversario_enviado_ano = extract(year from (now() at time zone 'America/Sao_Paulo'))::int
      where id = p_paciente_id;
  end if;
end;
$$;

-- Só service_role / owner executam (n8n usa a credencial Postgres direta).
revoke execute on function public.fn_notificacoes_pendentes() from anon, authenticated;
revoke execute on function public.fn_marcar_notificacao_enviada(text, uuid, uuid) from anon, authenticated;
