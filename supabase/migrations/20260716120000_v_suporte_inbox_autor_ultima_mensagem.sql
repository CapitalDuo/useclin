-- Adiciona ultima_mensagem_autor_tipo à v_suporte_inbox.
-- Usado pelo aviso de suporte no dashboard: ticket com última mensagem do
-- admin (e status não resolvido/fechado) = "suporte respondeu, cliente ainda
-- não viu/respondeu". Sem coluna de "lido" — o aviso some quando o cliente
-- responde (última mensagem vira dele) ou o ticket é resolvido/fechado.
-- CREATE OR REPLACE só ADICIONA coluna no fim, ordem das existentes intacta.
CREATE OR REPLACE VIEW public.v_suporte_inbox
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.assunto,
  t.categoria,
  t.status,
  t.prioridade,
  t.created_at,
  t.updated_at,
  t.clinica_id,
  c.nome AS clinica_nome,
  t.criado_por,
  (SELECT count(*) FROM suporte_mensagens m WHERE m.ticket_id = t.id) AS total_mensagens,
  (SELECT m.conteudo FROM suporte_mensagens m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS ultima_mensagem,
  (SELECT m.created_at FROM suporte_mensagens m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS ultima_mensagem_at,
  (SELECT m.autor_tipo FROM suporte_mensagens m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS ultima_mensagem_autor_tipo
FROM suporte_tickets t
JOIN clinica c ON c.id = t.clinica_id;
