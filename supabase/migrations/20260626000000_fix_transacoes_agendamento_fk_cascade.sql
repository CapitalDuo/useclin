-- Limpa transações órfãs que ficaram com agendamento_id = NULL
-- por causa de deletes de agendamentos antes do fix do FK.
DELETE FROM public.transacoes
WHERE agendamento_id IS NULL
  AND tipo = 'receita'
  AND descricao IN ('Consulta', 'nada a declararv', 'nasda a delkcaraernasda a delkcaraernasda a delkcaraernasda a delkcaraernasda a delkcaraernasda a delkcaraer');

-- Troca FK de SET NULL → CASCADE: ao deletar um agendamento,
-- a transação vinculada é removida automaticamente pelo banco.
ALTER TABLE public.transacoes
  DROP CONSTRAINT transacoes_agendamento_id_fkey;

ALTER TABLE public.transacoes
  ADD CONSTRAINT transacoes_agendamento_id_fkey
    FOREIGN KEY (agendamento_id)
    REFERENCES public.agendamentos(id)
    ON DELETE CASCADE;
