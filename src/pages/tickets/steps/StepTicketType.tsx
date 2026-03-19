import { useTicketStore, type TicketType } from '../../../store/ticketStore'
import { ChevronDown } from 'lucide-react'

const TICKET_TYPES: TicketType[] = ['Meal']
// Accommodation and Transportation will be added when screens are ready

export default function StepTicketType() {
  const { form, updateTicketType } = useTicketStore()

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Ticket type</h2>

      {/* Dropdown */}
      <div className="relative mb-4">
        <select
          value={form.ticketType}
          onChange={(e) => updateTicketType(e.target.value as TicketType)}
          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] text-gray-800 bg-white outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all pr-8"
        >
          <option value="" disabled>Select ticket type</option>
          {TICKET_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* Chip */}
      {form.ticketType && (
        <div className="inline-flex">
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium">
            {form.ticketType} ticket
          </span>
        </div>
      )}
    </div>
  )
}