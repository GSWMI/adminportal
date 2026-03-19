import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'
import { useTicketStore } from '../../store/ticketStore'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface QuantityState {
  [dayId: string]: {
    [slotId: string]: {
      [optionId: string]: { qty: number; selectedOption: string }
    }
  }
}

export default function TicketPreviewPage() {
  const { form } = useTicketStore()
  const navigate = useNavigate()
  const [mealOpen, setMealOpen] = useState(true)
  const [activeDay, setActiveDay] = useState(0)
  const [quantities, setQuantities] = useState<QuantityState>({})

  const days = form.days
  const tabs = [...days.map((d) => d.label), 'Total meal summary']

  const setQty = (dayId: string, slotId: string, optId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[dayId]?.[slotId]?.[optId]?.qty ?? 0
      const newQty = Math.max(0, current + delta)
      return {
        ...prev,
        [dayId]: {
          ...(prev[dayId] ?? {}),
          [slotId]: {
            ...(prev[dayId]?.[slotId] ?? {}),
            [optId]: { qty: newQty, selectedOption: optId },
          },
        },
      }
    })
  }

  const setSelectedOption = (dayId: string, slotId: string, optId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] ?? {}),
        [slotId]: {
          ...(prev[dayId]?.[slotId] ?? {}),
          [optId]: { qty: prev[dayId]?.[slotId]?.[optId]?.qty ?? 0, selectedOption: optId },
        },
      },
    }))
  }

  // Compute totals
  interface SummaryRow {
    dayLabel: string
    slot: string
    option: string
    qty: number
    price: number
    total: number
  }
  const summaryRows: SummaryRow[] = []
  let grandTotal = 0

  days.forEach((day) => {
    day.slots.forEach((slot) => {
      slot.options.forEach((opt) => {
        const qty = quantities[day.id]?.[slot.id]?.[opt.id]?.qty ?? 0
        if (qty > 0) {
          const total = qty * opt.price
          grandTotal += total
          summaryRows.push({
            dayLabel: day.label,
            slot: slot.name,
            option: opt.name,
            qty,
            price: opt.price,
            total,
          })
        }
      })
    })
  })

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Preview banner */}
      <div className="bg-[#fff8e6] border-b border-[#f0d080] px-6 py-3 flex items-center justify-between">
        <span className="text-[14px] font-semibold text-gray-800">You are in preview mode</span>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-orange-400 text-white text-[13px] font-semibold rounded-lg hover:bg-orange-500 transition-colors"
        >
          Exit preview mode
        </button>
      </div>

      {/* Public header */}
      <header className="bg-[#0d1b2a] px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white text-lg font-bold font-serif italic">╱GSWMI</span>
          <span className="text-white/40 text-[8px] tracking-widest uppercase">Gbenga Samuel-Wemimo Ministry International</span>
        </div>
        <a href="#" className="text-white/80 text-[13px] underline hover:text-white">Contact support</a>
      </header>

      {/* Announcement banner */}
      <div className="bg-blue-50 text-center py-2 text-[12px] text-blue-600">
        Announcement/ event notice/ general update banner in slow motion
      </div>

      {/* Event hero */}
      <div className="max-w-240 mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="grid grid-cols-[1fr_1fr] min-h-75">
            {/* Banner */}
            <div className="overflow-hidden">
              {form.bannerPreview ? (
                <img src={form.bannerPreview} alt={form.programName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No banner</div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{form.programName || 'Event Name'}</h1>
              {form.description && (
                <div className="text-[14px] text-gray-600 leading-relaxed line-clamp-4">
                  <div dangerouslySetInnerHTML={{ __html: form.description }} />
                  <button className="text-[#3b5bdb] text-[13px] hover:underline ml-1">Read more</button>
                </div>
              )}
              {form.startDate && (
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <Calendar size={14} className="text-[#3b5bdb]" />
                  {formatDate(form.startDate)}{form.endDate && ` – ${formatDate(form.endDate)}`}
                </div>
              )}
              {form.location && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                    <MapPin size={13} className="text-[#3b5bdb]" />
                    <span className="text-[13px] text-gray-600">{form.location}</span>
                  </div>
                  <div className="flex-1 h-12 bg-gray-100 flex items-center justify-center text-[11px] text-gray-400">
                    Map preview
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal ticket section */}
        {form.ticketType === 'Meal' && (
          <div>
            <button
              type="button"
              onClick={() => setMealOpen((v) => !v)}
              className="flex items-center gap-2 text-[#3b5bdb] font-semibold text-[16px] mb-4"
            >
              {mealOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              Meal ticket
            </button>

            {mealOpen && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDay(i)}
                      className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                        activeDay === i
                          ? 'border-gray-900 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Day content */}
                {activeDay < days.length && (
                  <DayContent
                    day={days[activeDay]}
                    quantities={quantities}
                    onQty={setQty}
                    onSelect={setSelectedOption}
                  />
                )}

                {/* Total summary */}
                {activeDay === days.length && (
                  <TotalSummary rows={summaryRows} grandTotal={grandTotal} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="py-4 text-center text-[12px] text-gray-400 border-t border-gray-200">
        © GSWMI Logistics Team
      </footer>
    </div>
  )
}

function DayContent({
  day,
  quantities,
  onQty,
  onSelect,
}: {
  day: ReturnType<typeof useTicketStore.getState>['form']['days'][0]
  quantities: QuantityState
  onQty: (dayId: string, slotId: string, optId: string, delta: number) => void
  onSelect: (dayId: string, slotId: string, optId: string) => void
}) {
  const activeSlots = day.slots.filter((s) => s.options.length > 0)

  return (
    <div className="p-5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-[12px] text-gray-500 font-medium pb-3 w-28">Slot</th>
            <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Meal option X Price</th>
            <th className="text-right text-[12px] text-gray-500 font-medium pb-3">Quantity (Max. 5 packs)</th>
          </tr>
        </thead>
        <tbody>
          {activeSlots.map((slot) => (
            <tr key={slot.id} className="border-b border-gray-50 last:border-0">
              <td className="py-4 text-[13px] font-medium text-gray-700 align-top">{slot.name}</td>
              <td className="py-4">
                {slot.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 mb-1 last:mb-0">
                    <input
                      type="radio"
                      name={`slot-${slot.id}`}
                      className="accent-[#3b5bdb]"
                      onChange={() => onSelect(day.id, slot.id, opt.id)}
                    />
                    <span className="text-[13px] text-gray-600 truncate max-w-50">{opt.name}</span>
                    <span className="text-[12px] text-gray-400">-</span>
                    <span className="text-[13px] text-gray-700">₦{opt.price.toLocaleString()}</span>
                  </div>
                ))}
              </td>
              <td className="py-4 align-top">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onQty(day.id, slot.id, slot.options[0]?.id, -1)}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-[14px] font-medium w-4 text-center">
                    {quantities[day.id]?.[slot.id]?.[slot.options[0]?.id]?.qty ?? 0}
                  </span>
                  <button
                    onClick={() => onQty(day.id, slot.id, slot.options[0]?.id, 1)}
                    className="w-7 h-7 rounded-full border border-[#3b5bdb] text-[#3b5bdb] flex items-center justify-center hover:bg-blue-50 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <span className="text-[12px] text-gray-400">packs</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TotalSummary({ rows, grandTotal }: { rows: { dayLabel: string; slot: string; option: string; qty: number; price: number; total: number }[]; grandTotal: number }) {
  return (
    <div className="p-5">
      {rows.length === 0 ? (
        <p className="text-[13px] text-gray-400 text-center py-4">No items selected yet</p>
      ) : (
        <>
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Day X Slot</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Meal option</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Qty</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Price per meal</th>
                <th className="text-right text-[12px] text-gray-500 font-medium pb-3">Total amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                rows.reduce((acc, row) => {
                  if (!acc[row.dayLabel]) acc[row.dayLabel] = []
                  acc[row.dayLabel].push(row)
                  return acc
                }, {} as Record<string, typeof rows>)
              ).map(([dayLabel, dayRows]) => (
                <>
                  <tr key={dayLabel}>
                    <td colSpan={5} className="pt-4 pb-1">
                      <span className="text-[11px] font-bold text-[#3b5bdb] uppercase tracking-wide">{dayLabel}</span>
                    </td>
                  </tr>
                  {dayRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-[13px] text-gray-700">{row.slot}</td>
                      <td className="py-2 text-[13px] text-gray-700 max-w-45 truncate">{row.option}</td>
                      <td className="py-2 text-[13px] text-gray-700">{row.qty}</td>
                      <td className="py-2 text-[13px] text-gray-700">₦{row.price.toLocaleString()}</td>
                      <td className="py-2 text-[13px] text-gray-700 text-right">₦{row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-5">
            <span className="text-[15px] font-semibold text-gray-900">Total</span>
            <span className="text-[15px] font-bold text-gray-900">₦{grandTotal.toLocaleString()}</span>
          </div>

          <button className="w-full py-3 bg-[#3b5bdb] text-white rounded-lg text-[14px] font-semibold hover:bg-[#3451c7] transition-colors flex items-center justify-center gap-2">
            Register & make payment
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}