import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { getAllOrders, type OrderData } from '../../../services/orderService'
import { getEventById } from '../../../services/eventService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SLOT_COLORS: Record<string, string> = {
  breakfast: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  lunch: 'bg-orange-50 text-orange-600 border-orange-200',
  dinner: 'bg-blue-50 text-blue-600 border-blue-200',
}

export default function MealTicketsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(1)
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderData[]>([])
  const [eventName, setEventName] = useState('')
  const [totalDays, setTotalDays] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [ordersResult, event] = await Promise.all([
          getAllOrders(id),
          getEventById(id!),
        ])
        setOrders(ordersResult.orders)
        setEventName(event.name)
        setTotalDays(event.totalDays ?? 1)
      } catch {
        toast.error('Failed to load meal tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Drive from qrCodes — each meal QR has slot, optionName, day, quantity
  const mealRows = orders.flatMap((order) => {
    const mealQrs = order.qrCodes?.filter((q) => q.type === 'meal' && q.day === activeDay) ?? []
    if (mealQrs.length === 0) return []
    return mealQrs.map((qr) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      name: `${order.guest.firstName} ${order.guest.lastName}`,
      email: order.guest.email,
      slot: qr.mealType ?? '',
      optionName: (qr as { optionName?: string }).optionName ?? '',
      quantity: (qr as { quantity?: number }).quantity ?? 1,
      qr,
    }))
  }).filter((r) =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.orderNumber.toLowerCase().includes(search.toLowerCase())
  )

  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Meal tickets</h1>
          {eventName && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-medium">{eventName}</span>}
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {days.map((day) => (
          <button key={day} onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeDay === day ? 'bg-[#3b5bdb] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            Day {day}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or order number..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#3b5bdb]" />
      </div>

      {loading ? (
        <Skeleton count={5} height={52} className="mb-2" />
      ) : mealRows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-[14px] text-gray-400">No meal tickets for Day {activeDay}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Attendee</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Slot</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Meal option</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Qty</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">QR code</th>
                <th className="text-left text-[12px] text-gray-500 font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mealRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-gray-900">{row.name}</p>
                    <p className="text-[11px] text-gray-400">{row.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${SLOT_COLORS[row.slot.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {row.slot}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{row.optionName || '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-700">{row.quantity}</td>
                  <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">{row.qr?.code ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {row.qr ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${row.qr.redeemed ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {row.qr.redeemed ? 'Redeemed' : 'Valid'}
                      </span>
                    ) : <span className="text-[11px] text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}