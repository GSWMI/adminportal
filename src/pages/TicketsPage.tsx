import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Calendar, MapPin, MoreVertical, Plus } from 'lucide-react'
import { mockTickets, type TicketEvent } from '../data/mockTickets'
import { toast } from 'sonner'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TYPE_BUTTONS = [
  { key: 'attendees', label: 'Attendees', path: 'attendees' },
  { key: 'meal', label: 'Meal tickets', path: 'meal-tickets' },
  { key: 'accommodation', label: 'Accommodation tickets', path: 'accommodation-tickets' },
  { key: 'transport', label: 'Transport tickets', path: 'transport-tickets' },
]

function TicketCard({ ticket }: { ticket: TicketEvent }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (action === 'view') navigate(`/tickets/${ticket.id}`)
    if (action === 'archive') toast.success('Event archived')
    if (action === 'close') toast.success('Registration closed')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
      <div className="flex gap-5">
        <div className="w-[160px] h-[120px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {ticket.bannerPreview
            ? <img src={ticket.bannerPreview} alt={ticket.programName} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-purple-400 to-orange-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[16px] font-semibold text-gray-900">{ticket.programName}</h3>
            <div className="relative flex-shrink-0">
              <button onClick={() => setMenuOpen((v) => !v)} className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400">
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[180px]">
                  <button onClick={() => handleMenuAction('view')} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50">View details</button>
                  <button onClick={() => handleMenuAction('archive')} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50">Archive event</button>
                  <button onClick={() => handleMenuAction('close')} className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50">Close registration</button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[13px] text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Calendar size={13} className="text-gray-400" />
              {formatDate(ticket.startDate)} — {formatDate(ticket.endDate)}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#3b5bdb]">
              <MapPin size={13} />
              {ticket.location}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_BUTTONS.map(({ key, label, path }) => (
              <button
                key={key}
                onClick={() => navigate(`/tickets/${ticket.id}/${path}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#3b5bdb]/40 text-[#3b5bdb] rounded-lg text-[12px] font-medium hover:bg-blue-50 transition-colors"
              >
                {label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabBar({ active, onChange }: { active: string; onChange: (v: 'upcoming' | 'past') => void }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
      {(['upcoming', 'past'] as const).map((tab) => (
        <button key={tab} onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${active === tab ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
        <Ticket size={40} className="text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] text-gray-500">No tickets created yet</p>
      <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#3b5bdb] text-white rounded-lg text-[14px] font-medium hover:bg-[#3451c7] transition-colors">
        <Ticket size={15} />
        Add ticket
      </button>
    </div>
  )
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const filtered = mockTickets.filter((t) => t.status === activeTab)

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-semibold text-gray-900">Tickets</h1>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>
        {mockTickets.length > 0 && (
          <button onClick={() => navigate('/tickets/new')} className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors">
            <Ticket size={15} />
            Add ticket
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={() => navigate('/tickets/new')} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => <TicketCard key={t.id} ticket={t} />)}
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-4 flex items-center justify-center">
            <button onClick={() => navigate('/tickets/new')} className="flex items-center gap-2 text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={15} />
              Add ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )
}