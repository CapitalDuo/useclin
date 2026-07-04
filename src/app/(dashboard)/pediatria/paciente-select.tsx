'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function PacienteSelect({
  pacientes,
  value,
}: {
  pacientes: { id: string; nome: string }[]
  value: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(id: string) {
    const params = new URLSearchParams(searchParams)
    if (id) params.set('paciente', id)
    else params.delete('paciente')
    router.push(`/pediatria?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer min-w-[260px]"
    >
      <option value="">Selecione um paciente…</option>
      {pacientes.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      ))}
    </select>
  )
}
