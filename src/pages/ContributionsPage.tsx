import { useState, useEffect, useMemo, Fragment } from 'react'
import { Search, Download, Loader2, ChevronRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getAllEvents, type EventData } from '../services/eventService'
import {
  getSponsorships, getSponsorshipTickets, downloadSponsorshipTicket, getDonations,
  type Sponsorship, type SponsorshipTicket, type Donation, type SponsorshipCategoryDetails,
} from '../services/contributionService'

function formatDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function money(n: number) {
  return `₦${(n ?? 0).toLocaleString()}`
}

function categorySummary(cd: SponsorshipCategoryDetails): string {
  const parts: string[] = []
  if (cd?.meal?.numberOfPersons) parts.push(`Meal ×${cd.meal.numberOfPersons}`)
  if (cd?.transport?.numberOfPersons) parts.push(`Transport ×${cd.transport.numberOfPersons}`)
  const acc = (cd?.accommodation ?? []).reduce((s, a) => s + (a.numberOfPersons || 0), 0)
  if (acc) parts.push(`Accommodation ×${acc}`)
  return parts.join(' · ') || '—'
}

function PaymentStatusPill({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const cls =
    s === 'success' || s === 'paid' ? 'bg-green-50 text-green-600 border-green-200'
    : s === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200'
    : s === 'failed' || s === 'cancelled' ? 'bg-red-50 text-red-500 border-red-200'
    : 'bg-gray-50 text-gray-500 border-gray-200'
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>{label}</span>
}

export default function ContributionsPage() {
  const [events, setEvents] = useState<EventData[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [activeTab, setActiveTab] = useState<'sponsorships' | 'donations'>('sponsorships')
  const [search, setSearch] = useState('')

  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [tickets, setTickets] = useState<SponsorshipTicket[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Load events for the filter; default to the most recent one
  useEffect(() => {
    getAllEvents()
      .then((evs) => {
        setEvents(evs)
        if (evs.length > 0) setSelectedEvent((prev) => prev || evs[0]._id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Load contributions for the selected event
  useEffect(() => {
    if (!selectedEvent) return
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      const [spRes, tkRes, dnRes] = await Promise.allSettled([
        getSponsorships(selectedEvent),
        getSponsorshipTickets(selectedEvent),
        getDonations(selectedEvent),
      ])
      if (cancelled) return
      setSponsorships(spRes.status === 'fulfilled' ? spRes.value : [])
      setTickets(tkRes.status === 'fulfilled' ? tkRes.value : [])
      setDonations(dnRes.status === 'fulfilled' ? dnRes.value : [])
      if (spRes.status === 'rejected' && dnRes.status === 'rejected') {
        toast.error('Failed to load contributions')
      }
      setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [selectedEvent])

  const ticketsBySponsorship = useMemo(() => {
    const map: Record<string, SponsorshipTicket[]> = {}
    for (const t of tickets) {
      (map[t.sponsorshipId] ??= []).push(t)
    }
    return map
  }, [tickets])

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

  const handleDownloadTicket = async (t: SponsorshipTicket) => {
    setDownloadingId(t.id)
    try {
      await downloadSponsorshipTicket(t.id, t.referenceNumber)
    } catch {
      toast.error('Failed to download ticket')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Sponsorships &amp; Donations</h1>
        <select
          value={selectedEvent}
          onChange={(e) => { setSelectedEvent(e.target.value); setExpandedId(null); setSearch('') }}
          className="py-2 px-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:border-[#3b5bdb] max-w-[260px]"
        >
          {events.length === 0 && <option value="">No events</option>}
          {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs + search */}
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
          <SponsorshipsTable
            rows={filteredSponsorships}
            ticketsBySponsorship={ticketsBySponsorship}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            downloadingId={downloadingId}
            onDownload={handleDownloadTicket}
          />
        ) : (
          <DonationsTable rows={filteredDonations} />
        )}
      </div>
    </div>
  )
}

function SponsorshipsTable({ rows, ticketsBySponsorship, expandedId, setExpandedId, downloadingId, onDownload }: {
  rows: Sponsorship[]
  ticketsBySponsorship: Record<string, SponsorshipTicket[]>
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  downloadingId: string | null
  onDownload: (t: SponsorshipTicket) => void
}) {
  if (rows.length === 0) {
    return <div className="py-12 text-center text-[13px] text-gray-400">No sponsorships found</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['', 'Sponsor', 'Categories', 'Amount', 'Status', 'Reference', 'Date'].map((h, i) => (
            <th key={i} className="text-left text-[12px] text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => {
          const rowTickets = ticketsBySponsorship[s.id] ?? []
          const open = expandedId === s.id
          return (
            <Fragment key={s.id}>
              <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="pl-5 pr-1 py-3.5 w-8">
                  {rowTickets.length > 0 && (
                    <button onClick={() => setExpandedId(open ? null : s.id)} className="text-gray-400 hover:text-gray-600">
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-[13px] font-medium text-gray-900">{s.sponsor?.name ?? '—'}</p>
                  <p className="text-[11px] text-gray-400">{s.sponsor?.email ?? ''}</p>
                </td>
                <td className="px-5 py-3.5 text-[12px] text-gray-600">{categorySummary(s.categoryDetails)}</td>
                <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{money(s.totalAmount)}</td>
                <td className="px-5 py-3.5"><PaymentStatusPill status={s.paymentStatus} /></td>
                <td className="px-5 py-3.5 text-[12px] text-gray-500 font-mono">{s.referenceNumber}</td>
                <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(s.createdAt)}</td>
              </tr>
              {open && rowTickets.length > 0 && (
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <td colSpan={7} className="px-5 py-4">
                    <p className="text-[12px] font-semibold text-gray-700 mb-3">Sponsorship tickets ({rowTickets.length})</p>
                    <div className="flex flex-wrap gap-3">
                      {rowTickets.map((t) => (
                        <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-3 w-[180px] flex flex-col items-center gap-2">
                          {t.qrImage
                            ? <img src={t.qrImage} alt={t.code} className="w-24 h-24 object-contain" />
                            : <div className="w-24 h-24 bg-gray-50 rounded flex items-center justify-center text-[10px] text-gray-300">No QR</div>}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 capitalize">{t.type}</span>
                          <p className="text-[11px] text-gray-500 font-mono truncate w-full text-center">{t.code}</p>
                          <button
                            onClick={() => onDownload(t)}
                            disabled={downloadingId === t.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#3b5bdb] border border-[#3b5bdb]/30 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
                          >
                            {downloadingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

function DonationsTable({ rows }: { rows: Donation[] }) {
  if (rows.length === 0) {
    return <div className="py-12 text-center text-[13px] text-gray-400">No donations found</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {['Donor', 'Email', 'Amount', 'Status', 'Reference', 'Date'].map((h, i) => (
            <th key={i} className="text-left text-[12px] text-gray-500 font-medium px-5 py-3 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
          <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
            <td className="px-5 py-3.5">
              {d.isAnonymous ? (
                <span className="text-[13px] font-medium text-gray-500 italic">Anonymous</span>
              ) : (
                <span className="text-[13px] font-medium text-gray-900">{d.sponsor?.name ?? '—'}</span>
              )}
            </td>
            <td className="px-5 py-3.5 text-[12px] text-gray-500">{d.isAnonymous ? '—' : (d.sponsor?.email ?? '—')}</td>
            <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{money(d.totalAmount)}</td>
            <td className="px-5 py-3.5"><PaymentStatusPill status={d.paymentStatus} /></td>
            <td className="px-5 py-3.5 text-[12px] text-gray-500 font-mono">{d.referenceNumber}</td>
            <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
