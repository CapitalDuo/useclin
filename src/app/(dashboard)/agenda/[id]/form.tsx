'use client'

import Link from 'next/link'
import { useState } from 'react'
import { updateAgendamentoAction, deleteAgendamentoAction } from '../actions'

type Paciente = { id: string; nome: string }
type Profissional = { id: string; nome: string; especialidade: string | null }
type Tipo = { id: string; nome: string; cor: string; duracao_padrao: string | null }
type Agendamento = {
  id: string
  paciente_id: string
  profissional_id: string
  tipo_consulta_id: string | null
  data: string
  hora_inicio: string
  hora_fim: string
  status: string
  notas: string | null
  valor: number | null
}

export function EditarAgendamentoForm({
  agendamento,
  pacientes,
  profissionais,
  tipos,
}: {
  agendamento: Agendamento
  pacientes: Paciente[]
  profissionais: Profissional[]
  tipos: Tipo[]
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updateAgendamentoAction(agendamento.id, formData)
    if (result && !result.ok) {
      setPending(false)
      setError(result.error)
    }
  }

  async function handleDelete() {
    setPending(true)
    setError(null)
    const result = await deleteAgendamentoAction(agendamento.id)
    if (result && !result.ok) {
      setPending(false)
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-8 flex flex-col gap-5">
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Paciente *</label>
        <select
          name="paciente_id"
          required
          defaultValue={agendamento.paciente_id}
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
        >
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Profissional *</label>
          <select
            name="profissional_id"
            required
            defaultValue={agendamento.profissional_id}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
          >
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}{p.especialidade ? ` · ${p.especialidade}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo de consulta</label>
          <select
            name="tipo_consulta_id"
            defaultValue={agendamento.tipo_consulta_id ?? 'none'}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
          >
            <option value="none">— sem tipo —</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Data *</label>
          <input
            type="date"
            name="data"
            required
            defaultValue={agendamento.data}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Início *</label>
          <input
            type="time"
            name="hora_inicio"
            required
            defaultValue={agendamento.hora_inicio.slice(0, 5)}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Fim *</label>
          <input
            type="time"
            name="hora_fim"
            required
            defaultValue={agendamento.hora_fim.slice(0, 5)}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Status</label>
          <select
            name="status"
            defaultValue={agendamento.status}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
          >
            <option value="agendado">Agendado</option>
            <option value="em_atendimento">Em andamento</option>
            <option value="concluido">Finalizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="faltou">Faltou</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Valor</label>
          <input
            type="text"
            name="valor"
            defaultValue={agendamento.valor?.toString() ?? ''}
            placeholder="150,00"
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Notas / Observações</label>
        <textarea
          name="notas"
          rows={3}
          defaultValue={agendamento.notas ?? ''}
          placeholder="Observações sobre a consulta…"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red font-semibold">Excluir esta consulta?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2 rounded-[13px] bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              Sim, excluir
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 rounded-[13px] border border-border text-xs font-semibold hover:bg-bg transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-[13px] border border-red/30 text-xs font-semibold text-red hover:bg-red-light transition-colors cursor-pointer"
          >
            Excluir consulta
          </button>
        )}

        <div className="flex gap-3">
          <Link
            href="/agenda"
            className="px-5 py-2.5 rounded-[13px] border border-border text-sm font-semibold hover:bg-bg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </form>
  )
}
