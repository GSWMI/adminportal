import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ExternalLink, Calendar, MoreVertical, CreditCard, FileText } from 'lucide-react'
import { mockTransactions, type Transaction, type TransactionStatus } from '../data/mockTransactions'

const STATUS_STYLES: Record<TransactionStatus, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

const STATUS_DOT: Record<TransactionStatus, string> = {
  Successful: 'bg-green-500',
  Pending: 'bg-blue-500',
  Cancelled: 'bg-orange-400',
  Failed: 'bg-red-500',
}

interface TransactionRowProps {
  tx: Transaction
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}

function TransactionRow({ tx, openMenuId, setOpenMenuId }: TransactionRowProps) {
  const navigate = useNavigate()
  const menuOpen = openMenuId === tx.id

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-medium text-gray-900">{tx.attendee.firstName} {tx.attendee.lastName}</p>
        <p className="text-[12px] text-gray-400">{tx.attendee.email}</p>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">{tx.dateTime.split(',')[0]}</td>
      <td className="px-5 py-3.5">
        <span className="px-2.5 py-0.5 border border-blue-200 rounded-full text-[12px] text-blue-600 bg-blue-50 font-medium">
          {tx.ticket.ticketType}
        </span>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-gray-600">{tx.gateway}</td>
      <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">
        ₦{tx.totalAmountPaid.toLocaleString()}
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${STATUS_STYLES[tx.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[tx.status]}`} />
          {tx.status}
        </span>
      </td>
      <td className="px-3 py-3.5 relative">
        <button
          onClick={() => setOpenMenuId(menuOpen ? null : tx.id)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 bottom-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-43.75">
            <button
              onClick={() => { setOpenMenuId(null); navigate(`/transactions/${tx.id}`) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <FileText size={14} className="text-gray-400 shrink-0" />
              View details
            </button>
            <button
              onClick={() => { setOpenMenuId(null); navigate(`/transactions/${tx.id}`) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <ExternalLink size={14} className="text-gray-400 shrink-0" />
              Download receipt
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const TOTAL_PAGES = 10
  const hasTransactions = mockTransactions.length > 0

  const filtered = mockTransactions.filter((tx) =>
    !search ||
    `${tx.attendee.firstName} ${tx.attendee.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    tx.attendee.email.toLowerCase().includes(search.toLowerCase()) ||
    tx.transactionId.toLowerCase().includes(search.toLowerCase())
  )

  // Close menu when clicking outside
  const tableRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="max-w-275">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Transactions</h1>
        {hasTransactions && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors whitespace-nowrap">
            <ExternalLink size={14} />
            Export
          </button>
        )}
      </div>

      {!hasTransactions ? (
        <EmptyState />
      ) : (
        <div ref={tableRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Calendar size={13} className="text-gray-400" />
              Jan 10, 2025 – Jan 16, 2025
            </button>
            <div className="flex-1" />
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-56 transition-all"
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
                {['Attendee', 'Date', 'Ticket type', 'Gateway', 'Total amount paid', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500 whitespace-nowrap">
                    {h && (
                      <span className="flex items-center gap-1">
                        {h}
                        {h !== '' && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
                            <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                />
              ))}
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
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <CreditCard size={40} className="text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] text-gray-500">No transaction records yet</p>
    </div>
  )
}