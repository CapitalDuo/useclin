-- Paciente "Sem cadastro" protegido por clínica
-- Permite que o agente de IA agende consultas sem exigir cadastro prévio.
-- Cada clínica recebe automaticamente um paciente "Sem cadastro" ao concluir
-- o onboarding; esse paciente não pode ser deletado pela clínica.

-- 1. Coluna protegido
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS protegido boolean NOT NULL DEFAULT false;

-- 2. Policies separadas (substitui o FOR ALL que não distinguia DELETE)
DROP POLICY IF EXISTS "pacientes_all" ON pacientes;

CREATE POLICY "pacientes_select" ON pacientes FOR SELECT
  USING (private.is_platform_admin() OR clinica_id = private.auth_clinica_id());

CREATE POLICY "pacientes_insert" ON pacientes FOR INSERT
  WITH CHECK (private.is_platform_admin() OR clinica_id = private.auth_clinica_id());

CREATE POLICY "pacientes_update" ON pacientes FOR UPDATE
  USING (private.is_platform_admin() OR clinica_id = private.auth_clinica_id())
  WITH CHECK (private.is_platform_admin() OR clinica_id = private.auth_clinica_id());

-- Clínicas não conseguem deletar pacientes protegidos.
-- Cascade via FK (deleção da própria clínica) bypassa RLS e funciona normalmente.
CREATE POLICY "pacientes_delete" ON pacientes FOR DELETE
  USING (private.is_platform_admin() OR (clinica_id = private.auth_clinica_id() AND NOT protegido));

-- 3. Função SECURITY DEFINER que cria o paciente ao completar onboarding
CREATE OR REPLACE FUNCTION private.create_sem_cadastro_patient()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.onboarding_completo = true AND (OLD.onboarding_completo IS DISTINCT FROM true) THEN
    INSERT INTO pacientes (clinica_id, nome, iniciais, cor, status, protegido)
    VALUES (NEW.id, 'Sem cadastro', 'SC', '#b0aaa3', 'ativo', true)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Trigger na tabela clinica
DROP TRIGGER IF EXISTS trg_create_sem_cadastro_patient ON clinica;
CREATE TRIGGER trg_create_sem_cadastro_patient
  AFTER UPDATE OF onboarding_completo ON clinica
  FOR EACH ROW
  EXECUTE FUNCTION private.create_sem_cadastro_patient();

-- 5. Backfill para clínicas que já concluíram onboarding
INSERT INTO pacientes (clinica_id, nome, iniciais, cor, status, protegido)
SELECT
  c.id,
  'Sem cadastro',
  'SC',
  '#b0aaa3',
  'ativo',
  true
FROM clinica c
WHERE c.onboarding_completo = true
  AND NOT EXISTS (
    SELECT 1 FROM pacientes p
    WHERE p.clinica_id = c.id AND p.protegido = true
  );
