-- Tabela para armazenar mensagens WhatsApp recebidas via n8n (webhook incoming)
-- Usada para Supabase Realtime: UI atualiza em tempo real sem polling manual
CREATE TABLE public.whatsapp_mensagens (
  id              uuid        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id      text        UNIQUE,
  instance_name   text        NOT NULL,
  remote_jid      text        NOT NULL,
  from_me         boolean     NOT NULL DEFAULT false,
  push_name       text,
  message_type    text,
  text            text,
  file_url        text,
  message_timestamp bigint,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Índice principal: buscar conversas recentes por instância
CREATE INDEX idx_wa_msgs_instance_ts
  ON public.whatsapp_mensagens (instance_name, message_timestamp DESC);

-- Índice para filtro por chat específico (Realtime filter + fetch histórico)
CREATE INDEX idx_wa_msgs_instance_jid_ts
  ON public.whatsapp_mensagens (instance_name, remote_jid, message_timestamp DESC);

-- RLS: cada clínica só lê mensagens das suas próprias instâncias
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinica_le_proprias_wa_msgs"
  ON public.whatsapp_mensagens
  FOR SELECT
  USING (
    instance_name IN (
      SELECT wi.nome_instancia
      FROM public.whatsapp_instancias wi
      WHERE wi.clinica_id = (SELECT private.auth_clinica_id())
    )
  );

-- Habilitar Realtime nesta tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_mensagens;
