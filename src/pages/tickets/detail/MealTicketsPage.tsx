import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Download, Loader2 } from 'lucide-react'
import { getMealTickets, type MealTicketRow } from '../../../services/orderService'
import { updateRegistration, getEventById } from '../../../services/eventService'
import { exportMealTicketsCsv } from '../../../services/exportService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import PaginationBar from '../../../components/ui/PaginationBar'

const SLOT_COLORS: Record<string, string> = {
  breakfast: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  lunch: 'bg-orange-50 text-orange-600 border-orange-200',
  dinner: 'bg-blue-50 text-blue-600 border-blue-200',
}

const ITEMS_PER_PAGE = 20

export default function MealTicketsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(1)
  const [search, setSearch] = useState('')
  const [list, setList] = useState<MealTicketRow[]>([])
  const [eventName, setEventName] = useState('')
  const [totalDays, setTotalDays] = useState(1)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [mealRegOpen, setMealRegOpen] = useState(true)
  const [closingReg, setClosingReg] = useState(false)

  // Server-side pagination — scoped per day
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch event info once on mount
  useEffect(() => {
    if (!id) return
    getEventById(id)
      .then((event) => {
        setEventName(event.name)
        setTotalDays(event.totalDays ?? 1)
        setMealRegOpen(event.mealRegistrationOpen ?? true)
      })
      .catch(() => toast.error('Failed to load event'))
  }, [id])

  // Fetch meal tickets whenever eventId, day, or page changes
  // day is passed to the backend so pagination totals reflect that day only
  useEffect(() => {
    if (!id) return
    async function fetchTickets() {
      setLoading(true)
      try {
        const result = await getMealTickets(id!, {
          page,
          limit: ITEMS_PER_PAGE,
          day: activeDay,
        })
        setList(result.list)
        setTotalPages(result.pagination.pages ?? 1)
        setTotal(result.pagination.total ?? 0)
      } catch {
        toast.error('Failed to load meal tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [id, page, activeDay])

  const handleExport = async () => {
    setExporting(true)
    try { await exportMealTicketsCsv(id); toast.success('Meal tickets exported') }
    catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const handleToggleReg = async () => {
    if (!id) return
    setClosingReg(true)
    try {
      await updateRegistration(id, 'meal', !mealRegOpen)
      setMealRegOpen((v) => !v)
      toast.success(`Meal registration ${!mealRegOpen ? 'opened' : 'closed'}`)
    } catch { toast.error('Failed to update registration') }
    finally { setClosingReg(false) }
  }

  // const handleDayChange = (day: number) => {
  //   setActiveDay(day)
  //   setPage(1) // reset to page 1 when switching days
  // }

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Client-side search on current page results only
  const filtered = list.filter((r) =>
    !search ||
    `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    r.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  // const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Meal tickets</h1>
          {eventName && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{eventName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleReg}
            disabled={closingReg}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
              mealRegOpen
                ? 'border-red-200 text-red-500 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {closingReg && <Loader2 size={13} className="animate-spin" />}
            {mealRegOpen ? 'Close meal registration' : 'Open meal registration'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Day tabs */}
      {/* <div className="flex items-center gap-2 mb-6 flex-wrap">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDayChange(day)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeDay === day
                ? 'bg-[#3b5bdb] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Day {day}
            {activeDay === day && total > 0 && (
              <span className="ml-1.5 bg-white/20 text-white text-[11px] px-1.5 py-0.5 rounded-full">
                {total}
              </span>
            )}
          </button>
        ))}
      </div> */}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or order number..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3b5bdb]"
        />
      </div>

      {loading ? (
        <Skeleton count={5} height={52} className="mb-2" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-[14px] text-gray-400">
            {search ? 'No results match your search' : `No meal tickets for Day ${activeDay}`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Attendee', 'Order #', 'Slot', 'Meal option', 'Qty', 'Price (₦)', 'QR code', 'Status'].map((h) => (
                  <th key={h} className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const qr = row.qrCodes?.[0]
                return (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-medium text-gray-900">
                        {row.guest.firstName} {row.guest.lastName}
                      </p>
                      <p className="text-[11px] text-gray-400">{row.guest.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 font-mono">{row.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
                        SLOT_COLORS[row.slot.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {row.slot}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">{row.optionName || '—'}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">{row.quantity}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">₦{row.price.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">{qr?.code ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {qr ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          qr.redeemed
                            ? 'bg-gray-50 text-gray-500 border-gray-200'
                            : 'bg-green-50 text-green-600 border-green-200'
                        }`}>
                          {qr.redeemed ? 'Redeemed' : 'Valid'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            // label={`Day ${activeDay} meal tickets`}
            onPage={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}