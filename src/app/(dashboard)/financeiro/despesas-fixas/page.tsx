import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteDespesaFixaButton } from '@/components/delete-despesa-fixa-button'
import { formatBrl } from '@/lib/currency'

const CATEGORIA_LABEL: Record<string, string> = {
  aluguel: 'Aluguel',
  salarios: 'Salários',
  utilidades: 'Água, luz, internet',
  material: 'Material / Insumos',
  marketing: 'Marketing',
  impostos: 'Impostos / Taxas',
  assinaturas: 'Assinaturas / Sistemas',
  outros: 'Outros',
}

export default async function DespesasFixasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('despesas_fixas')
    .select('id, nome, categoria, valor, dia_vencimento, ativo')
    .order('nome')

  const despesas = data ?? []

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10">
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <Link href="/financeiro" className="text-xs font-semibold text-muted hover:text-text transition-colors">
            ← Financeiro
          </Link>
          <h1 className="font-newsreader text-[28px] font-semibold tracking-tight leading-tight mt-1">
            Despesas fixas
          </h1>
          <p className="text-sm text-muted mt-1">
            Contas mensais recorrentes que viram pendência automaticamente todo mês.
          </p>
        </div>
        <Link
          href="/financeiro/despesas-fixas/nova"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] bg-text text-white text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
        >
          + Nova despesa fixa
        </Link>
      </div>

      <div className="bg-card border border-border rounded-[14px] max-w-[720px]">
        {despesas.length === 0 ? (
          <div className="text-center text-sm text-muted py-12">
            Nenhuma despesa fixa cadastrada ainda.
          </div>
        ) : (
          despesas.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-6 py-4 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[14px] font-semibold text-text truncate ${!d.ativo ? 'opacity-50' : ''}`}>
                    {d.nome}
                  </span>
                  {!d.ativo && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg text-muted border border-border flex-shrink-0">
                      Pausada
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-muted truncate">
                  {CATEGORIA_LABEL[d.categoria] ?? d.categoria} · Vence dia {d.dia_vencimento}
                </div>
              </div>
              <div className="text-[14px] font-bold text-text flex-shrink-0">{formatBrl(d.valor)}</div>
              <Link
                href={`/financeiro/despesas-fixas/${d.id}/editar`}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-[8px] border border-border hover:bg-bg transition-colors flex-shrink-0"
              >
                Editar
              </Link>
              <DeleteDespesaFixaButton id={d.id} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
