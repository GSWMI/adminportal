import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, UserPlus, MoreVertical, ArrowUpRight, FileText } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import TicketTypeBadge from '../components/ui/TicketTypeBadge'
import AddUserModal from '../components/AddUserModal'

// Mock data — replace with API calls later
const mockStats = {
  ticketsCreated: 1,
  activeTickets: 1,
  inactiveTickets: 0,
}

const mockTransactions = [
  { id: '1', attendee: 'Sienna Hewitt', email: 'hi@siennahewitt.com', date: 'Jan 16, 2025', ticketType: 'Meal', gateway: 'Paystack', amount: '₦65,000', status: 'Pending' },
  { id: '2', attendee: 'Ammar Foley', email: 'ammarfoley@gmail.com', date: 'Jan 16, 2025', ticketType: 'Meal', gateway: 'Paystack', amount: '₦65,000', status: 'Pending' },
  { id: '3', attendee: 'Pippa Wilkinson', email: 'pippa@pippaw.com', date: 'Jan 15, 2025', ticketType: 'Meal', gateway: 'Paystack', amount: '₦65,000', status: 'Successful' },
  { id: '4', attendee: 'Pippa Wilkinson', email: 'pippa@pippaw.com', date: 'Jan 15, 2025', ticketType: 'Meal', gateway: 'Paystack', amount: '₦65,000', status: 'Successful' },
  { id: '5', attendee: 'Pippa Wilkinson', email: 'pippa@pippaw.com', date: 'Jan 15, 2025', ticketType: 'Meal', gateway: 'Paystack', amount: '₦65,000', status: 'Successful' },
  { id: '6', attendee: 'Olly Schroeder', email: 'olly_s@icloud.com', date: '16 Jan 2025', ticketType: 'Meal', gateway: 'Flutterwave', amount: '₦65,000', status: 'Cancelled' },
  { id: '7', attendee: 'Mathilde Lewis', email: 'mathilde@hey.com', date: '16 Jan 2025', ticketType: 'Meal', gateway: 'Flutterwave', amount: '₦65,000', status: 'Cancelled' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const hasTransactions = mockTransactions.length > 0

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Tickets created" value={mockStats.ticketsCreated} />
        <StatCard label="Active tickets" value={mockStats.activeTickets} />
        <StatCard label="Inactive tickets" value={mockStats.inactiveTickets} />
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
          {hasTransactions && (
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-50"
            >
              View all
              <ArrowUpRight size={13} />
            </button>
          )}
        </div>

        {!hasTransactions ? (
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
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-medium text-gray-900">{tx.attendee}</p>
                      <p className="text-[12px] text-gray-400">{tx.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">{tx.date}</td>
                    <td className="px-5 py-3.5"><TicketTypeBadge type={tx.ticketType} /></td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{tx.gateway}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{tx.amount}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={tx.status} /></td>
                    <td className="px-3 py-3.5 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {openMenuId === tx.id && (
                        <div className="absolute right-4 top-10 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50">View details</button>
                          <button className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50">Edit</button>
                          <button className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <p className="text-[13px] text-gray-500 mb-1">{label}</p>
      <p className="text-[28px] font-semibold text-gray-900">{value}</p>
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