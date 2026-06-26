export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: '3px solid rgba(91, 75, 212, 0.2)', borderTopColor: '#5b4bd4' }}
          />
          <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
            <circle cx="20" cy="20" r="18" stroke="#5b4bd4" strokeWidth="1.5" />
            {/* Marca Useclin — "U" */}
            <path d="M15 14 L15 20 C15 23.7 17.2 26 20 26 C22.8 26 25 23.7 25 20 L25 14 C25 12.8 24.1 12.1 23.2 12.5" stroke="#5b4bd4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted">Carregando seu painel...</p>
      </div>
    </div>
  )
}
