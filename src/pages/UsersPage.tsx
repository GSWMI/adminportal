import { useState, useEffect, useRef } from 'react'
import { UserPlus, Search, MoreVertical, Plus } from 'lucide-react'
import AddUserModal from '../components/AddUserModal'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  fullName: string
  username: string
  lastActive: string
  role: 'This is you' | 'Admin' | 'Subadmin'
}

interface ActivityLog {
  id: string
  user: string
  activity: string
  timestamp: string
}

const mockUsers: AdminUser[] = [
  { id: '1', fullName: 'Lesi Lion', username: 'lesi', lastActive: '16 Jan 2025', role: 'This is you' },
  { id: '2', fullName: 'Zia Zia', username: 'zia', lastActive: '16 Jan 2025', role: 'Admin' },
  { id: '3', fullName: 'Ola Ola', username: 'ola', lastActive: '16 Jan 2025', role: 'Subadmin' },
]

const mockActivityLog: ActivityLog[] = Array.from({ length: 10 }, (_, i) => ({
  id: `log-${i}`,
  user: ['Lesi Lion', 'Lesi Lion', 'Lesi Lion', 'Zia Zia', 'Zia Zia', 'Zia Zia', 'Ola Ola', 'Ola Ola', 'Ola Ola', 'Ola Ola'][i],
  activity: ['New user added', 'New user added', 'New user added', 'New ticket created', 'New ticket created', 'New ticket created', 'New user added', 'New user added', 'New user added', 'New user added'][i],
  timestamp: '16 Jan 2025, 10:30AM',
}))

function SortIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-gray-400">
      <path d="M5 2v6M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
  const [page, setPage] = useState(1)
  const TOTAL_PAGES = activeTab === 'users' ? 1 : 10
  const tableRef = useRef<HTMLDivElement>(null)

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

  const filteredLogs = mockActivityLog.filter((l) =>
    !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.activity.toLowerCase().includes(search.toLowerCase())
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
        {/* Tabs + Search toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {(['users', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); setPage(1) }}
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

        {/* Users tab */}
        {activeTab === 'users' && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Last active', 'Role', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500">
                      {h && (
                        <span className="flex items-center gap-1">
                          {h}
                          {h !== '' && <SortIcon />}
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

            {/* Add user row */}
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

        {/* Activity Log tab */}
        {activeTab === 'activity' && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Activity', 'Timestamp'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      {h}
                      <SortIcon />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">{log.user}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-600">{log.activity}</td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-[12px] text-gray-500">Page {page} of {TOTAL_PAGES}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page === TOTAL_PAGES}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  )
}