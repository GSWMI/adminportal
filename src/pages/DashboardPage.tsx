import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, UserPlus, MoreVertical, ArrowUpRight, FileText } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import TicketTypeBadge from '../components/ui/TicketTypeBadge'
import AddUserModal from '../components/AddUserModal'
import api from '../lib/axios'
import { getAllOrders, mapPaymentStatus, getTicketTypes, type OrderData } from '../services/orderService'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface DashboardStats {
  ticketsCreated: number
  totalOrders: number
  totalRevenue: number
  paidOrders: number
  pendingOrders: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showAddUser, setShowAddUser] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    ticketsCreated: 0, totalOrders: 0, totalRevenue: 0, paidOrders: 0, pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Single call without eventId returns aggregate across all events
        const [statsRes, ordersResult] = await Promise.all([
          api.get('/events/admin/dashboard'),
          getAllOrders(),
        ])

        const fetchedOrders = Array.isArray(ordersResult.orders) ? ordersResult.orders : []
        setOrders(fetchedOrders)

        const inner = statsRes.data?.data ?? statsRes.data
        setStats({
          ticketsCreated: inner?.totalEvents ?? 0,
          totalOrders: inner?.totalOrders ?? 0,
          totalRevenue: inner?.totalRevenue ?? 0,
          paidOrders: inner?.paidOrders ?? 0,
          pendingOrders: inner?.pendingOrders ?? 0,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const recentOrders = orders.slice(0, 7)
  const hasOrders = orders.length > 0

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Tickets created" value={stats.ticketsCreated} loading={loading} />
        <StatCard label="Total orders" value={stats.totalOrders} loading={loading} />
        <StatCard label="Total revenue" value={stats.totalRevenue} loading={loading} prefix="₦" format="currency" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Paid orders" value={stats.paidOrders} loading={loading} accent="green" />
        <StatCard label="Pending orders" value={stats.pendingOrders} loading={loading} accent="orange" />
      </div>

      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Quick actions</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/tickets/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <Ticket size={15} className="text-gray-500" />Add ticket
          </button>
          <button onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <UserPlus size={15} className="text-gray-500" />Add user
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">Transactions</h2>
          {hasOrders && (
            <button onClick={() => navigate('/transactions')}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-50">
              View all <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        {loading ? <TableSkeleton />
          : error ? <div className="py-12 text-center text-[13px] text-red-400">{error}</div>
          : !hasOrders ? <EmptyTransactions />
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Attendee', 'Date', 'Ticket type',  'Amount', 'Status', ''].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const menuKey = order.orderNumber
                    const ticketTypes = getTicketTypes(order)
                    return (
                      <tr key={menuKey} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-[13px] font-medium text-gray-900">{order.guest.firstName} {order.guest.lastName}</p>
                          <p className="text-[12px] text-gray-400">{order.guest.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {ticketTypes.map((t) => <TicketTypeBadge key={t} type={t} />)}
                          </div>
                        </td>
              
                        <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">₦{order.totalAmount?.toLocaleString() ?? '—'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={mapPaymentStatus(order)} /></td>
                        <td className="px-3 py-3.5 relative">
                          <button onClick={() => setOpenMenuId(openMenuId === menuKey ? null : menuKey)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
                            <MoreVertical size={15} />
                          </button>
                          {openMenuId === menuKey && (
                            <div className="absolute right-4 bottom-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
                              <button onClick={() => { setOpenMenuId(null); navigate(`/transactions/${order._id || order.orderNumber}`) }}
                                className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap">
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

function StatCard({ label, value, loading, prefix = '', format = 'number', accent }: {
  label: string; value: number; loading: boolean; prefix?: string; format?: 'number' | 'currency'; accent?: 'green' | 'orange'
}) {
  const accentClass = accent === 'green' ? 'border-green-100 bg-green-50/40' : accent === 'orange' ? 'border-orange-100 bg-orange-50/40' : ''
  const valueClass = accent === 'green' ? 'text-green-700' : accent === 'orange' ? 'text-orange-600' : 'text-gray-900'
  const displayValue = format === 'currency' ? `${prefix}${value.toLocaleString()}` : `${prefix}${value}`
  return (
    <div className={`bg-white rounded-xl border border-gray-200 px-5 py-5 ${accentClass}`}>
      <p className="text-[13px] text-gray-500 mb-1">{label}</p>
      {loading ? <Skeleton height={36} width={80} /> : <p className={`text-[28px] font-semibold ${valueClass}`}>{displayValue}</p>}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="px-5 py-4 flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={24} />)}
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