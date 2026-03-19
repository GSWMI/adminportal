import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Ticket, CreditCard, Users, ChevronUp, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Tickets', icon: Ticket, to: '/tickets' },
  { label: 'Transactions', icon: CreditCard, to: '/transactions' },
  { label: 'Users', icon: Users, to: '/users' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-[272px] h-screen sticky top-0 bg-[#0d1b2a] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-white text-xl font-bold tracking-wide font-serif italic">╱GSWMI</span>
          <span className="text-white/40 text-[8px] tracking-widest uppercase leading-tight">
            Gbenga Samuel-Wemimo Ministry International
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#1a2e42] rounded-lg px-3 py-2">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/40 flex-shrink-0">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-white/60 text-[13px] placeholder:text-white/40 outline-none w-full"
          />
        </div>
      </div>

      {/* Nav — takes up remaining space */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-hidden">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User profile — always pinned to bottom */}
      <div className="px-3 pb-4 flex-shrink-0 relative">
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#3b5bdb] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[13px] font-semibold">
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-white text-[13px] font-medium truncate">{user?.username}</p>
            <p className="text-white/40 text-[11px] truncate">{user?.email}</p>
          </div>
          <ChevronUp size={14} className={`text-white/40 transition-transform ${showUserMenu ? '' : 'rotate-180'}`} />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#1a2e42] rounded-lg overflow-hidden shadow-xl border border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-red-400 hover:bg-white/5 transition-all"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}