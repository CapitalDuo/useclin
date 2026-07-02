export function Field({
  label, name, placeholder, type = 'text', required = false, full = false, defaultValue = '',
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
  required?: boolean
  full?: boolean
  defaultValue?: string
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
      />
    </div>
  )
}
