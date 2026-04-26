import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Download, Loader2 } from 'lucide-react'
import { getAccommodationTickets, type AccommodationTicketRow } from '../../../services/orderService'
import { updateRegistration, getEventById } from '../../../services/eventService'
import { exportAccommodationTicketsCsv } from '../../../services/exportService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function AccommodationTicketsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [list, setList] = useState<AccommodationTicketRow[]>([])
  const [eventName, setEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [accRegOpen, setAccRegOpen] = useState(true)
  const [closingReg, setClosingReg] = useState(false)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [result, event] = await Promise.all([getAccommodationTickets(id!), getEventById(id!)])
        setList(result.list)
        setEventName(event.name)
        setAccRegOpen(event.accommodationRegistrationOpen ?? true)
      } catch { toast.error('Failed to load accommodation tickets') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  const handleExport = async () => {
    setExporting(true)
    try { await exportAccommodationTicketsCsv(id); toast.success('Accommodation tickets exported') }
    catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const handleToggleReg = async () => {
    if (!id) return
    setClosingReg(true)
    try {
      await updateRegistration(id, 'accommodation', !accRegOpen)
      setAccRegOpen((v) => !v)
      toast.success(`Accommodation registration ${!accRegOpen ? 'opened' : 'closed'}`)
    } catch { toast.error('Failed to update registration') }
    finally { setClosingReg(false) }
  }

  const filtered = list.filter((r) =>
    !search ||
    `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    r.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">Accommodation tickets</h1>
        {eventName && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{eventName}</span>}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleToggleReg} disabled={closingReg}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${accRegOpen ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
          {closingReg && <Loader2 size={13} className="animate-spin" />}
          {accRegOpen ? 'Close accommodation registration' : 'Open accommodation registration'}
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60">
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or order number..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3b5bdb]" />
      </div>

      {loading ? <Skeleton count={5} height={52} className="mb-2" />
        : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-[14px] text-gray-400">No accommodation tickets found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Attendee', 'Order #', 'Accommodation', 'Price (₦)', 'Per room', 'QR code', 'Status'].map((h) => (
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
                        <p className="text-[13px] font-medium text-gray-900">{row.guest.firstName} {row.guest.lastName}</p>
                        <p className="text-[11px] text-gray-400">{row.guest.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600 font-mono">{row.orderNumber}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-purple-50 text-purple-600 border-purple-200">
                          {row.accommodation.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700">₦{row.accommodation.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700">{row.accommodation.peoplePerRoom}</td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">{qr?.code ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        {qr ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${qr.redeemed ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                            {qr.redeemed ? 'Redeemed' : 'Valid'}
                          </span>
                        ) : <span className="text-[11px] text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}