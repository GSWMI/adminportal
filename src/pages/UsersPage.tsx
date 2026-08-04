import { useState, useEffect, useRef } from 'react'
import { UserPlus, Search, MoreVertical, Plus } from 'lucide-react'
import InviteAdminModal from '../components/InviteAdminModal'
import { toast } from 'sonner'
import { getActivityLog, type ActivityLogItem } from '../services/eventService'
import { getAdmins, resendInvite, type AdminUser } from '../services/userService'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useAuth } from '../hooks/useAuth'

function formatTimestamp(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// Derive "Performed by" from userId cross-referenced against the admins list.
// For guest-created orders, userId is absent — fall back to details.guest (the email).
function getPerformedBy(log: ActivityLogItem, admins: AdminUser[]): string {
  if (log.userId) {
    const admin = admins.find((a) => a.id === log.userId)
    if (admin) return `${admin.firstName} ${admin.lastName}`
    return `Admin (${log.userId.slice(-6)})`
  }
  // Guest action (e.g. order creation by attendee)
  if (log.details?.guest) return log.details.guest
  return 'Guest'
}

// Build a human-readable description from the log's details and entity/action.
function formatActivity(log: ActivityLogItem): string {
  const actionMap: Record<string, string> = {
    create: 'created',
    update: 'updated',
    delete: 'deleted',
    resend_ticket: 'resent ticket for',
    register: 'registered',
  }
  const verb = actionMap[log.action?.toLowerCase()] ?? log.action ?? 'performed action on'

  if (log.entity === 'event' && log.details?.name) {
    return `Event "${log.details.name}" ${verb}`
  }
  if (log.entity === 'order' && log.details?.orderNumber) {
    const extra = log.details.guest ? ` (${log.details.guest})` : ''
    return `Order ${log.details.orderNumber}${extra} ${verb}`
  }
  return `${log.entity ? log.entity.charAt(0).toUpperCase() + log.entity.slice(1) : 'Item'} ${verb}`
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
}

function SortIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
      <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AdminRow({ admin, isCurrentUser, openMenuId, setOpenMenuId, onResend }: {
  admin: AdminUser
  isCurrentUser: boolean
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onResend: (id: string) => void
}) {
  const menuOpen = openMenuId === admin.id
  const isPending = admin.status?.toLowerCase() === 'pending'
  // Show "Resend invite" only for pending admins when a status is returned;
  // if the backend doesn't return a status, show it for everyone (fallback).
  const canResend = admin.status ? isPending : true
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-medium text-gray-900">{admin.firstName} {admin.lastName}</p>
        <p className="text-[11px] text-gray-400">{admin.email}</p>
      </td>
      <td className="px-5 py-3.5 text-[13px] text-gray-500">{formatTimestamp(admin.createdAt ?? '')}</td>
      <td className="px-5 py-3.5">
        {isCurrentUser ? (
          <span className="px-3 py-1 border border-gray-200 rounded-lg text-[12px] text-gray-600 bg-white">
            This is you
          </span>
        ) : isPending ? (
          <span className="px-3 py-1 rounded-lg text-[12px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
            Pending
          </span>
        ) : (
          <span className="px-3 py-1 border border-gray-200 rounded-lg text-[12px] text-gray-600 bg-white">
            {capitalize(admin.role)}
          </span>
        )}
      </td>
      <td className="px-3 py-3.5 relative w-10">
        {!isCurrentUser && (
          <>
            <button onClick={() => setOpenMenuId(menuOpen ? null : admin.id)}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400">
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-4 bottom-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[155px]">
                <button onClick={() => { setOpenMenuId(null); toast('Coming soon') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  View details
                </button>
                {canResend && (
                  <button onClick={() => { setOpenMenuId(null); onResend(admin.id) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Resend invite
                  </button>
                )}
                <button
                  disabled
                  title="Coming soon"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-300 cursor-not-allowed whitespace-nowrap">
                  Remove user
                </button>
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [logPage, setLogPage] = useState(1)
  const [logTotalPages, setLogTotalPages] = useState(1)
  const [logLoading, setLogLoading] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  const fetchAdmins = async () => {
    setAdminsLoading(true)
    try {
      const list = await getAdmins()
      setAdmins(list)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setAdminsLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  useEffect(() => {
    if (activeTab !== 'activity') return
    async function fetchLogs() {
      setLogLoading(true)
      try {
        const result = await getActivityLog({ page: logPage, limit: 10 })
        setLogs(result.logs)
        setLogTotalPages(result.pagination.pages || 1)
      } catch {
        toast.error('Failed to load activity log')
      } finally {
        setLogLoading(false)
      }
    }
    fetchLogs()
  }, [activeTab, logPage])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleResend = async (id: string) => {
    try {
      await resendInvite(id)
      toast.success('Invite resent')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to resend invite'
      toast.error(message)
    }
  }

  const filteredAdmins = admins.filter((u) =>
    !search ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLogs = logs.filter((l) =>
    !search ||
    getPerformedBy(l, admins).toLowerCase().includes(search.toLowerCase()) ||
    formatActivity(l).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Users</h1>
        <button onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors whitespace-nowrap">
          <UserPlus size={15} />Add admin
        </button>
      </div>

      <div ref={tableRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {(['users', 'activity'] as const).map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearch('') }}
                className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab === 'users' ? 'Users' : 'Activity Log'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all" />
          </div>
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Added', 'Role', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500">
                      {h && <span className="flex items-center gap-1">{h}{h !== '' && <SortIcon />}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5"><Skeleton height={14} /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[13px] text-gray-400">
                      {search ? 'No users match your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <AdminRow key={admin.id} admin={admin}
                      isCurrentUser={admin.email === currentUser?.email}
                      openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
                      onResend={handleResend} />
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100">
              <button onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={14} />Add admin
              </button>
            </div>
          </>
        )}

        {/* ── Activity Log Tab ── */}
        {activeTab === 'activity' && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Performed by', 'Entity', 'Action', 'Description', 'Timestamp'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500">
                      <span className="flex items-center gap-1">{h}<SortIcon /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5"><Skeleton width={120} height={14} /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[13px] text-gray-400">No activity found</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">
                        {getPerformedBy(log, admins)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 capitalize">
                          {log.entity ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
                          log.action?.toLowerCase() === 'create' ? 'bg-green-50 text-green-600 border-green-100'
                          : log.action?.toLowerCase() === 'delete' ? 'bg-red-50 text-red-500 border-red-100'
                          : log.action?.toLowerCase() === 'update' ? 'bg-orange-50 text-orange-600 border-orange-100'
                          : log.action?.toLowerCase() === 'resend_ticket' ? 'bg-purple-50 text-purple-600 border-purple-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {log.action?.replace('_', ' ') ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600 max-w-[280px] truncate">
                        {formatActivity(log)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-[12px] text-gray-500">Page {logPage} of {logTotalPages}</span>
              <div className="flex items-center gap-2">
                <button disabled={logPage === 1 || logLoading} onClick={() => setLogPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  Previous
                </button>
                <button disabled={logPage === logTotalPages || logLoading} onClick={() => setLogPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showAddUser && (
        <InviteAdminModal onClose={() => { setShowAddUser(false); fetchAdmins() }} />
      )}
    </div>
  )
}