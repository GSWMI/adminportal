import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, ExternalLink, XCircle, Loader2 } from 'lucide-react'
import { getAllOrders, resendTicket, getTicketTypes, type OrderData } from '../../../services/orderService'
import { getEventById, updateRegistration } from '../../../services/eventService'
import { exportAttendeesCsv } from '../../../services/exportService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
  const [orders, setOrders] = useState<OrderData[]>([])
  const [eventName, setEventName] = useState('')
  const [totalDays, setTotalDays] = useState(3)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [closingReg, setClosingReg] = useState(false)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [ordersResult, event] = await Promise.all([
          getAllOrders(),
          getEventById(id!),
        ])
        // Filter orders by eventId
        const eventOrders = ordersResult.orders.filter((o) => o.eventId === id)
        setOrders(eventOrders)
        setEventName(event.name)
        setTotalDays(event.totalDays)
      } catch {
        toast.error('Failed to load attendees')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleResend = async (orderId: string, email: string) => {
    setResendingId(orderId)
    try {
      await resendTicket(orderId)
      toast.success(`Ticket resent to ${email}`)
    } catch {
      toast.error('Failed to resend ticket')
    } finally {
      setResendingId(null)
    }
  }

  const handleCloseRegistration = async () => {
    if (!id) return
    setClosingReg(true)
    try {
      await updateRegistration(id, 'all', false)
      toast.success('Registration closed')
    } catch {
      toast.error('Failed to close registration')
    } finally {
      setClosingReg(false)
    }
  }

  const filtered = orders.filter((o) =>
    !search ||
    `${o.guest.firstName} ${o.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    o.guest.email.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const TOTAL_PAGES = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/tickets/${id}`)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Attendees</h1>
          {eventName && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{eventName}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setExporting(true)
              try {
                await exportAttendeesCsv(id)
                toast.success('Attendees exported successfully')
              } catch {
                toast.error('Failed to export attendees')
              } finally {
                setExporting(false)
              }
            }}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button
            onClick={handleCloseRegistration}
            disabled={closingReg}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-[13px] font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {closingReg ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            {closingReg ? 'Closing...' : 'Close registration'}
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
          <DayTabs active={activeDay} onChange={setActiveDay} total={totalDays} />
          <div className="flex-1" />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all"
            />
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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><Skeleton height={14} /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-gray-400">
                  {search ? 'No attendees match your search' : 'No attendees for this event yet'}
                </td>
              </tr>
            ) : (
              paginated.map((order) => {
                const ticketTypes = getTicketTypes(order)
                return (
                  <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">
                      {order.guest.firstName} {order.guest.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{order.guest.email}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{order.guest.phone}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ticketTypes.map((t) => (
                          <span key={t} className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${TICKET_TYPE_COLORS[t] ?? ''}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleResend(order._id, order.guest.email)}
                        disabled={resendingId === order._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#3b5bdb] text-[#3b5bdb] rounded-lg text-[12px] font-medium hover:bg-blue-50 transition-colors disabled:opacity-60"
                      >
                        {resendingId === order._id && <Loader2 size={12} className="animate-spin" />}
                        {resendingId === order._id ? 'Sending...' : 'Resend ticket(s)'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">Page {page} of {TOTAL_PAGES}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Previous
            </button>
            <button disabled={page === TOTAL_PAGES} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Next
            </button>
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