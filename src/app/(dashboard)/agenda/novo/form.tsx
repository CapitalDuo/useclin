'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createAgendamentoAction } from '../actions'

type Paciente = { id: string; nome: string }
type Profissional = { id: string; nome: string; especialidade: string | null }
type Tipo = { id: string; nome: string; cor: string; duracao_padrao: string | null }

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor((total % (24 * 60)) / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function parseInterval(pgInterval: string | null): number {
  if (!pgInterval) return 30
  const m = pgInterval.match(/(\d+):(\d+):(\d+)/)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  const num = pgInterval.match(/(\d+)/)
  return num ? Number(num[1]) : 30
}

export function NovoAgendamentoForm({
  pacientes,
  profissionais,
  tipos,
  defaultPacienteId,
  defaultData,
}: {
  pacientes: Paciente[]
  profissionais: Profissional[]
  tipos: Tipo[]
  defaultPacienteId: string
  defaultData: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pacienteId, setPacienteId] = useState(defaultPacienteId || (pacientes[0]?.id ?? ''))
  const [profissionalId, setProfissionalId] = useState(profissionais[0]?.id ?? '')
  const [tipoId, setTipoId] = useState('none')
  const [data, setData] = useState(defaultData || todayISO())
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFim, setHoraFim] = useState('09:30')

  function handleTipoChange(id: string) {
    setTipoId(id)
    const tipo = tipos.find((t) => t.id === id)
    if (tipo) {
      const dur = parseInterval(tipo.duracao_padrao)
      setHoraFim(addMinutes(horaInicio, dur))
    }
  }

  function handleHoraInicioChange(t: string) {
    setHoraInicio(t)
    const tipo = tipos.find((x) => x.id === tipoId)
    const dur = tipo ? parseInterval(tipo.duracao_padrao) : 30
    setHoraFim(addMinutes(t, dur))
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createAgendamentoAction(formData)
    if (result && !result.ok) {
      setPending(false)
      setError(result.error)
    }
  }

  if (pacientes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[14px] p-8 text-center">
        <h2 className="font-playfair text-lg font-bold mb-2">Cadastre um paciente primeiro</h2>
        <p className="text-sm text-muted mb-5">Você precisa ter pelo menos um paciente ativo pra agendar uma consulta.</p>
        <Link
          href="/pacientes/novo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all cursor-pointer"
        >
          + Cadastrar paciente
        </Link>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-8 flex flex-col gap-5">
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Paciente *</label>
        <select
          name="paciente_id"
          required
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
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
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
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
            value={tipoId}
            onChange={(e) => handleTipoChange(e.target.value)}
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
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Início *</label>
          <input
            type="time"
            name="hora_inicio"
            required
            value={horaInicio}
            onChange={(e) => handleHoraInicioChange(e.target.value)}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Fim *</label>
          <input
            type="time"
            name="hora_fim"
            required
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Status</label>
          <select
            name="status"
            defaultValue="agendado"
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
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Valor (opcional)</label>
          <input
            type="text"
            name="valor"
            placeholder="150,00"
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Notas</label>
        <textarea
          name="notas"
          rows={3}
          placeholder="Observações sobre a consulta…"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
          {pending ? 'Agendando…' : 'Agendar consulta →'}
        </button>
      </div>
    </form>
  )
}
