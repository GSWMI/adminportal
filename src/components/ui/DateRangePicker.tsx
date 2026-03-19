import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  startDate: string
  endDate: string
  onApply: (start: string, end: string) => void
  onCancel: () => void
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function fmt(s: string) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DateRangePicker({ startDate, endDate, onApply, onCancel }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : today)
  const [picking, setPicking] = useState<'start' | 'end'>('start')
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const isToday = (d: number) => toISO(year, month, d) === toISO(today.getFullYear(), today.getMonth(), today.getDate())
  const isStart = (d: number) => toISO(year, month, d) === tempStart
  const isEnd = (d: number) => toISO(year, month, d) === tempEnd
  const isInRange = (d: number) => {
    const iso = toISO(year, month, d)
    return !!(tempStart && tempEnd && iso > tempStart && iso < tempEnd)
  }

  const handleDay = (d: number) => {
    const iso = toISO(year, month, d)
    if (picking === 'start') {
      setTempStart(iso)
      setTempEnd('')
      setPicking('end')
    } else {
      if (iso < tempStart) {
        setTempEnd(tempStart)
        setTempStart(iso)
      } else {
        setTempEnd(iso)
      }
      setPicking('start')
    }
  }

  const canApply = !!tempStart

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-[310px]">

      {/* Picking indicator */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setPicking('start')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[12px] font-medium border transition-all ${
            picking === 'start' ? 'border-[#3b5bdb] bg-blue-50 text-[#3b5bdb]' : 'border-gray-200 text-gray-500'
          }`}
        >
          {tempStart ? fmt(tempStart) : 'Start date'}
        </button>
        <span className="text-gray-300 text-[12px]">—</span>
        <button
          onClick={() => tempStart && setPicking('end')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[12px] font-medium border transition-all ${
            picking === 'end' ? 'border-[#3b5bdb] bg-blue-50 text-[#3b5bdb]' : 'border-gray-200 text-gray-500'
          }`}
        >
          {tempEnd ? fmt(tempEnd) : 'End date'}
        </button>
      </div>

      {/* Instruction label */}
      <p className="text-[11px] text-gray-400 mb-3 text-center">
        {picking === 'start' ? 'Select a start date' : 'Now select an end date'}
      </p>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronLeft size={15} />
        </button>
        <span className="text-[13px] font-semibold text-gray-900">{MONTHS[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Today button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => {
            const iso = toISO(today.getFullYear(), today.getMonth(), today.getDate())
            if (picking === 'start') { setTempStart(iso); setTempEnd(''); setPicking('end') }
            else { setTempEnd(iso); setPicking('start') }
            setViewDate(today)
          }}
          className="text-[11px] text-[#3b5bdb] hover:underline"
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const start = isStart(day)
          const end = isEnd(day)
          const inRange = isInRange(day)
          const todayMark = isToday(day)
          return (
            <button
              key={i}
              onClick={() => handleDay(day)}
              className={`
                h-8 w-8 mx-auto flex items-center justify-center text-[12px] transition-colors relative
                ${start || end ? 'rounded-full bg-[#3b5bdb] text-white font-semibold' : ''}
                ${inRange ? 'bg-blue-50 text-blue-700 rounded-none' : ''}
                ${!start && !end && !inRange ? 'rounded-full hover:bg-gray-100 text-gray-700' : ''}
              `}
            >
              {day}
              {todayMark && !start && !end && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3b5bdb]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel}
          className="flex-1 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={() => canApply && onApply(tempStart, tempEnd)} disabled={!canApply}
          className="flex-1 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-40">
          Apply
        </button>
      </div>
    </div>
  )
}