import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Calendar, MapPin, MoreVertical, Plus } from 'lucide-react'
import { getAllEvents, updateRegistration, type EventData } from '../services/eventService'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Determine upcoming vs past based on endDate
function getStatus(event: EventData): 'upcoming' | 'past' {
  return new Date(event.endDate) >= new Date() ? 'upcoming' : 'past'
}

const TYPE_BUTTONS = [
  { key: 'attendees', label: 'Attendees', path: 'attendees' },
  { key: 'meal', label: 'Meal tickets', path: 'meal-tickets' },
  { key: 'accommodation', label: 'Accommodation tickets', path: 'accommodation-tickets' },
  { key: 'transport', label: 'Transport tickets', path: 'transport-tickets' },
]

interface TicketCardProps {
  event: EventData
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onRegistrationToggle: (id: string, type: 'meal' | 'accommodation' | 'transport' | 'all', open: boolean) => void
}

function TicketCard({ event, openMenuId, setOpenMenuId, onRegistrationToggle }: TicketCardProps) {
  const navigate = useNavigate()
  const menuOpen = openMenuId === event._id

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex gap-5">
        {/* Banner */}
        <div className="w-[160px] h-[120px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {event.bannerUrl
            ? <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-purple-400 to-orange-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[16px] font-semibold text-gray-900">{event.name}</h3>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setOpenMenuId(menuOpen ? null : event._id)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[185px]">
                  <button
                    onClick={() => { setOpenMenuId(null); navigate(`/tickets/${event._id}`) }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => { setOpenMenuId(null); toast('Archive coming soon') }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                  >
                    Archive event
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <p className="px-4 py-1 text-[11px] text-gray-400 uppercase tracking-wide font-medium">Toggle registration</p>
                  {event.mealRegistrationOpen !== undefined && (
                    <button
                      onClick={() => { setOpenMenuId(null); onRegistrationToggle(event._id, 'meal', !event.mealRegistrationOpen) }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {event.mealRegistrationOpen ? 'Close meal' : 'Open meal'}
                    </button>
                  )}
                  {event.accommodationRegistrationOpen !== undefined && (
                    <button
                      onClick={() => { setOpenMenuId(null); onRegistrationToggle(event._id, 'accommodation', !event.accommodationRegistrationOpen) }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {event.accommodationRegistrationOpen ? 'Close accommodation' : 'Open accommodation'}
                    </button>
                  )}
                  {event.transportRegistrationOpen !== undefined && (
                    <button
                      onClick={() => { setOpenMenuId(null); onRegistrationToggle(event._id, 'transport', !event.transportRegistrationOpen) }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {event.transportRegistrationOpen ? 'Close transport' : 'Open transport'}
                    </button>
                  )}
                  <button
                    onClick={() => { setOpenMenuId(null); onRegistrationToggle(event._id, 'all', !event.registrationOpen) }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                  >
                    {event.registrationOpen ? 'Close all' : 'Open all'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-[13px] text-gray-500 mb-3 line-clamp-2">{event.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Calendar size={13} className="text-gray-400" />
              {formatDate(event.startDate)} — {formatDate(event.endDate)}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#3b5bdb]">
                <MapPin size={13} />
                {event.location}
              </div>
            )}
            {!event.registrationOpen && (
              <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-[11px] font-medium">
                Registration closed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_BUTTONS.map(({ key, label, path }) => (
              <button
                key={key}
                onClick={() => navigate(`/tickets/${event._id}/${path}`)}
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
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getAllEvents()
        setEvents(data)
      } catch {
        toast.error('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRegistrationToggle = async (id: string, type: 'meal' | 'accommodation' | 'transport' | 'all', open: boolean) => {
    try {
      await updateRegistration(id, type, open)
      setEvents((prev) => prev.map((e) => {
        if (e._id !== id) return e
        const updates: Partial<EventData> = {}
        if (type === 'meal' || type === 'all') updates.mealRegistrationOpen = open
        if (type === 'accommodation' || type === 'all') updates.accommodationRegistrationOpen = open
        if (type === 'transport' || type === 'all') updates.transportRegistrationOpen = open
        if (type === 'all') updates.registrationOpen = open
        return { ...e, ...updates }
      }))
      const label = type === 'all' ? 'Registration' : `${type.charAt(0).toUpperCase() + type.slice(1)} registration`
      toast.success(open ? `${label} opened` : `${label} closed`)
    } catch {
      toast.error('Failed to update registration')
    }
  }

  const filtered = events.filter((e) => getStatus(e) === activeTab)

  return (
    <div className="max-w-[1000px]" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-semibold text-gray-900">Tickets</h1>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>
        {!loading && events.length > 0 && (
          <button onClick={() => navigate('/tickets/new')} className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors">
            <Ticket size={15} />
            Add ticket
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex gap-5">
                <Skeleton width={160} height={120} className="rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton height={20} width="60%" className="mb-2" />
                  <Skeleton height={14} count={2} className="mb-3" />
                  <Skeleton height={14} width="40%" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => navigate('/tickets/new')} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((event) => (
            <TicketCard
              key={event._id}
              event={event}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onRegistrationToggle={handleRegistrationToggle}
            />
          ))}
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