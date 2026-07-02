'use client'

import Link from 'next/link'
import { createPacienteAction } from '../actions'
import { PageLoader } from '@/components/page-loader'
import { Field } from '@/components/ui/field'
import { usePendingAction } from '@/hooks/use-pending-action'

type Plano = { id: string; nome: string; tipo: string }

export function NovoPacienteForm({ planos }: { planos: Plano[] }) {
  const { pending, error, run } = usePendingAction()

  function handleSubmit(formData: FormData) {
    run(() => createPacienteAction(formData))
  }

  return (
    <>
      {pending && <PageLoader message="Salvando paciente…" />}
      <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-7 flex flex-col gap-5">
      <div>
        <h3 className="font-playfair text-base font-bold mb-4">Identificação</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome completo" name="nome" placeholder="Maria Silva" required full />
          <Field label="CPF" name="cpf" placeholder="000.000.000-00" />
          <Field label="Data de nascimento" name="data_nascimento" type="date" />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Contato</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone" name="telefone" placeholder="(11) 99999-9999" />
          <Field label="WhatsApp (com DDI)" name="whatsapp" placeholder="5511999999999" />
          <Field label="Email" name="email" type="email" placeholder="maria@email.com" full />
          <Field label="Endereço" name="endereco" placeholder="Rua, número, bairro, cidade" full />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Plano</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Plano</label>
            <select
              name="plano_id"
              defaultValue="none"
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
            >
              <option value="none">Nenhum / não definido</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <Field label="Valor do plano (R$)" name="valor_plano" placeholder="0,00" />
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-4">Observações</h3>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">
            Alergias, condições, preferências
          </label>
          <textarea
            name="observacoes"
            rows={4}
            placeholder="Ex: Alergia a níquel. Prefere horários da manhã."
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
          />
        </div>
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
          {pending ? 'Salvando…' : 'Cadastrar paciente'}
        </button>
      </div>
      </form>
    </>
  )
}
