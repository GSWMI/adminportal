import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Calendar, MapPin, ChevronDown, ChevronUp, X } from 'lucide-react'
import { mockTickets, type TicketEvent } from '../../../data/mockTickets'
import { toast } from 'sonner'

const SECTIONS = ['Event info', 'Ticket type', 'Options, prices & quantity limit', 'Registration form']

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Event Info Section ──
function EventInfoSection({ ticket, editing, onEdit, onSave }: {
  ticket: TicketEvent; editing: boolean; onEdit: () => void; onSave: (data: Partial<TicketEvent>) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(ticket.programName)
  const [desc, setDesc] = useState(ticket.description)
  const [banner, setBanner] = useState(ticket.bannerPreview)
  const dirty = name !== ticket.programName || desc !== ticket.description || banner !== ticket.bannerPreview

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setBanner(URL.createObjectURL(file))
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Event info</h2>
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
        </div>
        {banner && <img src={banner} alt="" className="w-[80px] h-[80px] rounded-lg object-cover mb-3" />}
        <p className="text-[15px] font-semibold text-gray-900 mb-2">{ticket.programName}</p>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-4">{ticket.description}</p>
        <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-2">
          <Calendar size={13} className="text-gray-400" />
          {formatDate(ticket.startDate)} — {formatDate(ticket.endDate)}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-[#3b5bdb]">
          <MapPin size={13} />
          {ticket.location}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Event info</h2>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div onClick={() => fileRef.current?.click()} className="w-[80px] h-[80px] rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex-shrink-0">
          {banner ? <img src={banner} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
        </div>
        <button onClick={() => fileRef.current?.click()} className="text-[13px] text-gray-600 underline">Change banner</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBanner} />
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 mb-3 transition-all" />
      <div className="mb-4">
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 resize-none transition-all leading-relaxed" />
      </div>
      <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-2">
        <Calendar size={13} className="text-gray-400" />
        {formatDate(ticket.startDate)} — {formatDate(ticket.endDate)}
      </div>
      <div className="flex items-center gap-1.5 text-[13px] text-[#3b5bdb] mb-2">
        <MapPin size={13} />
        {ticket.location}
      </div>
      <SaveBtn dirty={dirty} onSave={() => { onSave({ programName: name, description: desc, bannerPreview: banner }); toast.success('Changes saved') }} />
    </div>
  )
}

// ── Ticket Type Section ──
function TicketTypeSection({ ticket, editing, onEdit, onSave }: {
  ticket: TicketEvent; editing: boolean; onEdit: () => void; onSave: (data: Partial<TicketEvent>) => void
}) {
  const [type, setType] = useState(ticket.ticketType)
  const dirty = type !== ticket.ticketType

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Ticket type</h2>
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
        </div>
        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium">{ticket.ticketType} ticket</span>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-4">Ticket type</h2>
      <div className="relative mb-3">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] bg-white outline-none focus:border-[#3b5bdb] pr-8">
          <option value="Meal">Meal</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium">{type} ticket</span>
      <div className="mt-4">
        <SaveBtn dirty={dirty} onSave={() => { onSave({ ticketType: type }); toast.success('Changes saved') }} />
      </div>
    </div>
  )
}

