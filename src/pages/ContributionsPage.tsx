import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getAllEvents, type EventData } from '../services/eventService'
import {
  getSponsorships, getDonations,
  type Sponsorship, type Donation,
} from '../services/contributionService'
import { formatDate, money, categorySummary } from './contributions/format'
import { PaymentStatusPill } from './contributions/parts'

export default function ContributionsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventData[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [activeTab, setActiveTab] = useState<'sponsorships' | 'donations'>('sponsorships')
  const [search, setSearch] = useState('')

  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllEvents()
      .then((evs) => {
        setEvents(evs)
        if (evs.length > 0) setSelectedEvent((prev) => prev || evs[0]._id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      const [spRes, dnRes] = await Promise.allSettled([
        getSponsorships(selectedEvent),
        getDonations(selectedEvent),
      ])
      if (cancelled) return
      setSponsorships(spRes.status === 'fulfilled' ? spRes.value : [])
      setDonations(dnRes.status === 'fulfilled' ? dnRes.value : [])
      if (spRes.status === 'rejected' && dnRes.status === 'rejected') {
        toast.error('Failed to load contributions')
      }
      setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [selectedEvent])

  const filteredSponsorships = sponsorships.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.sponsor?.name?.toLowerCase().includes(q) ||
      s.sponsor?.email?.toLowerCase().includes(q) ||
      s.referenceNumber?.toLowerCase().includes(q)
    )
  })

  const filteredDonations = donations.filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    const name = d.isAnonymous ? 'anonymous' : (d.sponsor?.name ?? '')
    return name.toLowerCase().includes(q) || d.referenceNumber?.toLowerCase().includes(q)
  })

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Sponsorships &amp; Donations</h1>
        <select
          value={selectedEvent}
          onChange={(e) => { setSelectedEvent(e.target.value); setSearch('') }}
          className="py-2 px-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#3b5bdb] max-w-[260px]"
        >
          {events.length === 0 && <option value="">No events</option>}
          {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {(['sponsorships', 'donations'] as const).map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearch('') }}
                className={`px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] w-52 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-4 flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={22} />)}
          </div>
        ) : activeTab === 'sponsorships' ? (
          <SponsorshipsTable rows={filteredSponsorships} onOpen={(id) => navigate(`/contributions/sponsorship/${id}`)} />
        ) : (
          <DonationsTable rows={filteredDonations} onOpen={(id) => navigate(`/contributions/donation/${id}`)} />
        )}
      </div>
    </div>
  )
}

function SponsorshipsTable({ rows, onOpen }: { rows: Sponsorship[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return <div className="py-12 text-center text-[13px] text-gray-400">No sponsorships found</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['Sponsor', 'Categories', 'Amount', 'Status', 'Reference', 'Date', ''].map((h, i) => (
            <th key={i} className="text-left text-[12px] text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <tr key={s.id} onClick={() => onOpen(s.id)}
            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer">
            <td className="px-5 py-3.5">
              <p className="text-[13px] font-medium text-gray-900">{s.sponsor?.name ?? '—'}</p>
              <p className="text-[11px] text-gray-400">{s.sponsor?.email ?? ''}</p>
            </td>
            <td className="px-5 py-3.5 text-[12px] text-gray-600">{categorySummary(s.categoryDetails)}</td>
            <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{money(s.totalAmount)}</td>
            <td className="px-5 py-3.5"><PaymentStatusPill status={s.paymentStatus} /></td>
            <td className="px-5 py-3.5 text-[12px] text-gray-500 font-mono">{s.referenceNumber}</td>
            <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(s.createdAt)}</td>
            <td className="px-3 py-3.5 text-gray-300"><ChevronRight size={15} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DonationsTable({ rows, onOpen }: { rows: Donation[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return <div className="py-12 text-center text-[13px] text-gray-400">No donations found</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['Donor', 'Email', 'Amount', 'Status', 'Reference', 'Date', ''].map((h, i) => (
            <th key={i} className="text-left text-[12px] text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
          <tr key={d.id} onClick={() => onOpen(d.id)}
            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer">
            <td className="px-5 py-3.5">
              {d.isAnonymous
                ? <span className="text-[13px] font-medium text-gray-500 italic">Anonymous</span>
                : <span className="text-[13px] font-medium text-gray-900">{d.sponsor?.name ?? '—'}</span>}
            </td>
            <td className="px-5 py-3.5 text-[12px] text-gray-500">{d.isAnonymous ? '—' : (d.sponsor?.email ?? '—')}</td>
            <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{money(d.totalAmount)}</td>
            <td className="px-5 py-3.5"><PaymentStatusPill status={d.paymentStatus} /></td>
            <td className="px-5 py-3.5 text-[12px] text-gray-500 font-mono">{d.referenceNumber}</td>
            <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
            <td className="px-3 py-3.5 text-gray-300"><ChevronRight size={15} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
