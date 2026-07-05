'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/page-loader'
import { criarPrescricaoAction } from './actions'

type Med = { nome: string; dosagem: string; frequencia: string; duracao: string }

const MED_VAZIO: Med = { nome: '', dosagem: '', frequencia: '', duracao: '' }

export function PrescricaoForm({
  pacienteId,
  agendamentoId,
  dataConsultaDefault,
  voltar,
  onSuccess,
  onCancel,
}: {
  pacienteId: string
  agendamentoId?: string
  dataConsultaDefault: string
  voltar?: string
  /** Usado quando o form roda embutido (ex.: modal na consulta) em vez de numa página própria. */
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [meds, setMeds] = useState<Med[]>([{ ...MED_VAZIO }])

  const addMed = () => setMeds((prev) => [...prev, { ...MED_VAZIO }])
  const removeMed = (i: number) => setMeds((prev) => prev.filter((_, idx) => idx !== i))
  const updateMed = (i: number, field: keyof Med, value: string) =>
    setMeds((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const medsInput = form.elements.namedItem('medicamentos') as HTMLInputElement
    medsInput.value = JSON.stringify(meds.filter((m) => m.nome.trim()))
    startTransition(async () => {
      const result = await criarPrescricaoAction(pacienteId, new FormData(form))
      if (!result.ok) {
        setErro(result.error)
      } else if (onSuccess) {
        onSuccess()
      } else {
        router.push(voltar ?? `/pacientes/${pacienteId}`)
      }
    })
  }

  return (
    <>
      {isPending && <PageLoader />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {agendamentoId && <input type="hidden" name="agendamento_id" value={agendamentoId} />}
        <input type="hidden" name="medicamentos" />

        {/* Diagnóstico */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Diagnóstico
          </label>
          <textarea
            name="diagnostico"
            rows={2}
            placeholder="Diagnóstico principal..."
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors resize-none"
          />
        </div>

        {/* Convênio + Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Convênio
            </label>
            <input
              name="convenio"
              type="text"
              placeholder="Nome do convênio (opcional)"
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Data da consulta
            </label>
            <input
              name="data_consulta"
              type="date"
              defaultValue={dataConsultaDefault}
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
        </div>

        {/* Medicamentos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Medicamentos
            </label>
            <button
              type="button"
              onClick={addMed}
              className="text-xs font-semibold text-[#5b4bd4] hover:text-[#4a3cb8] transition-colors"
            >
              + Adicionar
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {meds.map((med, i) => (
              <div
                key={i}
                className="border border-border rounded-[13px] p-4 flex flex-col gap-3 bg-bg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Medicamento {i + 1}</span>
                  {meds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMed(i)}
                      className="text-xs text-red hover:opacity-70 transition-opacity font-semibold"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <input
                  value={med.nome}
                  onChange={(e) => updateMed(i, 'nome', e.target.value)}
                  placeholder="Nome do medicamento *"
                  className="w-full border border-border rounded-[10px] px-3 py-2 text-sm bg-card focus:outline-none focus:border-[#5b4bd4] transition-colors"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={med.dosagem}
                    onChange={(e) => updateMed(i, 'dosagem', e.target.value)}
                    placeholder="Dosagem"
                    className="border border-border rounded-[10px] px-3 py-2 text-sm bg-card focus:outline-none focus:border-[#5b4bd4] transition-colors"
                  />
                  <input
                    value={med.frequencia}
                    onChange={(e) => updateMed(i, 'frequencia', e.target.value)}
                    placeholder="Frequência"
                    className="border border-border rounded-[10px] px-3 py-2 text-sm bg-card focus:outline-none focus:border-[#5b4bd4] transition-colors"
                  />
                  <input
                    value={med.duracao}
                    onChange={(e) => updateMed(i, 'duracao', e.target.value)}
                    placeholder="Duração"
                    className="border border-border rounded-[10px] px-3 py-2 text-sm bg-card focus:outline-none focus:border-[#5b4bd4] transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plano de tratamento */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Plano de tratamento
          </label>
          <textarea
            name="plano_tratamento"
            rows={3}
            placeholder="Descreva o plano de tratamento..."
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors resize-none"
          />
        </div>

        {/* Orientações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Orientações ao paciente
          </label>
          <textarea
            name="orientacoes"
            rows={3}
            placeholder="Orientações ao paciente..."
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors resize-none"
          />
        </div>

        {erro && (
          <div className="bg-red-light border border-red/20 rounded-[13px] px-4 py-3 text-sm text-red">
            {erro}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-5">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="text-sm text-muted hover:text-text transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b4bd4] text-white rounded-[13px] text-sm font-semibold hover:bg-[#4a3cb8] transition-all hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:pointer-events-none"
          >
            {isPending ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Gerando prescrição...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Gerar Prescrição
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
