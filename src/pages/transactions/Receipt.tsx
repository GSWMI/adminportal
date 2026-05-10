import { forwardRef } from 'react'
import type { OrderData } from '../../services/orderService'
import { mapPaymentStatus, getTicketTypes } from '../../services/orderService'

interface Props {
  order: OrderData
}

const STATUS_COLORS: Record<string, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

function formatDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const Receipt = forwardRef<HTMLDivElement, Props>(({ order }, ref) => {
  const status = mapPaymentStatus(order)
  const ticketTypes = getTicketTypes(order)
  const gateway = order.paystackReference ? 'Paystack' : '—'

  return (
    <div
      ref={ref}
      className="bg-white w-[620px] px-10 py-8 font-sans"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
         <img src="/logo.png" alt="GSWMI" className="h-10 object-contain" />
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Payment Receipt</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[status] ?? ''}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-6" />

      {/* Meta */}
      <div className="grid grid-cols-2 gap-y-2 mb-6">
        <ReceiptField label="Order Number" value={order.orderNumber} />
        <ReceiptField label="Date" value={formatDate(order.createdAt)} align="right" />
        <ReceiptField label="Payment Gateway" value={gateway} />
        <ReceiptField label="Reference" value={order.paystackReference ?? order.paymentReference ?? '—'} align="right" />
      </div>

      <div className="border-t border-gray-200 mb-6" />

      {/* Attendee */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Attendee</p>
        <div className="grid grid-cols-2 gap-y-1.5">
          <ReceiptField label="Name" value={`${order.guest.firstName} ${order.guest.lastName}`} />
          <ReceiptField label="Email" value={order.guest.email} align="right" />
          <ReceiptField label="Phone" value={order.guest.phone} />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-5" />

      {/* Ticket */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Ticket</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500">Type:</span>
          {ticketTypes.map((t) => (
            <span key={t} className="px-2 py-0.5 border border-blue-200 rounded-full text-[11px] text-blue-600 bg-blue-50 font-medium">{t}</span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-5" />

      {/* Payment Summary */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Payment Summary</p>
        {(order.mealTotal ?? 0) > 0 && (
          <SummaryRow label="Meal ticket" amount={order.mealTotal ?? 0} />
        )}
        {(order.accommodationTotal ?? 0) > 0 && (
          <SummaryRow label="Accommodation ticket" amount={order.accommodationTotal ?? 0} />
        )}
        {(order.transportTotal ?? 0) > 0 && (
          <SummaryRow label="Transport ticket" amount={order.transportTotal ?? 0} />
        )}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
          <span className="text-[13px] font-semibold text-gray-800">Total amount paid</span>
          <span className="text-[14px] font-bold text-gray-900">₦{order.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1 text-center border-t border-gray-100 pt-5">
        <p className="text-[11px] text-gray-400">Thank you for registering with GSWMI</p>
        <p className="text-[10px] text-gray-300">© GSWMI Logistics Team</p>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'
export default Receipt

function ReceiptField({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <p className={`text-[12px] text-gray-500 ${align === 'right' ? 'text-right' : ''}`}>
      {label}: <span className="text-gray-800 font-medium">{value}</span>
    </p>
  )
}

function SummaryRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-[12px] text-gray-800 font-medium">₦{amount.toLocaleString()}</span>
    </div>
  )
}