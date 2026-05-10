import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, User, Users, Loader2 } from 'lucide-react'
import { getOrderById, resendTicket, mapPaymentStatus, type OrderData } from '../../../services/orderService'
import { getEventById, type EventData } from '../../../services/eventService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// orderNumber is in the URL — use lookup endpoint
async function fetchOrderByNumber(orderNumber: string): Promise<OrderData> {
  const api = (await import('../../../lib/axios')).default
  const { data } = await api.get(`/orders/lookup/${orderNumber}`)
  const raw = data?.data?.order ?? data?.data ?? data?.order ?? data
  return { ...raw, _id: (raw._id ?? raw.id ?? '') as string } as OrderData
}

const TYPE_COLORS: Record<string, { header: string; badge: string }> = {
  meal: {
    header: 'bg-[#3b5bdb]',
    badge: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  transport: {
    header: 'bg-[#0d9488]',
    badge: 'bg-teal-50 text-teal-600 border-teal-200',
  },
  accommodation: {
    header: 'bg-[#7c3aed]',
    badge: 'bg-purple-50 text-purple-600 border-purple-200',
  },
}

function capitalize(s: string) {
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

function formatDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-gray-800 flex-1">{value ?? '—'}</span>
    </div>
  )
}

export default function AttendeeDetailPage() {
  const { id, orderNumber } = useParams<{ id: string; orderNumber: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!orderNumber || !id) return
    async function fetchData() {
      setLoading(true)
      try {
        const [o, e] = await Promise.all([
          fetchOrderByNumber(orderNumber!),
          getEventById(id!),
        ])
        setOrder(o)
        setEvent(e)
      } catch {
        toast.error('Failed to load attendee details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [orderNumber, id])

  const handleResend = async () => {
    if (!order) return
    setResending(true)
    try {
      await resendTicket(order._id || order.orderNumber)
      toast.success(`Ticket resent to ${order.guest.email}`)
    } catch {
      toast.error('Failed to resend ticket')
    } finally {
      setResending(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[800px]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <Skeleton width={200} height={24} />
        </div>
        <Skeleton count={8} height={48} className="mb-3" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-[800px]">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={18} /> Back
        </button>
        <p className="text-gray-500 text-[14px]">Attendee not found.</p>
      </div>
    )
  }

  const qrCodes = order.qrCodes ?? []
  const paymentStatus = mapPaymentStatus(order)

  return (
    <div className="max-w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-gray-900">
              {order.guest.firstName} {order.guest.lastName}
            </h1>
            {event && <p className="text-[12px] text-gray-400 mt-0.5">{event.name}</p>}
          </div>
        </div>
        <button
          onClick={handleResend}
          disabled={resending}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60"
        >
          {resending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
          {resending ? 'Sending...' : 'Resend ticket(s)'}
        </button>
      </div>

      <div className="flex flex-col gap-4">

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Order</h2>
          </div>
          <div className="px-5 py-2">
            <InfoRow label="Order number" value={<span className="font-mono text-[#3b5bdb]">{order.orderNumber}</span>} />
            <InfoRow label="Total paid" value={<span className="font-semibold">₦{order.totalAmount?.toLocaleString()}</span>} />
            <InfoRow label="Payment status" value={
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                paymentStatus === 'Successful' ? 'bg-green-50 text-green-600 border-green-200'
                : paymentStatus === 'Pending' ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-red-50 text-red-500 border-red-100'
              }`}>
                {paymentStatus}
              </span>
            } />
            <InfoRow label="Date paid" value={formatDate(order.paidAt)} />
            <InfoRow label="Registered" value={formatDate(order.createdAt)} />
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Attendee</h2>
          </div>
          <div className="px-5 py-2">
            <InfoRow label="Full name" value={
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-gray-400" />
                {order.guest.firstName} {order.guest.lastName}
              </span>
            } />
            <InfoRow label="Email" value={
              <a href={`mailto:${order.guest.email}`} className="flex items-center gap-1.5 text-[#3b5bdb] hover:underline">
                <Mail size={13} />
                {order.guest.email}
              </a>
            } />
            <InfoRow label="Phone" value={
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" />
                {order.guest.phone}
              </span>
            } />
            <InfoRow label="Gender" value={capitalize(order.guest.gender ?? '')} />
          </div>
        </div>

        {/* Next of kin */}
        {order.guest.nextOfKin && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Next of Kin</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Full name" value={
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  {order.guest.nextOfKin.fullName}
                </span>
              } />
              <InfoRow label="Email" value={
                <a href={`mailto:${order.guest.nextOfKin.email}`} className="flex items-center gap-1.5 text-[#3b5bdb] hover:underline">
                  <Mail size={13} />
                  {order.guest.nextOfKin.email}
                </a>
              } />
              {order.guest.nextOfKin.phone && (
                <InfoRow label="Phone" value={
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" />
                    {order.guest.nextOfKin.phone}
                  </span>
                } />
              )}
            </div>
          </div>
        )}

        {/* Tickets / QR codes */}
        {qrCodes.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide px-1">Tickets</h2>
            {qrCodes.map((qr, i) => {
              const colors = TYPE_COLORS[qr.type] ?? { header: 'bg-gray-700', badge: 'bg-gray-50 text-gray-600 border-gray-200' }
              const title = qr.type === 'meal'
                ? `MEAL TICKET — DAY ${qr.day ?? ''}`
                : qr.type === 'transport'
                ? 'TRANSPORT TICKET'
                : 'ACCOMMODATION TICKET'

              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={`${colors.header} px-5 py-2.5 flex items-center justify-between`}>
                    <span className="text-white text-[12px] font-bold tracking-wide">{title}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      qr.redeemed
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-green-400/30 text-white border-green-300/40'
                    }`}>
                      {qr.redeemed ? 'Redeemed' : 'Valid'}
                    </span>
                  </div>
                  <div className="px-5 py-2">
                    <InfoRow label="QR code" value={<span className="font-mono text-[12px] text-gray-500">{qr.code}</span>} />
                    {qr.type === 'meal' && (
                      <>
                        <InfoRow label="Slot" value={capitalize(qr.mealType ?? '')} />
                        <InfoRow label="Meal option" value={qr.optionName} />
                        <InfoRow label="Quantity" value={`${qr.quantity} pack${(qr.quantity ?? 1) > 1 ? 's' : ''}`} />
                      </>
                    )}
                    {qr.type === 'transport' && (
                      <>
                        <InfoRow label="Pickup" value={qr.pickupLocation} />
                        <InfoRow label="Direction" value={capitalize(qr.direction ?? '')} />
                        <InfoRow label="Quantity" value={`${qr.quantity} seat${(qr.quantity ?? 1) > 1 ? 's' : ''}`} />
                      </>
                    )}
                    {qr.type === 'accommodation' && (
                      <>
                        <InfoRow label="Room type" value={qr.accommodationName ?? qr.optionName} />
                        <InfoRow label="Quantity" value={`${qr.quantity} room${(qr.quantity ?? 1) > 1 ? 's' : ''}`} />
                      </>
                    )}
                    {qr.redeemed && qr.redeemedAt && (
                      <InfoRow label="Redeemed at" value={formatDate(qr.redeemedAt)} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}