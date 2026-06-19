import { SearchIcon, BellIcon, SlidersIcon } from '@/components/icons'

export function DashboardTopbar() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-[440px]">
        <SearchIcon className="w-[18px] h-[18px] text-[#b4b1a9] absolute left-[15px] top-1/2 -translate-y-1/2" />
        <input
          placeholder="Buscar pacientes, consultas…"
          className="w-full pl-11 pr-4 py-3 rounded-[13px] border border-border bg-card text-sm outline-none focus:border-[#5b4bd4] transition-colors"
        />
      </div>
      <div className="flex-1" />
      <button className="w-11 h-11 rounded-[13px] border border-border bg-card flex items-center justify-center hover:bg-soft transition-colors relative" aria-label="Notificações">
        <BellIcon className="w-[19px] h-[19px] text-muted" />
        <span className="absolute top-[11px] right-[12px] w-[7px] h-[7px] rounded-full bg-[#f06a6a] border-[1.5px] border-white" />
      </button>
      <button className="w-11 h-11 rounded-[13px] border border-border bg-card flex items-center justify-center hover:bg-soft transition-colors" aria-label="Filtros">
        <SlidersIcon className="w-[19px] h-[19px] text-muted" />
      </button>
    </div>
  )
}
