import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useTicketStore, type MealOption } from '../../../store/ticketStore'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

interface SlotPanelProps {
  dayId: string
  slotId: string
  slotName: string
  options: MealOption[]
}

function SlotPanel({ dayId, slotId, slotName, options }: SlotPanelProps) {
  const { addMealOption, removeMealOption } = useTicketStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [limit, setLimit] = useState('')

  const isFilled = name.trim() && Number(price) >= 0 && Number(limit) > 0

  const handleAdd = () => {
    if (!isFilled) return
    addMealOption(dayId, slotId, {
      id: generateId(),
      name: name.trim(),
      price: Number(price),
      limit: Number(limit),
    })
    setName('')
    setPrice('')
    setLimit('')
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-blue-50/60 hover:bg-blue-50 transition-colors text-left"
      >
        {open ? (
          <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
        )}
        <span className="text-[13px] font-medium text-gray-700">{slotName}</span>
      </button>

      {open && (
        <div className="px-4 py-3 bg-white">
          {/* Existing options */}
          {options.length > 0 && (
            <table className="w-full mb-3">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Meal option</th>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Price (₦)</th>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Limit</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {options.map((opt) => (
                  <tr key={opt.id} className="border-t border-gray-50">
                    <td className="py-2 text-[13px] text-gray-700 max-w-[180px] truncate pr-2">{opt.name}</td>
                    <td className="py-2 text-[13px] text-gray-700">₦ {opt.price.toLocaleString()}</td>
                    <td className="py-2 text-[13px] text-gray-700">{opt.limit}</td>
                    <td className="py-2">
                      <button
                        onClick={() => removeMealOption(dayId, slotId, opt.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter meal option"
              className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#3b5bdb] transition-all min-w-0"
            />
            <div className="relative flex-shrink-0 w-24">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">₦</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#3b5bdb] transition-all"
              />
            </div>
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0"
              className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-[13px] text-gray-800 outline-none focus:border-[#3b5bdb] transition-all flex-shrink-0"
            />
            <button
              onClick={handleAdd}
              disabled={!isFilled}
              className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 ${
                isFilled
                  ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
          {options.length === 0 && (
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
              <span className="flex-1">Meal option</span>
              <span className="w-24">Price (₦)</span>
              <span className="w-14">Limit</span>
              <span className="w-12" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface DayPanelProps {
  dayId: string
  label: string
  slots: { id: string; name: string; options: MealOption[] }[]
}

function DayPanel({ dayId, label, slots }: DayPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-[14px] font-semibold text-[#3b5bdb]">{label}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100">
          <div className="mt-3" />
          {slots.map((slot) => (
            <SlotPanel
              key={slot.id}
              dayId={dayId}
              slotId={slot.id}
              slotName={slot.name}
              options={slot.options}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StepOptions() {
  const { form } = useTicketStore()

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Options, prices & quantity limit</h2>
      <div className="flex flex-col gap-3">
        {form.days.map((day) => (
          <DayPanel
            key={day.id}
            dayId={day.id}
            label={day.label}
            slots={day.slots}
          />
        ))}
      </div>
    </div>
  )
}