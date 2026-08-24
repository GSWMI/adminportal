import api from '../lib/axios'

export interface Contributor {
  name: string
  email: string
  phone: string
}

export interface SponsorshipCategoryDetails {
  meal?: { numberOfPersons: number; amount: number }
  transport?: { numberOfPersons: number; amount: number }
  accommodation?: { numberOfPersons: number; amount: number; identifier: string }[]
}

export interface Sponsorship {
  id: string
  eventId: string
  sponsor: Contributor
  categoryDetails: SponsorshipCategoryDetails
  amount: number
  platformFee: number
  totalAmount: number
  paymentStatus: string
  referenceNumber: string
  createdAt: string
  paidAt?: string
}

export interface SponsorshipTicket {
  id: string
  sponsorshipId: string
  eventId: string
  referenceNumber: string
  type: string // 'meal' | 'transport' | 'accommodation'
  code: string
  qrImage?: string
}

export interface Donation {
  id: string
  eventId: string
  sponsor: Contributor
  isAnonymous: boolean
  amount: number
  platformFee: number
  totalAmount: number
  paymentStatus: string
  referenceNumber: string
  createdAt: string
  paidAt?: string
}

// ── Sponsorships ────────────────────────────────────────────────────────────────

// Omit eventId to fetch across all events (e.g. the "All events" view).
export async function getSponsorships(eventId?: string): Promise<Sponsorship[]> {
  const params = new URLSearchParams({ limit: '100' })
  if (eventId) params.set('eventId', eventId)
  const { data } = await api.get(`/sponsorships?${params.toString()}`)
  const list = data?.data?.sponsorships ?? data?.data ?? data?.sponsorships ?? []
  const arr: Sponsorship[] = Array.isArray(list) ? list : []
  // The list endpoint may ignore eventId; filter client-side when one is given.
  return eventId ? arr.filter((s) => s.eventId === eventId) : arr
}

export async function getSponsorshipById(id: string): Promise<Sponsorship> {
  const { data } = await api.get(`/sponsorships/${id}`)
  return data?.data?.sponsorship ?? data?.data ?? data?.sponsorship ?? data
}

export async function getSponsorshipTickets(eventId: string): Promise<SponsorshipTicket[]> {
  const { data } = await api.get(`/sponsorships/tickets?eventId=${eventId}`)
  const list = data?.data?.tickets ?? data?.tickets ?? []
  return Array.isArray(list) ? list : []
}

export async function downloadSponsorshipTicket(id: string, reference?: string): Promise<void> {
  const res = await api.get(`/sponsorships/tickets/${id}/download`, { responseType: 'blob' })
  const contentType = String(res.headers?.['content-type'] ?? '')
  const ext = contentType.includes('pdf') ? 'pdf' : contentType.includes('image') ? 'png' : 'pdf'
  const url = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `sponsorship-ticket-${reference ?? id}.${ext}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Donations ───────────────────────────────────────────────────────────────────

// Omit eventId to fetch across all events (e.g. the "All events" view).
export async function getDonations(eventId?: string): Promise<Donation[]> {
  const params = new URLSearchParams({ limit: '100' })
  if (eventId) params.set('eventId', eventId)
  const { data } = await api.get(`/donations/?${params.toString()}`)
  const list = data?.data?.donations ?? data?.donations ?? []
  const arr: Donation[] = Array.isArray(list) ? list : []
  return eventId ? arr.filter((d) => d.eventId === eventId) : arr
}

export async function downloadDonationReceipt(id: string, reference?: string): Promise<void> {
  const res = await api.get(`/donations/${id}/download`, { responseType: 'blob' })
  const contentType = String(res.headers?.['content-type'] ?? '')
  const ext = contentType.includes('pdf') ? 'pdf' : contentType.includes('image') ? 'png' : 'pdf'
  const url = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `donation-receipt-${reference ?? id}.${ext}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function getDonationById(id: string): Promise<Donation> {
  const { data } = await api.get(`/donations/${id}`)
  return data?.data?.donation ?? data?.data ?? data?.donation ?? data
}
