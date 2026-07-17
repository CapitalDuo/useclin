-- Lembrete de consulta: horário configurável pelo usuário (antes fixo em 24h)
alter table notificacao_config add column horas_antes smallint null;

-- Confirmação por WhatsApp vira Mensagem de aniversário: texto pré-pronto pelo usuário
alter table notificacao_config add column mensagem text null;
update notificacao_config set tipo = 'aniversario' where tipo = 'confirmacao_whatsapp';
