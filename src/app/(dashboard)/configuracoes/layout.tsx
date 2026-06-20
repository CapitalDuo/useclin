export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="px-10 pt-7 pb-2">
        <h1 className="font-newsreader text-[28px] font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted mt-0.5">Dados da clínica, agenda, integrações e perfil</p>
      </div>
      {children}
    </>
  )
}
