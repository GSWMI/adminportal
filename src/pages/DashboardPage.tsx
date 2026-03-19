import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, UserPlus, MoreVertical, ArrowUpRight, FileText } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import TicketTypeBadge from '../components/ui/TicketTypeBadge'
import AddUserModal from '../components/AddUserModal'
import { getAllEvents, type EventData } from '../services/eventService'
import { getAllOrders, mapPaymentStatus, getTicketTypes, type OrderData } from '../services/orderService'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showAddUser, setShowAddUser] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [eventsData, ordersResult] = await Promise.all([
          getAllEvents(),
          getAllOrders(),
        ])
        setEvents(eventsData)
        setOrders(Array.isArray(ordersResult.orders) ? ordersResult.orders : [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Stat cards — derived from events
  const ticketsCreated = events.length
  const activeTickets = events.filter((e) => e.registrationOpen).length
  const inactiveTickets = events.filter((e) => !e.registrationOpen).length

  // Show most recent 7 orders
  const recentOrders = orders.slice(0, 7)
  const hasOrders = orders.length > 0

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Tickets created" value={ticketsCreated} loading={loading} />
        <StatCard label="Active tickets" value={activeTickets} loading={loading} />
        <StatCard label="Inactive tickets" value={inactiveTickets} loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Quick actions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tickets/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Ticket size={15} className="text-gray-500" />
            Add ticket
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <UserPlus size={15} className="text-gray-500" />
            Add user
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">Transactions</h2>
          {hasOrders && (
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-50"
            >
              View all <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-red-400">{error}</div>
        ) : !hasOrders ? (
          <EmptyTransactions />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Attendee', 'Date', 'Ticket type', 'Gateway', 'Amount', 'Status', ''].map((h, i) => (
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
                {recentOrders.map((order) => {
                  const ticketTypes = getTicketTypes(order)
                  return (
                    <tr key={order._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-gray-900">
                          {order.guest.firstName} {order.guest.lastName}
                        </p>
                        <p className="text-[12px] text-gray-400">{order.guest.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {ticketTypes.map((t) => (
                            <TicketTypeBadge key={t} type={t} />
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
                        <StatusBadge status={mapPaymentStatus(order)} />
                      </td>
                      <td className="px-3 py-3.5 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === order._id ? null : order._id)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenuId === order._id && (
                          <div className="absolute right-4 bottom-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
                            <button
                              onClick={() => { setOpenMenuId(null); navigate(`/transactions/${order._id}`) }}
                              className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                            >
                              View details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  )
}

function StatCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <p className="text-[13px] text-gray-500 mb-1">{label}</p>
      {loading
        ? <Skeleton height={36} width={60} />
        : <p className="text-[28px] font-semibold text-gray-900">{value}</p>
      }
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="px-5 py-4 flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height={24} />
      ))}
    </div>
  )
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative">
        <FileText size={48} className="text-gray-200" />
        <FileText size={32} className="text-gray-200 absolute -bottom-2 -right-3 rotate-12" />
      </div>
      <p className="text-[13px] text-gray-400">No records yet.</p>
    </div>
  )
}