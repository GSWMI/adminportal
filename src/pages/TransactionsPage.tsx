import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ExternalLink, Calendar, MoreVertical, CreditCard, FileText, Loader2 } from 'lucide-react'
import { getAllOrders, mapPaymentStatus, getTicketTypes, type OrderData } from '../services/orderService'
import { exportOrdersCsv } from '../services/exportService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const STATUS_STYLES: Record<string, string> = {
  Successful: 'text-green-600 bg-green-50 border-green-200',
  Pending: 'text-blue-600 bg-blue-50 border-blue-200',
  Cancelled: 'text-orange-600 bg-orange-50 border-orange-200',
  Failed: 'text-red-600 bg-red-50 border-red-200',
}

const STATUS_DOT: Record<string, string> = {
  Successful: 'bg-green-500',
  Pending: 'bg-blue-500',
  Cancelled: 'bg-orange-400',
  Failed: 'bg-red-500',
}

function formatDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SortIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
      <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface TransactionRowProps {
  order: OrderData
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}

function TransactionRow({ order, openMenuId, setOpenMenuId }: TransactionRowProps) {
  const navigate = useNavigate()
  // Use orderNumber as the unique menu key since _id may not always be present
  const menuKey = order.orderNumber
  const menuOpen = openMenuId === menuKey
  const status = mapPaymentStatus(order)
  const ticketTypes = getTicketTypes(order)
  // Use _id for navigation if available, otherwise orderNumber
  const navId = order._id || order.orderNumber

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-medium text-gray-900">{order.guest.firstName} {order.guest.lastName}</p>
        <p className="text-[12px] text-gray-400">{order.guest.email}</p>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 flex-wrap">
          {ticketTypes.map((t) => (
            <span key={t} className="px-2.5 py-0.5 border border-blue-200 rounded-full text-[12px] text-blue-600 bg-blue-50 font-medium whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-gray-600">
        {order.paystackReference ? 'Paystack' : '—'}
      </td>
      <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">
        ₦{order.totalAmount?.toLocaleString() ?? '—'}
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${STATUS_STYLES[status] ?? ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? 'bg-gray-400'}`} />
          {status}
        </span>
      </td>
      <td className="px-3 py-3.5 relative">
        <button
          onClick={() => setOpenMenuId(menuOpen ? null : menuKey)}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <div className="absolute right-4 bottom-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[175px]">
            <button
              onClick={() => { setOpenMenuId(null); navigate(`/transactions/${navId}`) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <FileText size={14} className="text-gray-400 flex-shrink-0" />
              View details
            </button>
            <button
              onClick={() => { setOpenMenuId(null); navigate(`/transactions/${navId}`) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
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
  const [orders, setOrders] = useState<OrderData[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const result = await getAllOrders()
        const orders = Array.isArray(result.orders) ? result.orders : []
        setOrders(orders)
        setTotalPages(result.pagination?.pages ?? 1)
      } catch {
        toast.error('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [page])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = orders.filter((o) =>
    !search ||
    `${o.guest.firstName} ${o.guest.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    o.guest.email.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const hasOrders = orders.length > 0

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Transactions</h1>
        {hasOrders && (
          <button
            onClick={async () => {
              setExporting(true)
              try {
                await exportOrdersCsv()
                toast.success('Orders exported successfully')
              } catch {
                toast.error('Failed to export orders')
              } finally {
                setExporting(false)
              }
            }}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <Skeleton count={7} height={52} className="mb-2" />
        </div>
      ) : !hasOrders ? (
        <EmptyState />
      ) : (
        <div ref={tableRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Calendar size={13} className="text-gray-400" />
              All dates
            </button>
            <div className="flex-1" />
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
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
                        {h}{h !== '' && <SortIcon />}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[13px] text-gray-400">
                    No transactions match your search
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <TransactionRow
                    key={order.orderNumber}
                    order={order}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-[12px] text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                Previous
              </button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
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