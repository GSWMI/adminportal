import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ChevronDown, ChevronUp, Minus, Plus, Users, Hash } from 'lucide-react'
import { useTicketStore } from '../../store/ticketStore'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Meal Preview ─────────────────────────────────────────────────────────────

type MealQty = Record<string, Record<string, Record<string, number>>>
type MealSelected = Record<string, Record<string, string>>

function MealPreviewSection() {
  const { form } = useTicketStore()
  const days = form.days
  const tabs = [...days.map((d) => d.label), 'Total meal summary']
  const [activeDay, setActiveDay] = useState(0)
  const [quantities, setQuantities] = useState<MealQty>({})
  const [selected, setSelected] = useState<MealSelected>({})
  const [sectionOpen, setSectionOpen] = useState(true)

  const updateQty = (dayId: string, slotId: string, optId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[dayId]?.[slotId]?.[optId] ?? 0
      const newQty = Math.max(0, Math.min(5, current + delta))
      return { ...prev, [dayId]: { ...(prev[dayId] ?? {}), [slotId]: { ...(prev[dayId]?.[slotId] ?? {}), [optId]: newQty } } }
    })
  }

  const selectOption = (dayId: string, slotId: string, optId: string) => {
    setSelected((prev) => ({ ...prev, [dayId]: { ...(prev[dayId] ?? {}), [slotId]: optId } }))
  }

  // Build summary rows
  const summaryRows: { dayLabel: string; slotName: string; optionName: string; qty: number; price: number }[] = []
  days.forEach((day) => {
    day.slots.forEach((slot) => {
      const selOptId = selected[day.id]?.[slot.id]
      const qty = selOptId ? (quantities[day.id]?.[slot.id]?.[selOptId] ?? 0) : 0
      if (qty > 0) {
        const opt = slot.options.find((o) => o.id === selOptId)
        if (opt) summaryRows.push({ dayLabel: day.label, slotName: slot.name, optionName: opt.name, qty, price: opt.price })
      }
    })
  })
  const grandTotal = summaryRows.reduce((acc, r) => acc + r.qty * r.price, 0)
  const summaryByDay: Record<string, typeof summaryRows> = {}
  summaryRows.forEach((r) => {
    if (!summaryByDay[r.dayLabel]) summaryByDay[r.dayLabel] = []
    summaryByDay[r.dayLabel].push(r)
  })

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setSectionOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 text-left">
        <div className="w-5 h-5 rounded border-2 border-[#1a2e5a] bg-[#1a2e5a] flex items-center justify-center flex-shrink-0">
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-[#1a2e5a]">Meal ticket</span>
        {sectionOpen ? <ChevronUp size={18} className="text-gray-400 ml-auto" /> : <ChevronDown size={18} className="text-gray-400 ml-auto" />}
      </button>

      {sectionOpen && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-white px-6 overflow-x-auto">
            {tabs.map((tab, i) => (
              <button key={tab} type="button" onClick={() => setActiveDay(i)}
                className={`px-4 py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeDay === i ? 'border-[#1a2e5a] text-[#1a2e5a]' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white px-6 py-4">
            {activeDay < days.length ? (
              (() => {
                const day = days[activeDay]
                const activeSlots = day.slots.filter((s) => s.options.length > 0)
                if (activeSlots.length === 0) return <p className="text-[13px] text-gray-400 py-4">No meal options configured for this day.</p>
                return (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="text-[12px] font-medium text-gray-400 pb-3 w-28">Slot</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3">Meal option × Price</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3 text-right">Quantity (Max. 5 packs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSlots.map((slot) => (
                        <tr key={slot.id} className="border-t border-gray-50">
                          <td className="py-4 text-[14px] text-gray-700 font-medium align-top">{slot.name}</td>
                          <td className="py-4 align-top">
                            {slot.options.map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2 mb-2 last:mb-0 cursor-pointer">
                                <input type="radio" name={`${day.id}-${slot.id}`} value={opt.id}
                                  checked={selected[day.id]?.[slot.id] === opt.id}
                                  onChange={() => selectOption(day.id, slot.id, opt.id)}
                                  className="accent-[#1a2e5a]" />
                                <span className="text-[13px] text-gray-700 flex-1 truncate max-w-[240px]">{opt.name}</span>
                                <span className="text-[12px] text-gray-400">–</span>
                                <span className="text-[13px] font-medium text-gray-800">₦{opt.price.toLocaleString()}</span>
                              </label>
                            ))}
                          </td>
                          <td className="py-4 align-top">
                            <div className="flex items-center gap-2 justify-end">
                              <button type="button" onClick={() => {
                                const selOptId = selected[day.id]?.[slot.id] ?? slot.options[0]?.id
                                if (selOptId) updateQty(day.id, slot.id, selOptId, -1)
                              }} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-[14px] font-medium">
                                {(() => {
                                  const selOptId = selected[day.id]?.[slot.id]
                                  return selOptId ? (quantities[day.id]?.[slot.id]?.[selOptId] ?? 0) : 0
                                })()}
                              </span>
                              <button type="button" onClick={() => {
                                const selOptId = selected[day.id]?.[slot.id] ?? slot.options[0]?.id
                                if (selOptId) updateQty(day.id, slot.id, selOptId, 1)
                              }} className="w-7 h-7 rounded-full border border-[#1a2e5a] text-[#1a2e5a] flex items-center justify-center hover:bg-blue-50 transition-colors">
                                <Plus size={12} />
                              </button>
                              <span className="text-[12px] text-gray-400">packs</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()
            ) : (
              summaryRows.length === 0 ? (
                <p className="text-[13px] text-gray-400 py-4">No meals selected yet.</p>
              ) : (
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="text-[12px] font-medium text-gray-400 pb-3">Day × Slot</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3">Meal option</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3 text-center">Qty</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3 text-right">Price per meal</th>
                        <th className="text-[12px] font-medium text-gray-400 pb-3 text-right">Total amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summaryByDay).map(([dayLabel, rows]) => (
                        <React.Fragment key={dayLabel}>
                          <tr>
                            <td colSpan={5} className="pt-4 pb-1">
                              <span className="text-[11px] font-semibold text-[#1a2e5a] uppercase tracking-wide">{dayLabel}</span>
                            </td>
                          </tr>
                          {rows.map((r, i) => (
                            <tr key={i} className="border-t border-gray-50">
                              <td className="py-2 text-[13px] text-gray-600">{r.slotName}</td>
                              <td className="py-2 text-[13px] text-gray-700 max-w-[180px] truncate">{r.optionName}</td>
                              <td className="py-2 text-[13px] text-gray-700 text-center">{r.qty}</td>
                              <td className="py-2 text-[13px] text-gray-700 text-right">₦{r.price.toLocaleString()}</td>
                              <td className="py-2 text-[13px] font-medium text-gray-800 text-right">₦{(r.qty * r.price).toLocaleString()}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center border-t border-gray-200 mt-3 pt-3">
                    <span className="text-[14px] font-semibold text-gray-800">Total</span>
                    <span className="text-[16px] font-bold text-gray-900">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Accommodation Preview ─────────────────────────────────────────────────────

function AccommodationPreviewSection() {
  const { form } = useTicketStore()
  const options = form.accommodations
  const [sectionOpen, setSectionOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const selected = options.find((o) => o.id === selectedId)

  return (
    <div className="border border-gray-200 rounded-2xl">
      <button type="button" onClick={() => setSectionOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 text-left rounded-t-2xl">
        <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
        <span className="text-[15px] font-semibold text-[#1a2e5a]">Accommodation ticket</span>
        {sectionOpen ? <ChevronUp size={18} className="text-gray-400 ml-auto" /> : <ChevronDown size={18} className="text-gray-400 ml-auto" />}
      </button>

      {sectionOpen && (
        <div className="bg-white px-6 py-5">
          {options.length === 0 ? (
            <p className="text-[13px] text-gray-400">No accommodation options configured.</p>
          ) : (
            <div className="space-y-3">
              <label className="text-[13px] font-medium text-gray-600 block">Accommodation options</label>
              <div className="relative">
                <button type="button" onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-left bg-white hover:border-gray-300 transition-colors">
                  <span className={selectedId ? 'text-gray-800' : 'text-gray-400'}>
                    {selected ? selected.name : 'Choose an option'}
                  </span>
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {options.map((opt) => (
                      <button key={opt.id} type="button"
                        onClick={() => { setSelectedId(opt.id); setDropdownOpen(false) }}
                        className="w-full px-4 py-3 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                        {opt.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selected && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3 space-y-1.5">
                  {selected.description && <p className="text-[13px] text-gray-600">{selected.description}</p>}
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                    <Users size={14} className="flex-shrink-0" /> Per room: {selected.peoplePerRoom} · Total: {selected.totalCapacity}
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                    <Hash size={14} className="flex-shrink-0" /> Price: ₦{selected.price.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Transportation Preview ────────────────────────────────────────────────────

function TransportationPreviewSection() {
  const { form } = useTicketStore()
  const pickups = form.transport.pickups
  const [sectionOpen, setSectionOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const selected = pickups.find((p) => p.id === selectedId)

  return (
    <div className="border border-gray-200 rounded-2xl">
      <button type="button" onClick={() => setSectionOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 text-left rounded-t-2xl">
        <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
        <span className="text-[15px] font-semibold text-[#1a2e5a]">Transportation ticket</span>
        {sectionOpen ? <ChevronUp size={18} className="text-gray-400 ml-auto" /> : <ChevronDown size={18} className="text-gray-400 ml-auto" />}
      </button>

      {sectionOpen && (
        <div className="bg-white px-6 py-5">
          {pickups.length === 0 ? (
            <p className="text-[13px] text-gray-400">No pickup options configured.</p>
          ) : (
            <div className="space-y-3">
              {form.transport.name && (
                <p className="text-[14px] font-semibold text-gray-800">{form.transport.name}</p>
              )}
              {form.transport.description && (
                <p className="text-[13px] text-gray-500">{form.transport.description}</p>
              )}
              <label className="text-[13px] font-medium text-gray-600 block">Pickup location</label>
              <div className="relative">
                <button type="button" onClick={() => setDropdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-left bg-white hover:border-gray-300 transition-colors">
                  <span className={selectedId ? 'text-gray-800' : 'text-gray-400'}>
                    {selected ? selected.pickupLocation : 'Choose your preferred pickup location'}
                  </span>
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {pickups.map((p) => (
                      <button key={p.id} type="button"
                        onClick={() => { setSelectedId(p.id); setDropdownOpen(false) }}
                        className="w-full px-4 py-3 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                        {p.pickupLocation}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selected && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-gray-700">{selected.pickupLocation}</span>
                  <span className="text-[13px] font-semibold text-gray-800">₦{selected.price.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

import React from 'react'

export default function TicketPreviewPage() {
  const { form } = useTicketStore()
  const navigate = useNavigate()

  const hasMeal = form.ticketTypes.includes('Meal')
  const hasAccommodation = form.ticketTypes.includes('Accommodation')
  const hasTransportation = form.ticketTypes.includes('Transportation')

  return (
    <div className="min-h-screen bg-[#f8f8f4] flex flex-col">
      {/* Preview banner */}
      <div className="bg-[#fffde7] border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
        <span className="text-[14px] font-semibold text-gray-800">You are in preview mode</span>
        <button type="button" onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-[#f59e0b] text-white text-[13px] font-semibold hover:bg-amber-500 transition-colors">
          Exit preview mode
        </button>
      </div>

      {/* GSWMI Header */}
      <header className="bg-[#1a2e5a] px-8 py-4 flex items-center justify-between">
        <div>
          <img src="/logo.png" alt="GSWMI" className="h-10 object-contain" />
        </div>
        <button className="text-[13px] underline text-white hover:text-blue-200 transition-colors">Contact support</button>
      </header>

      {/* Announcement */}
      <div className="bg-blue-50 border-y border-blue-100 px-6 py-2 text-center">
        <span className="text-[13px] text-[#1a2e5a]">Announcement / event notice / general update banner in slow motion</span>
      </div>

      {/* Banner */}
      {form.bannerPreview ? (
        <div className="h-52 w-full overflow-hidden">
          <img src={form.bannerPreview} alt="Event banner" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-52 bg-gradient-to-r from-[#1a2e5a] to-[#2563eb] flex items-center justify-center">
          <span className="text-white/40 text-[14px]">Event banner</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a2e5a] mb-3">{form.programName || 'Event name'}</h1>
          {form.description && (
            <div className="text-[14px] text-gray-600 leading-relaxed mb-4 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: form.description }} />
          )}
          {form.startDate && (
            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-2">
              <Calendar size={15} className="text-[#1a2e5a]" />
              <span>{formatDate(form.startDate)}{form.endDate && ` – ${formatDate(form.endDate)}`}</span>
            </div>
          )}
          {form.location && (
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <MapPin size={15} className="text-[#1a2e5a]" />
              <span>{form.location}</span>
            </div>
          )}
        </div>

        <p className="text-[14px] text-gray-600">
          Select from any or all ticket options below.
        </p>

        {/* Ticket sections */}
        <div className="space-y-4">
          {hasMeal && <MealPreviewSection />}
          {hasAccommodation && <AccommodationPreviewSection />}
          {hasTransportation && <TransportationPreviewSection />}
          {!hasMeal && !hasAccommodation && !hasTransportation && (
            <p className="text-center text-[14px] text-gray-400 py-10">
              No ticket types have been configured for this event.
            </p>
          )}
        </div>

        {/* Proceed CTA */}
        <button type="button"
          className="px-6 py-3 rounded-xl bg-[#1a2e5a] text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-[#243d78] transition-colors">
          Proceed to checkout
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <footer className="text-center py-4 text-[12px] text-gray-400 border-t border-gray-100 bg-white">
        © GSWMI Logistics Team
      </footer>
    </div>
  )
}