-- Corrige os 3 itens de segurança mapeados na sessão 8 (advisors Supabase).
-- Nenhum deles muda contrato de API: view segue com as mesmas colunas,
-- função segue com a mesma assinatura e anon/authenticated seguem podendo
-- executar (o agente de IA no n8n chama get_slots_disponiveis via anon key).

-- 1a) v_horarios_clinica era SECURITY DEFINER (advisor 0010) e vazava horários
--     entre clínicas: a view não filtra clinica_id, dependia da RLS de
--     horarios_funcionamento, mas como definer ignorava a RLS do chamador.
ALTER VIEW public.v_horarios_clinica SET (security_invoker = true);

-- 1b) get_slots_disponiveis tinha search_path mutável (advisor 0011): sob
--     SECURITY DEFINER isso é injeção por schema. Fixa search_path = '' e
--     qualifica os nomes de tabela. Segue SECURITY DEFINER de propósito — o
--     agente precisa ler slots ignorando a RLS (chamada anônima via n8n).
CREATE OR REPLACE FUNCTION public.get_slots_disponiveis(
  p_clinica_id uuid,
  p_data date,
  p_profissional_id uuid DEFAULT NULL::uuid,
  p_duracao_minutos integer DEFAULT 30,
  p_intervalo_grade integer DEFAULT 30
)
RETURNS TABLE(
  profissional_id uuid,
  profissional_nome text,
  especialidade text,
  data date,
  hora_inicio time without time zone,
  hora_fim time without time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_dia_semana smallint;
  v_rec        record;
  v_slot       time;
  v_duracao    interval;
  v_grade      interval;
BEGIN
  v_dia_semana := EXTRACT(DOW FROM p_data)::smallint;
  v_duracao    := (p_duracao_minutos || ' minutes')::interval;
  v_grade      := (p_intervalo_grade || ' minutes')::interval;

  FOR v_rec IN
    SELECT
      pr.id            AS prof_id,
      pr.nome          AS prof_nome,
      pr.especialidade AS prof_esp,
      hf.hora_inicio   AS h_inicio,
      hf.hora_fim      AS h_fim,
      hf.intervalo_inicio AS intv_inicio,
      hf.intervalo_fim    AS intv_fim
    FROM public.profissionais pr
    CROSS JOIN public.horarios_funcionamento hf
    WHERE pr.clinica_id  = p_clinica_id
      AND pr.ativo       = true
      AND hf.clinica_id  = p_clinica_id
      AND hf.dia_semana  = v_dia_semana
      AND hf.aberto      = true
      AND (p_profissional_id IS NULL OR pr.id = p_profissional_id)
  LOOP
    v_slot := v_rec.h_inicio;

    LOOP
      EXIT WHEN v_slot + v_duracao > v_rec.h_fim;

      -- Pular intervalo de almoço
      IF v_rec.intv_inicio IS NOT NULL
         AND v_slot < v_rec.intv_fim
         AND (v_slot + v_duracao) > v_rec.intv_inicio
      THEN
        v_slot := v_rec.intv_fim;
        CONTINUE;
      END IF;

      -- Verificar se slot está livre (considerando a duração real do serviço)
      IF NOT EXISTS (
        SELECT 1
        FROM public.agendamentos ag
        WHERE ag.profissional_id = v_rec.prof_id
          AND ag.data            = p_data
          AND ag.status NOT IN  ('cancelado', 'faltou')
          AND ag.hora_inicio     < (v_slot + v_duracao)
          AND ag.hora_fim        > v_slot
      ) THEN
        profissional_id   := v_rec.prof_id;
        profissional_nome := v_rec.prof_nome;
        especialidade     := v_rec.prof_esp;
        data              := p_data;
        hora_inicio       := v_slot;
        hora_fim          := v_slot + v_duracao;
        RETURN NEXT;
      END IF;

      -- Avança pela grade fixa, não pela duração do serviço
      v_slot := v_slot + v_grade;
    END LOOP;
  END LOOP;
END;
$function$;

-- 1c) Bucket logos era público E listável (advisor 0025): a policy de SELECT
--     amplo permitia enumerar todos os arquivos via API. Bucket público serve
--     object URLs SEM policy nenhuma, então basta remover a listagem. Logos
--     seguem aparecendo no app e no PDF de prescrição (n8n usa render/image
--     público). Upload/upsert seguem cobertos por logos_clinic_insert/update.
DROP POLICY IF EXISTS logos_public_read ON storage.objects;
