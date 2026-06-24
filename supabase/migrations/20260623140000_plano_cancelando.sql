-- Marca quando a assinatura está agendada para cancelar no fim do período
-- (cancel_at_period_end na Stripe). A pessoa mantém acesso até plano_periodo_fim.
alter table clinica
  add column if not exists plano_cancelando boolean not null default false;
