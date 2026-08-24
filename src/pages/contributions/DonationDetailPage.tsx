import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { getDonationById, downloadDonationReceipt } from '../../services/contributionService'
import { qk } from '../../lib/queryKeys'
import { formatDate, money } from './format'
import { PaymentStatusPill, Card, Row } from './parts'

export default function DonationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)

  const donationQuery = useQuery({
    queryKey: qk.donation(id ?? ''),
    queryFn: () => getDonationById(id!),
    enabled: !!id,
  })
  const donation = donationQuery.data ?? null
  const loading = donationQuery.isLoading

  const anon = donation?.isAnonymous

  const handleDownloadReceipt = async () => {
    if (!donation) return
    setDownloading(true)
    try {
      await downloadDonationReceipt(donation.id, donation.referenceNumber)
    } catch {
      toast.error('Failed to download receipt')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-[820px]">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/contributions')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">Donation</h1>
          {donation && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-mono">{donation.referenceNumber}</span>
          )}
        </div>
        {donation && (
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white rounded-lg text-[13px] font-medium hover:bg-[#3451c7] transition-colors disabled:opacity-60"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download receipt
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton count={3} height={60} className="mb-3" />
      ) : !donation ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-[14px] text-gray-400">
          Donation not found
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Card title="Donor">
            {anon ? (
              <p className="text-[13px] text-gray-500 italic py-2">
                Anonymous — the donor chose to hide their details.
              </p>
            ) : (
              <>
                <Row label="Name" value={donation.sponsor?.name} />
                <Row label="Email" value={donation.sponsor?.email} />
                <Row label="Phone" value={donation.sponsor?.phone} />
              </>
            )}
          </Card>

          <Card title="Payment">
            <Row label="Amount" value={money(donation.amount)} />
            <Row label="Platform fee" value={money(donation.platformFee)} />
            <Row label="Total amount" value={money(donation.totalAmount)} strong />
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-[13px] font-medium text-gray-500">Status</span>
              <PaymentStatusPill status={donation.paymentStatus} />
            </div>
            <Row label="Payment reference" value={donation.referenceNumber} mono />
            <Row label="Created" value={formatDate(donation.createdAt)} />
            {donation.paidAt && <Row label="Paid" value={formatDate(donation.paidAt)} />}
          </Card>
        </div>
      )}
    </div>
  )
}
