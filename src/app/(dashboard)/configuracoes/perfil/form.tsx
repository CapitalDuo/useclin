'use client'

import { useState } from 'react'
import { updateClinicaAction } from '../actions'

type Clinica = {
  id: string
  nome: string
  subtitulo: string | null
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
}

export function PerfilClinicaForm({ clinica }: { clinica: Clinica }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setSaved(false)
    const result = await updateClinicaAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-7 flex flex-col gap-5">
      <div>
        <h2 className="font-playfair text-base font-bold mb-1">Dados da clínica</h2>
        <p className="text-xs text-muted">Informações exibidas no sistema e nas comunicações</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
        <Field label="Nome da clínica" name="nome" required defaultValue={clinica.nome} full />
        <Field label="Subtítulo" name="subtitulo" placeholder="Ex: Clínica Integrativa" defaultValue={clinica.subtitulo ?? ''} full />
        <Field label="CNPJ" name="cnpj" placeholder="00.000.000/0001-00" defaultValue={clinica.cnpj ?? ''} />
        <Field label="Telefone" name="telefone" placeholder="(11) 99999-9999" defaultValue={clinica.telefone ?? ''} />
        <Field label="E-mail" name="email" type="email" placeholder="contato@clinica.com.br" defaultValue={clinica.email ?? ''} full />
        <Field label="Endereço" name="endereco" placeholder="Rua, número, bairro, cidade" defaultValue={clinica.endereco ?? ''} full />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}
      {saved && <div className="text-xs text-green bg-green-light rounded-lg px-3 py-2 font-medium">Alterações salvas ✓</div>}

      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label, name, placeholder, type = 'text', required = false, full = false, defaultValue = '',
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
  required?: boolean
  full?: boolean
  defaultValue?: string
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
      />
    </div>
  )
}
