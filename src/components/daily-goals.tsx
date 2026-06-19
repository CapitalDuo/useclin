type Goal = {
  label: string
  pct: number
  gradient: string
}

export function DailyGoals({ goals }: { goals: Goal[] }) {
  return (
    <div className="bg-card border border-border rounded-[18px] p-[18px]" style={{ boxShadow: '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)' }}>
      <div className="font-newsreader font-semibold text-[18px] text-text mb-4">Metas do dia</div>
      <div className="flex flex-col gap-[15px]">
        {goals.map((g) => (
          <div key={g.label}>
            <div className="flex justify-between text-[13px] mb-[7px]">
              <span className="text-muted font-medium">{g.label}</span>
              <span className="font-bold text-text">{g.pct}%</span>
            </div>
            <div className="h-2 rounded-[5px] bg-[#f1f0ed] overflow-hidden">
              <div
                className="h-full rounded-[5px] transition-all"
                style={{ width: `${g.pct}%`, background: g.gradient }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
