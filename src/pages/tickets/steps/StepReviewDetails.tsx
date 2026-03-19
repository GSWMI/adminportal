import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Calendar, MapPin } from 'lucide-react'
import { useTicketStore } from '../../../store/ticketStore'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface SectionProps {
  title: string
  onEdit: () => void
  children: React.ReactNode
}

function Section({ title, onEdit, children }: SectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#3b5bdb] hover:opacity-80 transition-opacity"
        >
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {title}
        </button>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <Pencil size={14} />
        </button>
      </div>

      {open && (
        <div className="pb-4 pl-5">
          {children}
        </div>
      )}
    </div>
  )
}

export default function StepReviewDetails() {
  const { form, setStep } = useTicketStore()

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Review details</h2>

      <div className="divide-y divide-gray-100">
        {/* Event info */}
        <Section title="Event info" onEdit={() => setStep(0)}>
          <div className="flex flex-col gap-3">
            {form.bannerPreview && (
              <img
                src={form.bannerPreview}
                alt="Banner"
                className="w-[80px] h-[80px] rounded-lg object-cover"
              />
            )}
            {form.programName && (
              <p className="text-[14px] font-semibold text-gray-900">{form.programName}</p>
            )}
            {form.description && (
              <div
                className="text-[13px] text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            )}
            {form.startDate && (
              <div className="flex items-center gap-2 text-[13px] text-gray-600">
                <Calendar size={13} className="text-gray-400" />
                {formatDate(form.startDate)}
                {form.endDate && ` — ${formatDate(form.endDate)}`}
              </div>
            )}
            {form.location && (
              <div className="flex items-center gap-2 text-[13px] text-[#3b5bdb]">
                <MapPin size={13} />
                {form.location}
              </div>
            )}
          </div>
        </Section>

        {/* Ticket type */}
        <Section title="Ticket type" onEdit={() => setStep(1)}>
          {form.ticketType && (
            <span className="inline-flex px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[12px] font-medium">
              {form.ticketType} ticket
            </span>
          )}
        </Section>

        {/* Options */}
        <Section title="Options, prices & quantity limit" onEdit={() => setStep(2)}>
          <div className="flex flex-col gap-3">
            {form.days.map((day) => {
              const activeSlotsWithOptions = day.slots.filter((s) => s.options.length > 0)
              if (activeSlotsWithOptions.length === 0) return null
              return (
                <div key={day.id}>
                  <p className="text-[12px] font-semibold text-[#3b5bdb] mb-2">{day.label}</p>
                  {activeSlotsWithOptions.map((slot) => (
                    <div key={slot.id} className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <ChevronDown size={13} className="text-gray-400" />
                        <p className="text-[13px] font-medium text-gray-700">{slot.name}</p>
                      </div>
                      <table className="w-full">
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
                              <td className="py-1.5 text-[12px] text-gray-700 max-w-[160px] truncate pr-2">{opt.name}</td>
                              <td className="py-1.5 text-[12px] text-gray-700">₦ {opt.price.toLocaleString()}</td>
                              <td className="py-1.5 text-[12px] text-gray-700">{opt.limit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Section>

        {/* Registration form */}
        <Section title="Registration form" onEdit={() => setStep(3)}>
          <div className="flex flex-col gap-2">
            {['First name *', 'Last name *', 'Email address *', 'Phone number *'].map((f) => (
              <div key={f} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-400 bg-gray-50">{f}</div>
            ))}
            {form.customFields.map((cf) => (
              <div key={cf.id} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-600 bg-gray-50">
                {cf.question || `(${cf.type} field)`}
                {cf.required && ' *'}
              </div>
            ))}
            {form.consentText && (
              <div className="mt-1">
                <p className="text-[11px] text-gray-400 mb-1">Consent & Terms</p>
                <div
                  className="flex items-start gap-2 text-[12px] text-gray-600"
                >
                  <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 accent-[#3b5bdb]" disabled />
                  <div dangerouslySetInnerHTML={{ __html: form.consentText }} />
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}