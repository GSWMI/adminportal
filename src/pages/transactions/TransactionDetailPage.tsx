import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Image } from 'lucide-react'
import { useState } from 'react'
import { mockTransactions } from '../../data/mockTransactions'
import Receipt from './Receipt'
import { useReceiptDownload } from '../../hooks/useReceiptDownload'

const STATUS_STYLES: Record<string, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const { receiptRef, downloadPDF, downloadImage, downloading } = useReceiptDownload()

  const tx = mockTransactions.find((t) => t.id === id)
  if (!tx) return <div className="text-center py-20 text-gray-400">Transaction not found</div>

  const filename = `receipt-${tx.transactionId}`

  return (
    <div className="max-w-215">
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
          <p className="text-[13px] text-gray-500">Date & Time: <span className="text-gray-800 font-medium">{tx.dateTime}</span></p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-[13px] text-gray-500">Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${STATUS_STYLES[tx.status]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {tx.status}
            </span>
          </div>
          <p className="text-[13px] text-gray-500">
            Transaction ID: <span className="text-gray-800 font-medium">{tx.transactionId}</span>
          </p>
          <p className="text-[13px] text-gray-500 text-right">
            Total Amount Paid: <span className="text-gray-800 font-semibold">₦{tx.totalAmountPaid.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            Payment Gateway:
            <span className="px-2 py-0.5 border border-gray-300 rounded text-[12px] text-gray-700">{tx.gateway}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 mb-5" />

        {/* Attendee */}
        <Section label="Attendee">
          <Row left={<Field label="First name" value={tx.attendee.firstName} />} right={<Field label="Last name" value={tx.attendee.lastName} />} />
          <Row left={<Field label="Email address" value={tx.attendee.email} />} right={<Field label="Phone number" value={tx.attendee.phone} />} />
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Ticket */}
        <Section label="Ticket">
          <Row
            left={<Field label="Event name" value={tx.ticket.eventName} />}
            right={
              <div className="flex items-center gap-2 text-[13px] text-gray-500">
                Ticket type:
                <span className="px-2.5 py-0.5 border border-blue-200 rounded-full text-[11px] text-blue-600 bg-blue-50 font-medium">
                  {tx.ticket.ticketType}
                </span>
              </div>
            }
          />
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Payment Summary */}
        <Section label="Payment Summary">
          {tx.paymentSummary.mealTicket && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Meal ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.mealTicket.toLocaleString()}</span>
            </div>
          )}
          {tx.paymentSummary.accommodationTicket && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Accommodation ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.accommodationTicket.toLocaleString()}</span>
            </div>
          )}
          {tx.paymentSummary.transportTicket && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-gray-500">Transport ticket:</span>
              <span className="text-[13px] text-gray-800 font-medium">₦{tx.paymentSummary.transportTicket.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1">
            <span className="text-[13px] text-gray-500">Total amount paid:</span>
            <span className="text-[13px] text-gray-800 font-semibold">₦{tx.paymentSummary.totalAmountPaid.toLocaleString()}</span>
          </div>
        </Section>

        <div className="border-t border-gray-100 mb-5" />

        {/* Payment */}
        <Section label="Payment">
          <Row
            left={<Field label="Method" value={tx.paymentMethod} />}
            right={<Field label="Reference" value={tx.paymentReference} />}
          />
        </Section>
      </div>

      {/* Download receipt button */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowDownloadMenu((v) => !v)}
          disabled={!!downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b5bdb] text-white rounded-lg text-[14px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          <Download size={15} />
          {downloading ? 'Downloading...' : 'Download receipt'}
        </button>

        {showDownloadMenu && !downloading && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-43.75 z-10">
            <button
              onClick={() => { setShowDownloadMenu(false); downloadPDF(filename) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} className="text-gray-400" />
              Download as PDF
            </button>
            <button
              onClick={() => { setShowDownloadMenu(false); downloadImage(filename) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Image size={14} className="text-gray-400" />
              Download as Image
            </button>
          </div>
        )}
      </div>

      {/* Hidden receipt for html2canvas capture */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1, pointerEvents: "none" }}>
        <Receipt ref={receiptRef} transaction={tx} />
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
  return (
    <div className="flex items-center justify-between">
      {left}
      {right}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13px] text-gray-500">
      {label}: <span className="text-gray-800 font-medium">{value}</span>
    </p>
  )
}