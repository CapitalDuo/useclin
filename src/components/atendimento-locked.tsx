import { ChatIcon } from '@/components/icons'

const PREVIEW_CONVOS = [
  { ini: 'A', nome: 'Acir Principal', msg: 'Oi', hora: '10:07', n: 3, cor: '#b8a88a' },
  { ini: 'R', nome: 'Rapha', msg: 'teste', hora: '09:36', n: 2, cor: '#5dcaa5' },
  { ini: 'MC', nome: 'Marina Costa', msg: 'Obrigada, doutora!', hora: '16/06', n: 0, cor: '#7f77dd' },
  { ini: 'JP', nome: 'João Pedro', msg: '[mídia]', hora: '18/05', n: 0, cor: '#b8a88a' },
  { ini: 'RN', nome: 'Rafael Nascimento', msg: 'Bom dia! Tudo certo?', hora: '23/04', n: 0, cor: '#5dcaa5' },
  { ini: 'G', nome: 'Gilberto Abreu', msg: 'Combinado então', hora: '23/04', n: 0, cor: '#1d9e75' },
]

// Preview desfocado da aba de Atendimento (sem componente real — evita
// disparar conexões WhatsApp/n8n) com o aviso de upgrade centralizado por cima.
export function AtendimentoLocked() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10">
      <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Atendimento</h1>
      <p className="text-sm text-muted mt-0.5">Converse com seus pacientes e gerencie atendimentos.</p>

      <div className="relative mt-6">
        {/* Preview desfocado e não interativo */}
        <div aria-hidden className="pointer-events-none select-none blur-[3px] opacity-60">
          <div className="bg-card border border-border rounded-[16px] overflow-hidden flex h-[560px]">
            {/* Lista de conversas */}
            <div className="w-[360px] border-r border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="h-10 rounded-[12px] bg-bg border border-border" />
              </div>
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] bg-green-light text-green text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-green/20 flex items-center justify-center">●</span>
                  WhatsApp conectado
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {PREVIEW_CONVOS.map((c) => (
                  <div key={c.nome} className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: c.cor }}>
                      {c.ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text truncate">{c.nome}</div>
                      <div className="text-xs text-muted truncate">{c.msg}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[11px] text-muted">{c.hora}</span>
                      {c.n > 0 && (
                        <span className="w-5 h-5 rounded-full bg-green text-white text-[11px] font-semibold flex items-center justify-center">{c.n}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Painel vazio */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted">
              <ChatIcon className="w-12 h-12 opacity-40" />
              <div className="text-sm font-semibold">Selecione uma conversa</div>
              <div className="text-xs">Clique em um contato à esquerda para visualizar as mensagens.</div>
            </div>
          </div>
        </div>

        {/* Aviso centralizado por cima */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-[18px] shadow-2xl px-8 py-10 max-w-md text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#f1eefb] flex items-center justify-center">
              <ChatIcon className="w-8 h-8 text-[#5b4bd4]" />
            </div>
            <div>
              <h2 className="font-playfair text-[22px] font-extrabold tracking-tight mb-2">
                Disponível no Plano Completo
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                O módulo de Atendimento via WhatsApp e Agente de IA está disponível no Plano Completo por R$ 349/mês.
              </p>
            </div>
            <a href="/configuracoes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b4bd4] text-white rounded-[13px] text-sm font-semibold hover:bg-[#4a3cb8] transition-all hover:-translate-y-px hover:shadow-lg">
              Ver planos em Configurações
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
