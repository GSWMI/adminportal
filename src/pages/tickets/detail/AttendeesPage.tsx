import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ExternalLink, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import { getAttendees, resendTicket, type AttendeeRow } from '../../../services/orderService'
import { getEventById, updateRegistration } from '../../../services/eventService'
import { exportAttendeesCsv } from '../../../services/exportService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { usePagination } from '../../../hooks/usePagination'
import PaginationBar from '../../../components/ui/PaginationBar'

const TICKET_TYPE_COLORS: Record<string, string> = {
  meal: 'bg-blue-50 text-blue-600 border-blue-200',
  accommodation: 'bg-orange-50 text-orange-600 border-orange-200',
  transport: 'bg-green-50 text-green-600 border-green-200',
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function AttendeesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [ticketFilter, setTicketFilter] = useState<string>('all')
  const [list, setList] = useState<AttendeeRow[]>([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [closingReg, setClosingReg] = useState(false)
  const [regOpen, setRegOpen] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [result, event] = await Promise.all([getAttendees(id!), getEventById(id!)])
        setList(result.list)
        setEventName(event.name)
        setRegOpen(event.registrationOpen ?? true)
      } catch { toast.error('Failed to load attendees') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const filtered = list.filter((r) => {
    const matchSearch = !search ||
      `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      r.guest.email.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (ticketFilter === 'all') return true
    return r.ticketTypes.map((t) => t.toLowerCase()).includes(ticketFilter)
  })

  const { page, setPage, totalPages, total, paged } = usePagination(filtered, 20)

  const handleResend = async (orderNumber: string, email: string) => {
    setResendingId(orderNumber)
    try { await resendTicket(orderNumber); toast.success(`Ticket resent to ${email}`) }
    catch { toast.error('Failed to resend ticket') }
    finally { setResendingId(null) }
  }

  const handleToggleRegistration = async () => {
    if (!id) return
    setClosingReg(true)
    try {
      await updateRegistration(id, 'all', !regOpen)
      setRegOpen((v) => !v)
      toast.success(regOpen ? 'Registration closed' : 'Registration opened')
    } catch { toast.error('Failed to update registration') }
    finally { setClosingReg(false) }
  }

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Attendees</h1>
          {eventName && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{eventName}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async () => {
            setExporting(true)
            try { await exportAttendeesCsv(id); toast.success('Attendees exported!') }
            catch { toast.error('Failed to export attendees') }
            finally { setExporting(false) }
          }} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button onClick={handleToggleRegistration} disabled={closingReg}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-60 ${
              regOpen ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
            }`}>
            {closingReg ? <Loader2 size={14} className="animate-spin" /> : regOpen ? <XCircle size={14} /> : <CheckCircle size={14} />}
            {closingReg ? 'Updating...' : regOpen ? 'Close registration' : 'Open registration'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-wrap">
          <div className="flex-1" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, email or order number..."
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all" />
          </div>
          <select value={ticketFilter} onChange={(e) => { setTicketFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors outline-none focus:border-[#3b5bdb] bg-white">
            <option value="all">All ticket types</option>
            <option value="meal">Meal only</option>
            <option value="accommodation">Accommodation only</option>
            <option value="transport">Transport only</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Email', 'Phone', 'Gender', 'Next of kin', 'Tickets', 'Total (₦)', 'Action'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-5 py-3.5"><Skeleton height={14} /></td>
                ))}</tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-[13px] text-gray-400">
                  {search ? 'No attendees match your search' : 'No attendees for this event yet'}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">{row.guest.firstName} {row.guest.lastName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.guest.email}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{row.guest.phone}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600 capitalize">{row.guest.gender ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {row.guest.nextOfKin ? (
                      <div>
                        <p className="text-[13px] text-gray-700">{row.guest.nextOfKin.fullName}</p>
                        <p className="text-[11px] text-gray-400">{row.guest.nextOfKin.email}</p>
                      </div>
                    ) : <span className="text-[13px] text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {row.ticketTypes.map((t) => (
                        <span key={t} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${TICKET_TYPE_COLORS[t.toLowerCase()] ?? ''}`}>
                          {capitalize(t)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">₦{row.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleResend(row.orderNumber, row.guest.email)}
                      disabled={resendingId === row.orderNumber}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#3b5bdb] text-[#3b5bdb] rounded-lg text-[12px] font-medium hover:bg-blue-50 transition-colors disabled:opacity-60">
                      {resendingId === row.orderNumber && <Loader2 size={12} className="animate-spin" />}
                      {resendingId === row.orderNumber ? 'Sending...' : 'Resend ticket(s)'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <PaginationBar page={page} totalPages={totalPages} total={total} label="attendees" onPage={setPage} />
      </div>
    </div>
  )
}