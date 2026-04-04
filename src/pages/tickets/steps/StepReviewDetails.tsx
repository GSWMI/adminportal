import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Calendar, MapPin, Users, Hash } from 'lucide-react'
import { useTicketStore } from '../../../store/ticketStore'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CHIP_COLORS: Record<string, string> = {
  Meal: 'bg-blue-50 text-blue-700 border-blue-200',
  Accommodation: 'bg-pink-50 text-pink-700 border-pink-200',
  Transportation: 'bg-orange-50 text-orange-700 border-orange-200',
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between py-3.5">
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#3b5bdb] hover:opacity-80 transition-opacity">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {title}
        </button>
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <Pencil size={14} />
        </button>
      </div>
      {open && <div className="pb-4 pl-5">{children}</div>}
    </div>
  )
}

function SubSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <span className="text-[13px] font-semibold text-[#3b5bdb]">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-3 border-t border-gray-100 pt-3">{children}</div>}
    </div>
  )
}

export default function StepReviewDetails() {
  const { form, setStep } = useTicketStore()
  const hasMeal = form.ticketTypes.includes('Meal')
  const hasAccommodation = form.ticketTypes.includes('Accommodation')
  const hasTransport = form.ticketTypes.includes('Transportation')

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Review details</h2>
      <div className="flex flex-col">

        {/* Event info */}
        <Section title="Event info" onEdit={() => setStep(0)}>
          <p className="text-[14px] font-semibold text-gray-900 mb-1">{form.programName}</p>
          {form.description && (
            <div className="text-[13px] text-gray-500 mb-2 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: form.description }} />
          )}
          {form.startDate && (
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-1">
              <Calendar size={12} className="text-gray-400" />
              {formatDate(form.startDate)}{form.endDate && ` — ${formatDate(form.endDate)}`}
              {form.totalDays > 0 && ` (${form.totalDays} days)`}
            </div>
          )}
          {form.location && (
            <div className="flex items-center gap-1.5 text-[12px] text-[#3b5bdb]">
              <MapPin size={12} />
              {form.location}
            </div>
          )}
        </Section>

        {/* Ticket type */}
        <Section title="Ticket type" onEdit={() => setStep(1)}>
          <div className="flex items-center gap-2 flex-wrap">
            {form.ticketTypes.map((type) => (
              <span key={type} className={`px-3 py-1 rounded-full text-[12px] font-medium border ${CHIP_COLORS[type]}`}>
                {type} ticket
              </span>
            ))}
            {form.ticketTypes.length === 0 && (
              <p className="text-[13px] text-gray-400">No ticket types selected</p>
            )}
          </div>
        </Section>

        {/* Options, prices & quantity limit */}
        <Section title="Options, prices & quantity limit" onEdit={() => setStep(2)}>

          {/* Meal ticket */}
          {hasMeal && (
            <SubSection title="Meal ticket">
              {form.days.map((day) => {
                const activeSlots = day.slots.filter((s) => s.options.length > 0)
                if (activeSlots.length === 0) return null
                return (
                  <SubSection key={day.id} title={day.label} defaultOpen>
                    {activeSlots.map((slot) => (
                      <div key={slot.id} className="mb-3 last:mb-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          </div>
                          <span className="text-[12px] font-medium text-gray-600">{slot.name}</span>
                        </div>
                        <table className="w-full ml-5">
                          <thead>
                            <tr>
                              <th className="text-left text-[11px] text-gray-400 font-medium pb-1">Meal option</th>
                              <th className="text-left text-[11px] text-gray-400 font-medium pb-1">Price (₦)</th>
                              <th className="text-left text-[11px] text-gray-400 font-medium pb-1">Limit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {slot.options.map((opt) => (
                              <tr key={opt.id} className="border-t border-gray-50">
                                <td className="py-1 text-[12px] text-gray-700 max-w-[180px] truncate pr-2">{opt.name}</td>
                                <td className="py-1 text-[12px] text-gray-700">₦{opt.price.toLocaleString()}</td>
                                <td className="py-1 text-[12px] text-gray-700">{opt.limit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </SubSection>
                )
              })}
            </SubSection>
          )}

          {/* Accommodation ticket */}
          {hasAccommodation && (
            <SubSection title="Accommodation ticket">
              {form.accommodations.length === 0 ? (
                <p className="text-[12px] text-gray-400">No accommodation options added</p>
              ) : (
                form.accommodations.map((acc) => (
                  <SubSection key={acc.id} title={acc.name} defaultOpen>
                    {acc.description && <p className="text-[12px] text-gray-500 mb-2 leading-relaxed">{acc.description}</p>}
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-1">
                      <Users size={12} /> Capacity: {acc.capacity}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                      <Hash size={12} /> Price: ₦{acc.price.toLocaleString()}
                    </div>
                  </SubSection>
                ))
              )}
            </SubSection>
          )}

          {/* Transportation ticket */}
          {hasTransport && (
            <SubSection title="Transportation ticket">
              {!form.transport.name && form.transport.pickups.length === 0 ? (
                <p className="text-[12px] text-gray-400">No transport options added</p>
              ) : (
                <div className="bg-[#f0f4ff]/40 rounded-lg p-3">
                  {form.transport.name && (
                    <p className="text-[13px] font-semibold text-gray-800 mb-1">{form.transport.name}</p>
                  )}
                  {form.transport.description && (
                    <p className="text-[12px] text-gray-500 mb-3">{form.transport.description}</p>
                  )}
                  {form.transport.pickups.length > 0 && (
                    <>
                      <p className="text-[11px] font-semibold text-[#3b5bdb] uppercase tracking-wide mb-2">Pickup option</p>
                      {form.transport.pickups.map((pickup) => (
                        <div key={pickup.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                          <span className="text-[12px] text-gray-700">{pickup.pickupLocation}</span>
                          <span className="text-[12px] font-medium text-gray-700">₦{pickup.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </SubSection>
          )}
        </Section>

        {/* Registration form */}
        <Section title="Registration form" onEdit={() => setStep(3)}>
          <div className="flex flex-col gap-1.5">
            {['First name', 'Last name', 'Email address', 'Phone number'].map((f) => (
              <div key={f} className="border border-gray-100 rounded-lg px-3 py-2 text-[12px] text-gray-400 bg-gray-50">{f} *</div>
            ))}
            {form.customFields.map((f) => (
              <div key={f.id} className="border border-gray-100 rounded-lg px-3 py-2 text-[12px] text-gray-500 bg-gray-50">
                {f.question} {f.required && '*'}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}