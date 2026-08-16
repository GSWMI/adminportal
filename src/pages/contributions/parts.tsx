export function PaymentStatusPill({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const cls =
    s === 'success' || s === 'paid' ? 'bg-green-50 text-green-600 border-green-200'
    : s === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200'
    : s === 'failed' || s === 'cancelled' ? 'bg-red-50 text-red-500 border-red-200'
    : 'bg-gray-50 text-gray-500 border-gray-200'
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>{label}</span>
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 px-6 py-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

export function Row({ label, value, strong, mono }: { label: string; value?: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[13px] font-medium text-gray-500">{label}</span>
      <span className={`text-[13px] ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'} ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
