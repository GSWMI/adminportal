import api from '../lib/axios'

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

// Attendees — eventId optional
export async function exportAttendeesCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/attendees${params}`, { responseType: 'blob' })
  triggerDownload(response.data, `attendees-${dateStamp()}.csv`)
}

// Meal tickets — eventId required
export async function exportMealTicketsCsv(eventId?: string): Promise<void> {
  if (!eventId) throw new Error('eventId is required for meal ticket export')
  const response = await api.get(`/orders/export/meal-tickets?eventId=${eventId}`, { responseType: 'blob' })
  triggerDownload(response.data, `meal-tickets-${dateStamp()}.csv`)
}

// Transport tickets — eventId required; optional pickupLocation filter
export async function exportTransportTicketsCsv(eventId?: string, pickupLocation?: string): Promise<void> {
  if (!eventId) throw new Error('eventId is required for transport ticket export')
  const query = new URLSearchParams({ eventId })
  if (pickupLocation) query.set('pickupLocation', pickupLocation)
  const response = await api.get(`/orders/export/transport-tickets?${query.toString()}`, { responseType: 'blob' })
  triggerDownload(response.data, `transport-tickets-${dateStamp()}.csv`)
}

// Accommodation tickets — eventId required
export async function exportAccommodationTicketsCsv(eventId?: string): Promise<void> {
  if (!eventId) throw new Error('eventId is required for accommodation ticket export')
  const response = await api.get(`/orders/export/accommodation-tickets?eventId=${eventId}`, { responseType: 'blob' })
  triggerDownload(response.data, `accommodation-tickets-${dateStamp()}.csv`)
}

// Orders — eventId optional per Postman v8
export async function exportOrdersCsv(params?: { eventId?: string; status?: string }): Promise<void> {
  const query = new URLSearchParams()
  if (params?.eventId) query.set('eventId', params.eventId)
  if (params?.status) query.set('status', params.status)
  const queryStr = query.toString() ? `?${query.toString()}` : ''
  const response = await api.get(`/orders/export/orders${queryStr}`, { responseType: 'blob' })
  triggerDownload(response.data, `orders-${dateStamp()}.csv`)
}