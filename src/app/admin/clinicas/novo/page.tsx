import { NovaClinicaForm } from './form'

export default function NovaClinicaPage() {
  return (
    <div className="px-10 pt-7 pb-10 max-w-[680px]">
      <div className="mb-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Nova clínica</h1>
        <p className="text-sm text-muted mt-0.5">
          Cadastre uma clínica e o primeiro usuário administrador dela
        </p>
      </div>

      <NovaClinicaForm />
    </div>
  )
}
