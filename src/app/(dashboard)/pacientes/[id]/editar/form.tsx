'use client'

import Link from 'next/link'
import { useState } from 'react'
import { updatePacienteAction } from '../../actions'

type Plano = { id: string; nome: string; tipo: string }
type Paciente = {
  id: string
  nome: string
  cpf: string | null
  data_nascimento: string | null
  telefone: string | null
  whatsapp: string | null
  email: string | null
  endereco: string | null
  observacoes: string | null
  plano_id: string | null
  valor_plano: number | null
  status: string
}

export function EditarPacienteForm({ paciente, planos }: { paciente: Paciente; planos: Plano[] }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updatePacienteAction(paciente.id, formData)
    if (result && !result.ok) {
      setPending(false)
      setError(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-7 flex flex-col gap-5">
      <div>
        <h3 className="font-playfair text-base font-bold mb-4">Identificação</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome completo" name="nome" required full defaultValue={paciente.nome} />
          <Field label="CPF" name="cpf" defaultValue={paciente.cpf ?? ''} />
          <Field label="Data de nascimento" name="data_nascimento" type="date" defaultValue={paciente.data_nascimento ?? ''} />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Contato</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone" name="telefone" defaultValue={paciente.telefone ?? ''} />
          <Field label="WhatsApp (com DDI)" name="whatsapp" defaultValue={paciente.whatsapp ?? ''} />
          <Field label="Email" name="email" type="email" full defaultValue={paciente.email ?? ''} />
          <Field label="Endereço" name="endereco" full defaultValue={paciente.endereco ?? ''} />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Plano e status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Plano</label>
            <select
              name="plano_id"
              defaultValue={paciente.plano_id ?? 'none'}
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
            >
              <option value="none">Nenhum / não definido</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <Field label="Valor (R$)" name="valor_plano" defaultValue={paciente.valor_plano?.toString() ?? ''} />
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Status</label>
            <select
              name="status"
              defaultValue={paciente.status}
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Observações</h3>
        <textarea
          name="observacoes"
          rows={4}
          defaultValue={paciente.observacoes ?? ''}
          placeholder="Ex: Alergia a níquel. Prefere horários da manhã."
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <Link
          href="/pacientes"
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
