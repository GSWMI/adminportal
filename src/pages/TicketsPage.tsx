import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Ticket, Calendar, MapPin, MoreVertical, Plus, Copy, Check } from 'lucide-react'
import { getAllEvents, updateRegistration, type EventData } from '../services/eventService'
import { qk } from '../lib/queryKeys'
import { richTextToPlain } from '../lib/richText'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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

const PUBLIC_BASE_URL = 'https://gswmi.net'

function TicketCard({ event, openMenuId, setOpenMenuId, onRegistrationToggle }: TicketCardProps) {
  const navigate = useNavigate()
  const menuOpen = openMenuId === event._id
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const eventUrl = `${PUBLIC_BASE_URL}/events/s/${event.slug ?? event._id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = eventUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Guard against missing _id
  if (!event._id) return null

  return (
    <>
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
                      onClick={() => { setOpenMenuId(null); setShowShare(true) }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      Share event link
                    </button>
                    <button
                      onClick={() => { setOpenMenuId(null); toast('Archive coming soon') }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      Archive event
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { setOpenMenuId(null); onRegistrationToggle(event._id, 'all', !event.registrationOpen) }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {event.registrationOpen ? 'Close all registration' : 'Open all registration'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[13px] text-gray-500 mb-3 line-clamp-2">{richTextToPlain(event.description)}</p>

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

      {/* Share modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-6 flex flex-col items-center gap-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] font-semibold text-gray-800">Share event link</p>
            <p className="text-[13px] text-gray-500 text-center -mt-2">{event.name}</p>

            <div className="flex items-center gap-7">
              {[
                {
                  label: 'Gmail',
                  href: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Register for ${event.name}`)}&body=${encodeURIComponent(`Register here: ${eventUrl}`)}`,
                  bg: 'bg-red-50',
                  icon: <svg width="22" height="16" viewBox="0 0 24 20"><path d="M0 4a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z" fill="#fff"/><path d="M2 4l10 7L22 4" stroke="#EA4335" strokeWidth="2" fill="none"/><path d="M2 4l10 7L22 4" fill="#EA4335"/></svg>,
                },
                {
                  label: 'WhatsApp',
                  href: `https://wa.me/?text=${encodeURIComponent(`Register for ${event.name}: ${eventUrl}`)}`,
                  bg: 'bg-green-50',
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                },
                {
                  label: 'Telegram',
                  href: `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Register for ${event.name}`)}`,
                  bg: 'bg-blue-50',
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#229ED9"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.871 13.45l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.279.109z"/></svg>,
                },
              ].map((opt) => (
                <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group">
                  <div className={`w-12 h-12 ${opt.bg} rounded-full border border-gray-100 flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all`}>
                    {opt.icon}
                  </div>
                  <span className="text-[11px] text-gray-500 group-hover:text-gray-700 transition-colors">{opt.label}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <span className="flex-1 text-[12px] text-gray-500 truncate">{eventUrl}</span>
              <button type="button" onClick={handleCopy} className="flex-shrink-0 text-[#1a2e5a] hover:text-blue-700 transition-colors">
                {copied ? <Check size={17} className="text-green-500" /> : <Copy size={17} />}
              </button>
            </div>

            <button onClick={() => setShowShare(false)} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </>
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
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: qk.events(),
    queryFn: getAllEvents,
  })

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
      // Optimistically update the cached events list.
      queryClient.setQueryData<EventData[]>(qk.events(), (prev) => (prev ?? []).map((e) => {
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