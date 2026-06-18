import { createClient } from '@/lib/supabase/server'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()

  const { data: profissionais } = await supabase
    .from('profissionais')
    .select('id, nome, email, role, ativo, user_id, clinica_id, created_at, clinica:clinica_id(nome)')
    .order('created_at', { ascending: false })

  return (
    <div className="px-10 pt-7 pb-10">
      <div className="mb-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted mt-0.5">
          {profissionais?.length ?? 0} usuário{profissionais?.length === 1 ? '' : 's'} no total
        </p>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Nome</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Email</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Clínica</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Função</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Acesso</th>
            </tr>
          </thead>
          <tbody>
            {profissionais?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-sm text-muted">
                  Nenhum usuário ainda.
                </td>
              </tr>
            ) : (
              profissionais?.map((p) => {
                const c = p.clinica as { nome: string } | null
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold">{p.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted">{p.email ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-muted">{c?.nome ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-bg text-text">
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.user_id ? (
                        <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-green-light text-green">Ativo</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-orange-light text-orange">Pendente convite</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
