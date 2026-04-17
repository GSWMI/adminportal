import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { getAllOrders, type OrderData } from '../../../services/orderService'
import { getEventById, type EventData } from '../../../services/eventService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function TransportTicketsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [ordersResult, eventData] = await Promise.all([
          getAllOrders(id),
          getEventById(id!),
        ])
        // Filter orders that have a transport QR code
        setOrders(ordersResult.orders.filter((o) => o.qrCodes?.some((q) => q.type === 'transport')))
        setEvent(eventData)
      } catch {
        toast.error('Failed to load transport tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const filtered = orders.filter((o) =>
    !search ||
    `${o.guest.firstName} ${o.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const getTransportName = (transportId?: string) => {
    if (!transportId || !event?.transport) return '—'
    const t = Array.isArray(event.transport)
      ? event.transport.find((t) => t._id === transportId)
      : null
    return t?.pickupLocation ?? '—'
  }

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/tickets/${id}`)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">Transport tickets</h1>
        {event && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{event.name}</span>}
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or order number..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3b5bdb]" />
      </div>

      {loading ? (
        <Skeleton count={5} height={52} className="mb-2" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-[14px] text-gray-400">No transport tickets found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Attendee</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Order #</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Pickup location</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Direction</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">QR code</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const qr = order.qrCodes?.find((q) => q.type === 'transport')
                return (
                  <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-medium text-gray-900">{order.guest.firstName} {order.guest.lastName}</p>
                      <p className="text-[11px] text-gray-400">{order.guest.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 font-mono">{order.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-teal-50 text-teal-600 border-teal-200">
                        {getTransportName((order as { transportId?: string }).transportId)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 capitalize">{qr?.direction ?? '—'}</td>
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