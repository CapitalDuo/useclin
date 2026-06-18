import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminClinicasPage() {
  const supabase = await createClient()
  const { data: clinicas } = await supabase
    .from('clinica')
    .select('id, nome, email, telefone, onboarding_completo, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="px-10 pt-7 pb-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Clínicas</h1>
          <p className="text-sm text-muted mt-0.5">
            {clinicas?.length ?? 0} clínica{clinicas?.length === 1 ? '' : 's'} cadastrada{clinicas?.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href="/admin/clinicas/novo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[10px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
        >
          + Nova clínica
        </Link>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Nome</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Email</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Telefone</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider px-6 py-3">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {clinicas?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-sm text-muted">
                  Nenhuma clínica ainda. Crie a primeira →
                </td>
              </tr>
            ) : (
              clinicas?.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold">{c.nome}</td>
                  <td className="px-6 py-4 text-sm text-muted">{c.email ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-muted">{c.telefone ?? '—'}</td>
                  <td className="px-6 py-4">
                    {c.onboarding_completo ? (
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-green-light text-green">Ativa</span>
                    ) : (
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-orange-light text-orange">Onboarding pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
