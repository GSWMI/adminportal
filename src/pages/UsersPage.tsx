import { useState, useEffect, useRef } from 'react'
import { UserPlus, Search, MoreVertical, Plus } from 'lucide-react'
import AddUserModal from '../components/AddUserModal'
import { toast } from 'sonner'
import { getActivityLog, type ActivityLogItem } from '../services/eventService'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface AdminUser {
  id: string
  fullName: string
  username: string
  lastActive: string
  role: 'This is you' | 'Admin' | 'Subadmin'
}

const mockUsers: AdminUser[] = [
  { id: '1', fullName: 'Lesi Lion', username: 'lesi', lastActive: '16 Jan 2025', role: 'This is you' },
  { id: '2', fullName: 'Zia Zia', username: 'zia', lastActive: '16 Jan 2025', role: 'Admin' },
  { id: '3', fullName: 'Ola Ola', username: 'ola', lastActive: '16 Jan 2025', role: 'Subadmin' },
]

function SortIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
      <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatTimestamp(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function formatActivity(log: ActivityLogItem): string {
  const actionMap: Record<string, string> = {
    create: 'created',
    update: 'updated',
    delete: 'deleted',
    register: 'registered',
    login: 'logged in',
    logout: 'logged out',
  }
  const entityMap: Record<string, string> = {
    event: 'ticket',
    order: 'order',
    user: 'user',
  }
  const action = actionMap[log.action?.toLowerCase()] ?? log.action ?? 'performed action'
  const entity = entityMap[log.entity?.toLowerCase()] ?? log.entity ?? 'item'
  return log.description ?? `New ${entity} ${action}`
}

function getPerformedBy(log: ActivityLogItem): string {
  if (log.performedBy?.firstName) {
    return `${log.performedBy.firstName} ${log.performedBy.lastName}`
  }
  return log.performedBy?.email ?? '—'
}

function UserRow({ user, openMenuId, setOpenMenuId, onRemove }: {
  user: AdminUser
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onRemove: (id: string) => void
}) {
  const isYou = user.role === 'This is you'
  const menuOpen = openMenuId === user.id

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">{user.fullName}</td>
      <td className="px-5 py-3.5 text-[13px] text-gray-500">{user.lastActive}</td>
      <td className="px-5 py-3.5">
        <span className="px-3 py-1 border border-gray-200 rounded-lg text-[12px] text-gray-600 bg-white">
          {user.role}
        </span>
      </td>
      <td className="px-3 py-3.5 relative w-10">
        {!isYou && (
          <>
            <button
              onClick={() => setOpenMenuId(menuOpen ? null : user.id)}
              className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-4 bottom-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[155px]">
                <button
                  onClick={() => { setOpenMenuId(null); toast('Coming soon') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  View details
                </button>
                <button
                  onClick={() => { setOpenMenuId(null); onRemove(user.id) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
                >
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
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Users pagination
  const [userPage, setUserPage] = useState(1)
  const USER_TOTAL_PAGES = 1

  // Activity log state
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [logPage, setLogPage] = useState(1)
  const [logTotalPages, setLogTotalPages] = useState(1)
  const [logLoading, setLogLoading] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)

  // Fetch activity log when tab is active or page changes
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

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRemove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User removed')
  }

  const filteredUsers = users.filter((u) =>
    !search || u.fullName.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLogs = logs.filter((l) =>
    !search ||
    getPerformedBy(l).toLowerCase().includes(search.toLowerCase()) ||
    formatActivity(l).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-[1000px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Users</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors whitespace-nowrap"
        >
          <UserPlus size={15} />
          Add user
        </button>
      </div>

      <div ref={tableRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {(['users', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch('') }}
                className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'users' ? 'Users' : 'Activity Log'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all"
            />
          </div>
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Last active', 'Role', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500">
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
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onRemove={handleRemove}
                  />
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
                Add user
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
                  {['User', 'Activity', 'Timestamp'].map((h) => (
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
                      <td className="px-5 py-3.5"><Skeleton width={120} height={14} /></td>
                      <td className="px-5 py-3.5"><Skeleton width={180} height={14} /></td>
                      <td className="px-5 py-3.5"><Skeleton width={150} height={14} /></td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-[13px] text-gray-400">
                      No activity found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">
                        {getPerformedBy(log)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">
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
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          {activeTab === 'users' ? (
            <>
              <span className="text-[12px] text-gray-500">Page {userPage} of {USER_TOTAL_PAGES}</span>
              <div className="flex items-center gap-2">
                <button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  Previous
                </button>
                <button disabled={userPage === USER_TOTAL_PAGES} onClick={() => setUserPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  )
}