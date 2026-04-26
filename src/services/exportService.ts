import api from '../lib/axios'

// ── Helper ────────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

// ── Attendees ─────────────────────────────────────────────────────────────────

export async function exportAttendeesCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/attendees${params}`, { responseType: 'blob' })
  triggerDownload(response.data, `attendees-${dateStamp()}.csv`)
}

// ── Meal tickets ──────────────────────────────────────────────────────────────

export async function exportMealTicketsCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/meal-tickets${params}`, { responseType: 'blob' })
  triggerDownload(response.data, `meal-tickets-${dateStamp()}.csv`)
}

// ── Transport tickets ─────────────────────────────────────────────────────────

export async function exportTransportTicketsCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/transport-tickets${params}`, { responseType: 'blob' })
  triggerDownload(response.data, `transport-tickets-${dateStamp()}.csv`)
}

// ── Accommodation tickets ─────────────────────────────────────────────────────

export async function exportAccommodationTicketsCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/accommodation-tickets${params}`, { responseType: 'blob' })
  triggerDownload(response.data, `accommodation-tickets-${dateStamp()}.csv`)
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function exportOrdersCsv(params?: { eventId?: string; status?: string }): Promise<void> {
  const query = new URLSearchParams()
  if (params?.eventId) query.set('eventId', params.eventId)
  if (params?.status) query.set('status', params.status)
  const queryStr = query.toString() ? `?${query.toString()}` : ''
  const response = await api.get(`/orders/export/orders${queryStr}`, { responseType: 'blob' })
  triggerDownload(response.data, `orders-${dateStamp()}.csv`)
}