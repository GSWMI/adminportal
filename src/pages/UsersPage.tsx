import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import AddUserModal from '../components/AddUserModal'

export default function UsersPage() {
  const [showAddUser, setShowAddUser] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Users</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors"
        >
          <UserPlus size={15} />
          Add user
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-[13px]">
        No users yet.
      </div>

      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}
    </div>
  )
}