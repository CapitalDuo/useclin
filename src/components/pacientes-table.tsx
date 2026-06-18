'use client'

import { useState, useMemo } from 'react'
import { SearchIcon } from '@/components/icons'

export type PacienteRow = {
  id: string | null
  codigo: number | null
  nome: string | null
  iniciais: string | null
  cor: string | null
  cpf: string | null
  data_nascimento: string | null
  telefone: string | null
  status: string | null
  plano_nome: string | null
  ultima_consulta: string | null
  proxima_consulta: string | null
  tags: string[] | null
}

const statusFilters = ['Todos', 'ativo', 'inativo'] as const
const statusLabel: Record<string, string> = { ativo: 'Ativo', inativo: 'Inativo' }

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function planoStyle(plano: string | null) {
  if (!plano) return 'bg-bg text-muted border border-border'
  const p = plano.toLowerCase()
  if (p.includes('unimed')) return 'bg-green-light text-green border border-green/20'
  if (p.includes('bradesco') || p.includes('amil')) return 'bg-red-light text-red border border-red/20'
  return 'bg-bg text-muted border border-border'
}

export function PacientesTable({ pacientes }: { pacientes: PacienteRow[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Todos')
  const [planoFilter, setPlanoFilter] = useState<string>('Todos')

  const planos = useMemo(() => {
    const set = new Set<string>()
    pacientes.forEach((p) => p.plano_nome && set.add(p.plano_nome))
    return ['Todos', ...Array.from(set)]
  }, [pacientes])

  const filtered = pacientes.filter((p) => {
    const matchSearch = (p.nome ?? '').toLowerCase().includes(search.toLowerCase()) || (p.cpf ?? '').includes(search)
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter
    const matchPlano = planoFilter === 'Todos' || p.plano_nome === planoFilter
    return matchSearch && matchStatus && matchPlano
  })

  return (
    <div className="px-10 pt-5 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-border text-[13px] bg-card outline-none focus:border-text transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Status</span>
          <div className="flex gap-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === s
                    ? 'bg-text text-white'
                    : 'bg-card text-muted hover:bg-border border border-border'
                }`}
              >
                {s === 'Todos' ? s : statusLabel[s]}
              </button>
            ))}
          </div>
        </div>

        {planos.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Plano</span>
            <select
              value={planoFilter}
              onChange={(e) => setPlanoFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border outline-none cursor-pointer"
            >
              {planos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[60px]">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[26%]">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[16%]">CPF / Nasc.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[12%]">Última</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[12%]">Próxima</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted w-[12%]">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-sm text-muted">
                  {pacientes.length === 0
                    ? 'Nenhum paciente cadastrado ainda. Clique em "Novo paciente" pra começar.'
                    : 'Nenhum paciente encontrado com esses filtros.'}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id ?? ''} className="border-b border-border last:border-b-0 hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-muted">#{p.codigo}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: p.cor ?? '#b8a88a' }}>
                        {p.iniciais ?? (p.nome ?? '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{p.nome}</div>
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {p.tags.map((tag) => (
                              <span key={tag} className="text-[9px] font-semibold px-1.5 py-px rounded bg-bg text-muted border border-border">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-[13px]">{p.cpf ?? '—'}</div>
                    <div className="text-[11px] text-muted">{formatDate(p.data_nascimento) ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px]">{formatDate(p.ultima_consulta) ?? <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-3.5 text-[13px]">{formatDate(p.proxima_consulta) ?? <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-3.5">
                    {p.plano_nome ? (
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${planoStyle(p.plano_nome)}`}>
                        {p.plano_nome}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${
                      p.status === 'ativo' ? 'bg-green-light text-green' : 'bg-orange-light text-orange'
                    }`}>
                      {statusLabel[p.status ?? ''] ?? p.status}
                    </span>
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