// ── Options Section (view + edit) ──
function OptionsSection({ ticket, editing, onEdit, onSave }: {
  ticket: TicketEvent; editing: boolean; onEdit: () => void; onSave: (data: Partial<TicketEvent>) => void
}) {
  const [days, setDays] = useState(ticket.days)
  const [openDays, setOpenDays] = useState<string[]>([])
  const [openSlots, setOpenSlots] = useState<string[]>([])

  const toggleDay = (id: string) => setOpenDays((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
  const toggleSlot = (id: string) => setOpenSlots((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const removeOption = (dayId: string, slotId: string, optId: string) => {
    setDays((prev) => prev.map((d) => d.id === dayId ? {
      ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, options: s.options.filter((o) => o.id !== optId) } : s)
    } : d))
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Options, prices & quantity limit</h2>
        {!editing && <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>}
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const activeSlotsWithOptions = day.slots.filter((s) => s.options.length > 0)
          const dayOpen = openDays.includes(day.id)

          return (
            <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggleDay(day.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-[14px] font-semibold text-[#3b5bdb]">{day.label}</span>
                {dayOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
              </button>

              {dayOpen && activeSlotsWithOptions.length > 0 && (
                <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100 pt-3">
                  {activeSlotsWithOptions.map((slot) => {
                    const slotOpen = openSlots.includes(slot.id)
                    return (
                      <div key={slot.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        <button onClick={() => toggleSlot(slot.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                          {slotOpen ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                          <span className="text-[13px] font-medium text-gray-700">{slot.name}</span>
                        </button>
                        {slotOpen && (
                          <div className="px-3 py-2">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left text-[11px] text-gray-400 font-medium pb-2">Meal option</th>
                                  <th className="text-left text-[11px] text-gray-400 font-medium pb-2">Price (₦)</th>
                                  <th className="text-left text-[11px] text-gray-400 font-medium pb-2">Limit</th>
                                  {editing && <th className="w-5" />}
                                </tr>
                              </thead>
                              <tbody>
                                {slot.options.map((opt) => (
                                  <tr key={opt.id} className="border-t border-gray-50">
                                    <td className="py-2 text-[12px] text-gray-700 truncate max-w-[160px] pr-2">{opt.name}</td>
                                    <td className="py-2 text-[12px] text-gray-700">₦ {opt.price.toLocaleString()}</td>
                                    <td className="py-2 text-[12px] text-gray-700">{opt.limit}</td>
                                    {editing && (
                                      <td className="py-2">
                                        <button onClick={() => removeOption(day.id, slot.id, opt.id)} className="text-red-400 hover:text-red-500">
                                          <X size={13} />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                                {editing && (
                                  <tr className="border-t border-gray-50">
                                    <td colSpan={4} className="pt-2">
                                      <div className="flex items-center gap-2">
                                        <input placeholder="Enter meal option" className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-[12px] outline-none focus:border-[#3b5bdb]" />
                                        <div className="relative w-20">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">₦</span>
                                          <input type="number" placeholder="0" className="w-full pl-5 pr-1 py-1.5 border border-gray-200 rounded text-[12px] outline-none focus:border-[#3b5bdb]" />
                                        </div>
                                        <input type="number" placeholder="0" className="w-12 border border-gray-200 rounded px-2 py-1.5 text-[12px] outline-none focus:border-[#3b5bdb]" />
                                        <button className="px-2 py-1.5 text-[12px] bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors">Add</button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="mt-4">
          <SaveBtn dirty={true} onSave={() => { onSave({ days }); toast.success('Changes saved') }} />
        </div>
      )}
    </div>
  )
}

// ── Registration Form Section ──
function RegFormSection({ ticket, editing, onEdit }: {
  ticket: TicketEvent; editing: boolean; onEdit: () => void
}) {
  const defaultFields = [
    { label: 'First name', required: true },
    { label: 'Last name', required: true },
    { label: 'Email address', required: true },
    { label: 'Phone number', required: true },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Registration form</h2>
        {!editing && <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>}
      </div>
      <div className="flex flex-col gap-2">
        {defaultFields.map((f) => (
          <div key={f.label} className="border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <span className="text-[13px] text-gray-600">{f.label} {f.required && <span className="text-red-500">*</span>}</span>
          </div>
        ))}
        {ticket.customFields.map((cf) => (
          <div key={cf.id} className="border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <span className="text-[13px] text-gray-600">{cf.question} {cf.required && <span className="text-red-500">*</span>}</span>
          </div>
        ))}
        {ticket.consentText && (
          <div className="flex items-start gap-2 mt-1">
            <input type="checkbox" disabled className="mt-0.5 w-3.5 h-3.5" />
            <span className="text-[12px] text-gray-500">{ticket.consentText}</span>
          </div>
        )}
      </div>
      {editing && (
        <div className="mt-4">
          <SaveBtn dirty={false} onSave={() => toast.success('Changes saved')} />
        </div>
      )}
    </div>
  )
}

function SaveBtn({ dirty, onSave }: { dirty: boolean; onSave: () => void }) {
  return (
    <button onClick={onSave} disabled={!dirty}
      className={`px-5 py-2 rounded-lg text-[14px] font-medium transition-all ${dirty ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
      Save changes
    </button>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(0)
  const [editingSection, setEditingSection] = useState<number | null>(null)
  const [ticket, setTicket] = useState<TicketEvent | null>(
    mockTickets.find((t) => t.id === id) ?? null
  )

  if (!ticket) return (
    <div className="text-center py-20 text-gray-400">Ticket not found</div>
  )

  const handleSave = (data: Partial<TicketEvent>) => {
    setTicket((prev) => prev ? { ...prev, ...data } : prev)
    setEditingSection(null)
  }

  return (
    <div className="max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">{ticket.programName}</h1>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <div className="w-[220px] flex-shrink-0">
          {SECTIONS.map((sec, i) => (
            <button key={sec} onClick={() => { setActiveSection(i); setEditingSection(null) }}
              className="w-full flex items-center justify-between py-2.5 text-left transition-colors group">
              <span className={`text-[13px] font-medium ${activeSection === i ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                {sec}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={activeSection === i ? 'text-gray-900' : 'text-gray-300'}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 px-7 py-6 mb-4">
            {activeSection === 0 && (
              <EventInfoSection ticket={ticket} editing={editingSection === 0}
                onEdit={() => setEditingSection(0)} onSave={handleSave} />
            )}
            {activeSection === 1 && (
              <TicketTypeSection ticket={ticket} editing={editingSection === 1}
                onEdit={() => setEditingSection(1)} onSave={handleSave} />
            )}
            {activeSection === 2 && (
              <OptionsSection ticket={ticket} editing={editingSection === 2}
                onEdit={() => setEditingSection(2)} onSave={handleSave} />
            )}
            {activeSection === 3 && (
              <RegFormSection ticket={ticket} editing={editingSection === 3}
                onEdit={() => setEditingSection(3)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}