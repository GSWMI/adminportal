import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getEventAccommodations, type AccommodationData } from '../../services/eventService'
import {
  getSponsorshipById, getSponsorshipTickets, downloadSponsorshipTicket,
  type Sponsorship, type SponsorshipTicket,
} from '../../services/contributionService'
import { formatDate, money } from './format'
import { PaymentStatusPill, Card, Row } from './parts'

export default function SponsorshipDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null)
  const [tickets, setTickets] = useState<SponsorshipTicket[]>([])
  const [accNames, setAccNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      try {
        const s = await getSponsorshipById(id!)
        if (cancelled) return
        setSponsorship(s)
        const [tks, accs] = await Promise.all([
          getSponsorshipTickets(s.eventId).catch(() => [] as SponsorshipTicket[]),
          getEventAccommodations(s.eventId).catch(() => [] as AccommodationData[]),
        ])
        if (cancelled) return
        setTickets(tks.filter((t) => t.sponsorshipId === s.id))
        const map: Record<string, string> = {}
        for (const a of accs) map[(a.id ?? a._id) as string] = a.name
        setAccNames(map)
      } catch {
        toast.error('Failed to load sponsorship')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  const handleDownload = async (t: SponsorshipTicket) => {
    setDownloadingId(t.id)
    try { await downloadSponsorshipTicket(t.id, t.referenceNumber) }
    catch { toast.error('Failed to download ticket') }
    finally { setDownloadingId(null) }
  }

  const cd = sponsorship?.categoryDetails

  return (
    <div className="max-w-[820px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/contributions')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">Sponsorship</h1>
        {sponsorship && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-mono">{sponsorship.referenceNumber}</span>
        )}
      </div>

      {loading ? (
        <Skeleton count={5} height={60} className="mb-3" />
      ) : !sponsorship ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-[14px] text-gray-400">
          Sponsorship not found
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Sponsor */}
          <Card title="Sponsor">
            <Row label="Name" value={sponsorship.sponsor?.name} />
            <Row label="Email" value={sponsorship.sponsor?.email} />
            <Row label="Phone" value={sponsorship.sponsor?.phone} />
          </Card>

          {/* Categories */}
          <Card title="Sponsored categories">
            {cd?.meal?.numberOfPersons ? (
              <Row label={`Meal · ${cd.meal.numberOfPersons} person(s)`} value={money(cd.meal.amount)} />
            ) : null}
            {cd?.transport?.numberOfPersons ? (
              <Row label={`Transport · ${cd.transport.numberOfPersons} person(s)`} value={money(cd.transport.amount)} />
            ) : null}
            {(cd?.accommodation ?? []).map((a, i) => (
              <Row
                key={i}
                label={`${accNames[a.identifier] ?? 'Accommodation'} · ${a.numberOfPersons} person(s)`}
                value={money(a.amount)}
              />
            ))}
          </Card>

          {/* Payment */}
          <Card title="Payment">
            <Row label="Amount" value={money(sponsorship.amount)} />
            <Row label="Platform fee" value={money(sponsorship.platformFee)} />
            <Row label="Total amount" value={money(sponsorship.totalAmount)} strong />
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-[13px] font-medium text-gray-500">Status</span>
              <PaymentStatusPill status={sponsorship.paymentStatus} />
            </div>
            <Row label="Payment reference" value={sponsorship.referenceNumber} mono />
            <Row label="Created" value={formatDate(sponsorship.createdAt)} />
            {sponsorship.paidAt && <Row label="Paid" value={formatDate(sponsorship.paidAt)} />}
          </Card>

          {/* Tickets */}
          <Card title={`Sponsorship tickets (${tickets.length})`}>
            {tickets.length === 0 ? (
              <p className="text-[13px] text-gray-400 py-2">No tickets available for this sponsorship yet.</p>
            ) : (
              <div className="flex flex-wrap gap-3 pt-1">
                {tickets.map((t) => (
                  <div key={t.id} className="border border-gray-200 rounded-lg p-3 w-[180px] flex flex-col items-center gap-2">
                    {t.qrImage
                      ? <img src={t.qrImage} alt={t.code} className="w-24 h-24 object-contain" />
                      : <div className="w-24 h-24 bg-gray-50 rounded flex items-center justify-center text-[10px] text-gray-300">No QR</div>}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 capitalize">{t.type}</span>
                    <p className="text-[11px] text-gray-500 font-mono truncate w-full text-center">{t.code}</p>
                    <button
                      onClick={() => handleDownload(t)}
                      disabled={downloadingId === t.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#3b5bdb] border border-[#3b5bdb]/30 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
                    >
                      {downloadingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
