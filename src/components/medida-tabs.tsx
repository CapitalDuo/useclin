'use client'

import { useState } from 'react'

/** Chips que alternam entre conteúdos pré-renderizados no servidor
 *  (os 3 gráficos de crescimento) — troca instantânea, sem round-trip. */
export function MedidaTabs({ abas }: { abas: { label: string; conteudo: React.ReactNode }[] }) {
  const [ativa, setAtiva] = useState(0)

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {abas.map((aba, i) => (
          <button
            key={aba.label}
            type="button"
            onClick={() => setAtiva(i)}
            className={`px-4 py-2 rounded-[11px] text-[13px] font-semibold transition-colors cursor-pointer ${
              i === ativa ? 'bg-text text-white' : 'border border-border text-muted hover:text-text hover:bg-bg'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>
      {abas[ativa].conteudo}
    </div>
  )
}
