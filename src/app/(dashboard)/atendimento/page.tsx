import { PacientesView } from '@/components/pacientes-view'

export default function AtendimentoPage() {
  return (
    <>
      <div className="flex items-center justify-between px-10 pt-7">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Atendimento</h1>
          <p className="text-sm text-muted mt-0.5">Converse com seus pacientes e gerencie atendimentos.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer">
            + Novo agendamento
          </button>
        </div>
      </div>
      <PacientesView />
    </>
  )
}
