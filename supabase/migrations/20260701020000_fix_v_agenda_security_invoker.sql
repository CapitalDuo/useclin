-- v_agenda foi recriada fora deste repo (via claude.ai) para expor
-- profissional_id/paciente_id e perdeu o security_invoker=true no processo,
-- fazendo a view rodar como o dono (postgres) e ignorar o RLS de
-- agendamentos/pacientes. Como o app consulta v_agenda sem filtrar
-- clinica_id manualmente (confia 100% no RLS), isso vazava agendamentos
-- de todas as clínicas pra qualquer usuário autenticado (e anon).
-- Confirmado via advisors do Supabase (lint security_definer_view, ERROR).
ALTER VIEW public.v_agenda SET (security_invoker = true);
