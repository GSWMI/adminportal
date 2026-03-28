import api from '../lib/axios'

// Helper to trigger a CSV file download from a blob
function downloadCsv(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportAttendeesCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/attendees${params}`, {
    responseType: 'blob',
  })
  const filename = `attendees${eventId ? `-${eventId}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(response.data, filename)
}

export async function exportOrdersCsv(params?: {
  eventId?: string
  status?: string
}): Promise<void> {
  const query = new URLSearchParams()
  if (params?.eventId) query.set('eventId', params.eventId)
  if (params?.status) query.set('status', params.status)
  const queryStr = query.toString() ? `?${query.toString()}` : ''
  const response = await api.get(`/orders/export/orders${queryStr}`, {
    responseType: 'blob',
  })
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(response.data, filename)
}