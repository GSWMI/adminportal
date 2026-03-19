import { forwardRef } from 'react'
import type { Transaction } from '../../data/mockTransactions'

interface Props {
  transaction: Transaction
}

const STATUS_COLORS: Record<string, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

const Receipt = forwardRef<HTMLDivElement, Props>(({ transaction: tx }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white w-[620px] px-10 py-8 font-sans"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        {/* Logo box */}
        <div className="bg-[#0d1b2a] px-5 py-4 rounded-lg w-[160px] flex flex-col">
          <span className="text-white text-lg font-bold font-serif italic">╱GSWMI</span>
          <span className="text-white/50 text-[7px] tracking-widest uppercase leading-tight mt-0.5">
            Gbenga Samuel-Wemimo Ministry International
          </span>
        </div>
        {/* Title */}
        <div className="text-right">
          <p className="text-gray-400 text-[15px] font-medium">Payment Receipt</p>
          <p className="text-gray-900 text-[14px] font-bold tracking-wide">GSWMI LOGISTICS TEAM</p>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-6" />

      {/* Transaction meta */}
      <div className="grid grid-cols-2 gap-y-2 mb-6">
        <div className="text-[13px] text-gray-500">
          Date & Time: <span className="text-gray-800 font-medium">{tx.dateTime}</span>
        </div>
        <div className="text-[13px] text-gray-500 text-right">
          ID: <span className="text-gray-800 font-medium">{tx.transactionId}</span>
        </div>
        <div className="text-[13px] text-gray-500">
          Payment reference: <span className="text-gray-800 font-medium">{tx.paymentReference}</span>
        </div>
        <div className="text-[13px] text-gray-500 text-right flex items-center justify-end gap-1.5">
          Status:
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[tx.status]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {tx.status}
          </span>
        </div>
        <div className="text-[13px] text-gray-500">
          Payment Gateway:
          <span className="ml-1.5 px-2 py-0.5 border border-gray-300 rounded text-[12px] text-gray-700">{tx.gateway}</span>
        </div>
        <div className="text-[13px] text-gray-500 text-right">
          Method: <span className="text-gray-800 font-medium">{tx.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-5" />

      {/* Attendee */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Attendee</p>
        <div className="grid grid-cols-2 gap-y-1.5">
          <p className="text-[13px] text-gray-500">First name: <span className="text-gray-800 font-semibold">{tx.attendee.firstName}</span></p>
          <p className="text-[13px] text-gray-500 text-right">Last name: <span className="text-gray-800 font-semibold">{tx.attendee.lastName}</span></p>
          <p className="text-[13px] text-gray-500">Email address: <span className="text-gray-800">{tx.attendee.email}</span></p>
          <p className="text-[13px] text-gray-500 text-right">Phone number: <span className="text-gray-800">{tx.attendee.phone}</span></p>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-5" />

      {/* Ticket */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Ticket</p>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-500">Event name: <span className="text-gray-800 font-semibold">{tx.ticket.eventName}</span></p>
          <p className="text-[13px] text-gray-500 flex items-center gap-1.5">
            Ticket type:
            <span className="px-2.5 py-0.5 border border-blue-200 rounded-full text-[11px] text-blue-600 bg-blue-50">{tx.ticket.ticketType}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-5" />

      {/* Payment summary */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-[#3b5bdb] uppercase tracking-wider mb-3">Payment Summary</p>
        <div className="flex flex-col gap-1.5">
          {tx.paymentSummary.mealTicket && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Meal ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.mealTicket.toLocaleString()}</span>
            </div>
          )}
          {tx.paymentSummary.accommodationTicket && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Accommodation ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.accommodationTicket.toLocaleString()}</span>
            </div>
          )}
          {tx.paymentSummary.transportTicket && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Transport ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.transportTicket.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 mt-1">
            <span className="text-[13px] text-gray-500">Total amount paid:</span>
            <span className="text-[13px] text-gray-900 font-semibold">₦{tx.paymentSummary.totalAmountPaid.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      {/* Footer */}
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-400 italic">This receipt confirms that payment has been successfully received.</p>
        <p className="text-[12px] text-gray-400 italic">This receipt is system-generated and does not require a signature.</p>
        <p className="text-[12px] text-gray-400 mt-1">© GSWMI Logistics Team</p>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'
export default Receipt