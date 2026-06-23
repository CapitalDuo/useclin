-- 1. Adiciona coluna maps_url na tabela clinica
ALTER TABLE clinica ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- 2. Cria bucket público para logos das clínicas
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS do bucket logos

-- Leitura pública (qualquer um pode ver os logos)
CREATE POLICY "logos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Upload apenas para membros autenticados da clínica
CREATE POLICY "logos_clinic_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND auth.uid() IN (
    SELECT user_id FROM profissionais
    WHERE clinica_id::text = (storage.foldername(name))[1]
  )
);

-- Atualização (upsert) apenas para membros da clínica
CREATE POLICY "logos_clinic_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND auth.uid() IN (
    SELECT user_id FROM profissionais
    WHERE clinica_id::text = (storage.foldername(name))[1]
  )
);
