import { useTicketStore } from '../../../store/ticketStore'
import type { TicketType } from '../../../store/ticketStore'
import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'

const ALL_TYPES: TicketType[] = ['Meal', 'Accommodation', 'Transportation']

const CHIP_COLORS: Record<TicketType, string> = {
  Meal: 'bg-blue-50 text-blue-700 border-blue-200',
  Accommodation: 'bg-pink-50 text-pink-700 border-pink-200',
  Transportation: 'bg-orange-50 text-orange-700 border-orange-200',
}

export default function StepTicketType() {
  const { form, toggleTicketType } = useTicketStore()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Ticket type</h2>

      {/* Dropdown */}
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] text-gray-800 bg-white outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
        >
          <span className={form.ticketTypes.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
            {form.ticketTypes.length === 0
              ? 'Select ticket type(s)'
              : form.ticketTypes.join(', ')}
          </span>
          <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20">
            {ALL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { toggleTicketType(type); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  form.ticketTypes.includes(type) ? 'text-[#3b5bdb] font-medium' : 'text-gray-700'
                }`}
              >
                {type}
                {form.ticketTypes.includes(type) && (
                  <span className="w-4 h-4 rounded-full bg-[#3b5bdb] flex items-center justify-center">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips */}
      {form.ticketTypes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {form.ticketTypes.map((type) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border ${CHIP_COLORS[type]}`}
            >
              {type} ticket
              <button
                type="button"
                onClick={() => toggleTicketType(type)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}