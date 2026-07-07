interface Props {
  label: string
  value: number
  currency?: string
  subtitle?: string
  accent?: boolean
}

export default function ImpactCard({ label, value, currency = '€', subtitle, accent }: Props) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? 'border-[#00c896]/30 bg-[#00c896]/5' : 'border-[#222] bg-[#111]'}`}>
      <p className="text-xs text-[#555] uppercase tracking-widest font-medium mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ? 'text-[#00c896]' : 'text-[#f0ece4]'}`}>
        {currency}{value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {subtitle && <p className="text-xs text-[#555] mt-1">{subtitle}</p>}
    </div>
  )
}
