'use client'

export function PageLoader({ message = 'Aguarde...' }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 9, 30, 0.88)', backdropFilter: 'blur(10px)' }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner ring com logo mark centralizada */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ border: '3px solid rgba(91, 75, 212, 0.2)', borderTopColor: '#5b4bd4' }}
          />
          <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
            <circle cx="20" cy="20" r="18" stroke="#5b4bd4" strokeWidth="1.5" />
            {/* Marca Useclin — "U" */}
            <path d="M15 14 L15 20 C15 23.7 17.2 26 20 26 C22.8 26 25 23.7 25 20 L25 14 C25 12.8 24.1 12.1 23.2 12.5" stroke="#5b4bd4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <p className="text-sm font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.70)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}
