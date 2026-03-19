import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Image } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getOrderById, mapPaymentStatus, getTicketTypes, type OrderData } from '../../services/orderService'
import Receipt from './Receipt'
import { useReceiptDownload } from '../../hooks/useReceiptDownload'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const STATUS_STYLES: Record<string, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

function formatDateTime(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const { receiptRef, downloadPDF, downloadImage, downloading } = useReceiptDownload()

  useEffect(() => {
    if (!id) return
    async function fetchOrder() {
      try {
        const data = await getOrderById(id!)
        setOrder(data)
      } catch {
        toast.error('Failed to load transaction details')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-[860px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton width={24} height={24} />
          <Skeleton width={200} height={22} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-8 py-6">
          <Skeleton count={8} height={18} className="mb-3" />
        </div>
      </div>
    )
  }

  if (!order) return <div className="text-center py-20 text-gray-400">Transaction not found</div>

  const status = mapPaymentStatus(order)
  const ticketTypes = getTicketTypes(order)
  const filename = `receipt-${order.orderNumber}`
  const gateway = order.paystackReference ? 'Paystack' : '—'

  return (
    <div className="max-w-[860px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/transactions')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">Transaction details</h1>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-gray-200 px-8 py-6 mb-6">

        {/* Top meta */}
        <div className="grid grid-cols-2 gap-y-2 mb-6">
          <p className="text-[13px] text-gray-500">
            Date & Time: <span className="text-gray-800 font-medium">{formatDateTime(order.createdAt)}</span>
          </p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-[13px] text-gray-500">Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${STATUS_STYLES[status] ?? ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {status}
            </span>
          </div>
          <p className="text-[13px] text-gray-500">
            Order number: <span className="text-gray-800 font-medium">{order.orderNumber}</span>
          </p>
          <p className="text-[13px] text-gray-500 text-right">
            Total Amount Paid: <span className="text-gray-800 font-semibold">₦{order.totalAmount?.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            Payment Gateway:
            <span className="px-2 py-0.5 border border-gray-300 rounded text-[12px] text-gray-700">{gateway}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 mb-5" />

        {/* Attendee */}
        <Section label="Attendee">
          <Row
            left={<Field label="First name" value={order.guest.firstName} />}
            right={<Field label="Last name" value={order.guest.lastName} />}
          />
          <Row
            left={<Field label="Email address" value={order.guest.email} />}
            right={<Field label="Phone number" value={order.guest.phone} />}
          />
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Ticket */}
        <Section label="Ticket">
          <Row
            left={<Field label="Event ID" value={order.eventId} />}
            right={
              <div className="flex items-center gap-2 text-[13px] text-gray-500 flex-wrap">
                Ticket type:
                {ticketTypes.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 border border-blue-200 rounded-full text-[11px] text-blue-600 bg-blue-50 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            }
          />
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Payment Summary */}
        <Section label="Payment Summary">
          {(order.mealTotal ?? 0) > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Meal ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{order.mealTotal?.toLocaleString()}</span>
            </div>
          )}
          {(order.accommodationTotal ?? 0) > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Accommodation ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{order.accommodationTotal?.toLocaleString()}</span>
            </div>
          )}
          {(order.transportTotal ?? 0) > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Transport ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{order.transportTotal?.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-gray-500">Total amount paid:</span>
            <span className="text-[13px] text-gray-800 font-semibold">₦{order.totalAmount?.toLocaleString()}</span>
          </div>
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Payment */}
        <Section label="Payment">
          <Row
            left={<Field label="Method" value={gateway} />}
            right={<Field label="Reference" value={order.paystackReference ?? order.paymentReference ?? '—'} />}
          />
          {order.paidAt && (
            <Field label="Paid at" value={formatDateTime(order.paidAt)} />
          )}
        </Section>
      </div>

      {/* Download receipt button */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowDownloadMenu((v) => !v)}
          disabled={!!downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b5bdb] text-white rounded-lg text-[14px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          <Download size={15} className="flex-shrink-0" />
          {downloading ? 'Downloading...' : 'Download receipt'}
        </button>

        {showDownloadMenu && !downloading && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[175px] z-10">
            <button
              onClick={() => { setShowDownloadMenu(false); downloadPDF(filename) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <FileText size={14} className="text-gray-400 flex-shrink-0" />
              Download as PDF
            </button>
            <button
              onClick={() => { setShowDownloadMenu(false); downloadImage(filename) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Image size={14} className="text-gray-400 flex-shrink-0" />
              Download as Image
            </button>
          </div>
        )}
      </div>

      {/* Hidden receipt for capture */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}>
        <Receipt ref={receiptRef} order={order} />
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="flex items-center justify-between">{left}{right}</div>
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13px] text-gray-500">
      {label}: <span className="text-gray-800 font-medium">{value}</span>
    </p>
  )
}