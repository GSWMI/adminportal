import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, ChevronDown, ChevronUp, Minus, Plus, Loader2 } from 'lucide-react'
import { getEventBySlug, type EventData } from '../../services/eventService'
import { richTextToPlain } from '../../lib/richText'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface QuantityState {
  [day: number]: {
    [slot: string]: {
      [optionIndex: number]: number
    }
  }
}

export default function PublicEventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [mealOpen, setMealOpen] = useState(true)
  const [activeDay, setActiveDay] = useState(0)
  const [quantities, setQuantities] = useState<QuantityState>({})

  const eventQuery = useQuery({
    queryKey: ['eventSlug', slug ?? ''],
    queryFn: () => getEventBySlug(slug!),
    enabled: !!slug,
  })
  const event = eventQuery.data ?? null
  const loading = eventQuery.isLoading

  const setQty = (day: number, slot: string, optIndex: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[day]?.[slot]?.[optIndex] ?? 0
      const newQty = Math.max(0, current + delta)
      return {
        ...prev,
        [day]: { ...(prev[day] ?? {}), [slot]: { ...(prev[day]?.[slot] ?? {}), [optIndex]: newQty } },
      }
    })
  }

  // Compute grand total
  let grandTotal = 0
  if (event?.mealOptions) {
    event.mealOptions.forEach((group) => {
      group.options.forEach((opt, i) => {
        const qty = quantities[group.day]?.[group.slot]?.[i] ?? 0
        grandTotal += qty * opt.price
      })
    })
  }

  const days = event ? Array.from({ length: event.totalDays }, (_, i) => i + 1) : []
  const tabs = [...days.map((d) => `Day ${d}`), 'Total meal summary']

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#3b5bdb]" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-[15px]">Event not found</p>
        <button onClick={() => navigate('/tickets')} className="text-[#3b5bdb] text-[13px] underline">
          Back to tickets
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Public header */}
      <header className="bg-[#0d1b2a] px-8 py-4 flex items-center justify-between">
       <img src="/logo.png" alt="GSWMI" className="h-10 object-contain" />
        <a href="#" className="text-white/80 text-[13px] underline hover:text-white">Contact support</a>
      </header>

      {/* Announcement banner */}
      <div className="bg-blue-50 text-center py-2 text-[12px] text-blue-600">
        Registration is open — secure your spot today!
      </div>

      {/* Event hero */}
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="grid grid-cols-[1fr_1fr] min-h-[300px]">
            {/* Banner */}
            <div className="overflow-hidden">
              {event.bannerUrl ? (
                <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-orange-400" />
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{event.name}</h1>
              {event.description && (
                <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-4">{richTextToPlain(event.description)}</p>
              )}
              <div className="flex items-center gap-2 text-[13px] text-gray-600">
                <Calendar size={14} className="text-[#3b5bdb]" />
                {formatDate(event.startDate)}{event.endDate && ` – ${formatDate(event.endDate)}`}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                  <MapPin size={14} className="text-[#3b5bdb]" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal ticket section */}
        {event.mealRegistrationOpen && event.mealOptions && event.mealOptions.length > 0 && (
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
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {tabs.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setActiveDay(i)}
                      className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                        activeDay === i ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Day content */}
                {activeDay < days.length ? (
                  <DayMealContent
                    day={days[activeDay]}
                    mealOptions={event.mealOptions?.filter((g) => g.day === days[activeDay]) ?? []}
                    quantities={quantities}
                    onQty={setQty}
                  />
                ) : (
                  <TotalSummary
                    event={event}
                    quantities={quantities}
                    grandTotal={grandTotal}
                  />
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

function DayMealContent({ day, mealOptions, quantities, onQty }: {
  day: number
  mealOptions: EventData['mealOptions']
  quantities: QuantityState
  onQty: (day: number, slot: string, optIndex: number, delta: number) => void
}) {
  if (!mealOptions || mealOptions.length === 0) {
    return (
      <div className="p-8 text-center text-[13px] text-gray-400">
        No meal options for this day
      </div>
    )
  }

  return (
    <div className="p-5">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-[12px] text-gray-500 font-medium pb-3 w-28">Slot</th>
            <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Meal option × Price</th>
            <th className="text-right text-[12px] text-gray-500 font-medium pb-3">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {mealOptions.map((group) => (
            <tr key={group.slot} className="border-b border-gray-50 last:border-0">
              <td className="py-4 text-[13px] font-medium text-gray-700 align-top capitalize">{group.slot}</td>
              <td className="py-4">
                {group.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                    <input type="radio" name={`slot-${day}-${group.slot}`} className="accent-[#3b5bdb]" readOnly />
                    <span className="text-[13px] text-gray-600 truncate max-w-[200px]">{opt.name}</span>
                    <span className="text-[12px] text-gray-400">–</span>
                    <span className="text-[13px] text-gray-700">₦{opt.price.toLocaleString()}</span>
                  </div>
                ))}
              </td>
              <td className="py-4 align-top">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onQty(day, group.slot, 0, -1)}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-[14px] font-medium w-4 text-center">
                    {quantities[day]?.[group.slot]?.[0] ?? 0}
                  </span>
                  <button
                    onClick={() => onQty(day, group.slot, 0, 1)}
                    className="w-7 h-7 rounded-full border border-[#3b5bdb] text-[#3b5bdb] flex items-center justify-center hover:bg-blue-50"
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

function TotalSummary({ event, quantities, grandTotal }: {
  event: EventData
  quantities: QuantityState
  grandTotal: number
}) {
  const rows: { day: number; slot: string; option: string; qty: number; price: number; total: number }[] = []

  event.mealOptions?.forEach((group) => {
    group.options.forEach((opt, i) => {
      const qty = quantities[group.day]?.[group.slot]?.[i] ?? 0
      if (qty > 0) {
        rows.push({ day: group.day, slot: group.slot, option: opt.name, qty, price: opt.price, total: qty * opt.price })
      }
    })
  })

  return (
    <div className="p-5">
      {rows.length === 0 ? (
        <p className="text-[13px] text-gray-400 text-center py-4">No items selected yet</p>
      ) : (
        <>
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Day × Slot</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Meal option</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Qty</th>
                <th className="text-left text-[12px] text-gray-500 font-medium pb-3">Price</th>
                <th className="text-right text-[12px] text-gray-500 font-medium pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-[13px] text-gray-700 capitalize">Day {row.day} – {row.slot}</td>
                  <td className="py-2 text-[13px] text-gray-700 max-w-[180px] truncate">{row.option}</td>
                  <td className="py-2 text-[13px] text-gray-700">{row.qty}</td>
                  <td className="py-2 text-[13px] text-gray-700">₦{row.price.toLocaleString()}</td>
                  <td className="py-2 text-[13px] text-gray-700 text-right">₦{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-5">
            <span className="text-[15px] font-semibold text-gray-900">Total</span>
            <span className="text-[15px] font-bold text-gray-900">₦{grandTotal.toLocaleString()}</span>
          </div>

          <button className="w-full py-3 bg-[#3b5bdb] text-white rounded-lg text-[14px] font-semibold hover:bg-[#3451c7] transition-colors">
            Register & make payment
          </button>
        </>
      )}
    </div>
  )
}