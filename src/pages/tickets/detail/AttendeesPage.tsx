import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ExternalLink, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import { getAttendees, type AttendeeRow } from '../../../services/orderService'
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

// Registration mode: 'self' | 'someone_else'.
// Backend returns `purchaser` only when someone pays on another's behalf; confirm by
// comparing guest vs purchaser email (per backend). Also honors an explicit registrationType.
function getRegistrationMode(r: AttendeeRow): 'self' | 'someone_else' {
  const t = (r.registrationType ?? '').toLowerCase()
  if (t) return t.includes('self') || t === 'myself' || t === 'me' ? 'self' : 'someone_else'
  const pEmail = r.purchaser?.email?.toLowerCase()
  const gEmail = r.guest?.email?.toLowerCase()
  return pEmail && gEmail && pEmail !== gEmail ? 'someone_else' : 'self'
}

function purchaserName(r: AttendeeRow): string {
  if (!r.purchaser) return ''
  return `${r.purchaser.firstName ?? ''} ${r.purchaser.lastName ?? ''}`.trim()
}

export default function AttendeesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [ticketFilter, setTicketFilter] = useState<string>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')
  const [list, setList] = useState<AttendeeRow[]>([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
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

  // Show the registration-mode column + filter only once the data carries it
  // (i.e. the backend returns a purchaser/registrationType on at least one row).
  const hasModeData = list.some((r) => !!r.registrationType || !!r.purchaser)

  const filtered = list.filter((r) => {
    const matchSearch = !search ||
      `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      r.guest.email.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    const matchTicket = ticketFilter === 'all' || r.ticketTypes.map((t) => t.toLowerCase()).includes(ticketFilter)
    if (!matchTicket) return false
    return modeFilter === 'all' || getRegistrationMode(r) === modeFilter
  })

  const { page, setPage, totalPages, total, paged } = usePagination(filtered, 20)
  const colCount = hasModeData ? 7 : 6

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
              placeholder="Search name, email or order #"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all" />
          </div>
          <select value={ticketFilter} onChange={(e) => { setTicketFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 outline-none focus:border-[#3b5bdb] bg-white">
            <option value="all">All categories</option>
            <option value="meal">Meal</option>
            <option value="accommodation">Accommodation</option>
            <option value="transport">Transport</option>
          </select>
          {hasModeData && (
            <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 outline-none focus:border-[#3b5bdb] bg-white">
              <option value="all">All registrations</option>
              <option value="self">Registered self</option>
              <option value="someone_else">On behalf</option>
            </select>
          )}
        </div>

        {/* Total count */}
        {total > 0 && (
          <div className="px-5 py-2 border-b border-gray-50 bg-gray-50/50">
            <span className="text-[12px] text-gray-400">{total} attendee{total !== 1 ? 's' : ''}</span>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Phone', 'Gender', 'Next of kin', ...(hasModeData ? ['Registered by'] : []), 'Tickets', 'Total (₦)'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: colCount }).map((_, j) => (
                  <td key={j} className="px-5 py-3.5"><Skeleton height={14} /></td>
                ))}</tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-5 py-12 text-center text-[13px] text-gray-400">
                  {search ? 'No attendees match your search' : 'No attendees for this event yet'}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => navigate(`/tickets/${id}/attendees/${row.orderNumber}`)}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-gray-900">{row.guest.firstName} {row.guest.lastName}</p>
                    <p className="text-[11px] text-gray-400">{row.guest.email}</p>
                  </td>
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
                  {hasModeData && (
                    <td className="px-5 py-3.5">
                      {(() => {
                        const mode = getRegistrationMode(row)
                        if (mode === 'someone_else') {
                          const by = purchaserName(row)
                          return (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-600 border border-purple-200">On behalf</span>
                              {by && <p className="text-[11px] text-gray-400 mt-1">by {by}</p>}
                            </div>
                          )
                        }
                        if (mode === 'self') {
                          return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">Self</span>
                        }
                        return <span className="text-[13px] text-gray-400">—</span>
                      })()}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {row.ticketTypes.map((t) => (
                        <span key={t} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${TICKET_TYPE_COLORS[t.toLowerCase()] ?? ''}`}>
                          {capitalize(t)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">
                    ₦{row.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <PaginationBar page={page} totalPages={totalPages} total={total} label="attendees" onPage={setPage} />
      </div>

      {/* Click hint */}
      {!loading && paged.length > 0 && (
        <p className="text-[12px] text-gray-400 text-center mt-3">Click any row to view full attendee details</p>
      )}
    </div>
  )
}