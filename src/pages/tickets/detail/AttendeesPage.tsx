import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, ExternalLink, XCircle } from 'lucide-react'
import { mockTickets, mockAttendees } from '../../../data/mockTickets'
import { toast } from 'sonner'

const TICKET_TYPE_COLORS: Record<string, string> = {
  Meal: 'bg-blue-50 text-blue-600 border-blue-200',
  Accommodation: 'bg-orange-50 text-orange-600 border-orange-200',
  Transport: 'bg-green-50 text-green-600 border-green-200',
}

export default function AttendeesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(1)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const TOTAL_PAGES = 10

  const ticket = mockTickets.find((t) => t.id === id)
  const filtered = mockAttendees.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-275">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/tickets/${id}`)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Meal tickets</h1>
          {ticket && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{ticket.programName}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
            <ExternalLink size={14} />
            Export
          </button>
          <button onClick={() => toast.success('Registration closed')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-[13px] font-medium hover:bg-red-600 transition-colors">
            <XCircle size={14} />
            Close registration
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <DayTabs active={activeDay} onChange={setActiveDay} total={ticket?.days.length ?? 3} />
          <div className="flex-1" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Email', 'Phone', 'Ticket purchased', 'Action'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {h}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
                      <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((att) => (
              <tr key={att.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">{att.name}</td>
                <td className="px-5 py-3.5 text-[13px] text-gray-600">{att.email}</td>
                <td className="px-5 py-3.5 text-[13px] text-gray-600">{att.phone}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {att.ticketsPurchased.map((t) => (
                      <span key={t} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${TICKET_TYPE_COLORS[t]}`}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toast.success(`Ticket resent to ${att.email}`)}
                    className="px-3 py-1.5 border border-[#3b5bdb] text-[#3b5bdb] rounded-lg text-[12px] font-medium hover:bg-blue-50 transition-colors">
                    Resend ticket(s)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">Page {page} of {TOTAL_PAGES}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Previous</button>
            <button disabled={page === TOTAL_PAGES} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DayTabs({ active, onChange, total }: { active: number; onChange: (n: number) => void; total: number }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
        <button key={day} onClick={() => onChange(day)}
          className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors ${active === day ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Day {day}
        </button>
      ))}
    </div>
  )
}