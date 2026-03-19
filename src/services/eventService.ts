import api from '../lib/axios'

export interface EventData {
  _id: string
  name: string
  description: string
  startDate: string
  endDate: string
  totalDays: number
  location?: string
  bannerUrl?: string
  registrationOpen: boolean
  mealRegistrationOpen: boolean
  accommodationRegistrationOpen: boolean
  transportRegistrationOpen: boolean
  mealPrices?: {
    breakfast: number
    lunch: number
    dinner: number
  }
  createdAt: string
  updatedAt: string
}

export async function getAllEvents(): Promise<EventData[]> {
  const { data } = await api.get('/events/')
  // API returns a single event object OR an array — normalise to array
  if (Array.isArray(data)) return data
  if (Array.isArray(data.events)) return data.events
  if (Array.isArray(data.data)) return data.data
  // Single event object returned
  if (data._id) return [data]
  return []
}

export async function getEventById(id: string): Promise<EventData> {
  const { data } = await api.get(`/events/${id}`)
  return data.event ?? data.data ?? data
}

export async function createEvent(payload: Partial<EventData>): Promise<EventData> {
  const { data } = await api.post('/events/', payload)
  return data.event ?? data.data ?? data
}

export async function updateEvent(id: string, payload: Partial<EventData>): Promise<EventData> {
  const { data } = await api.put(`/events/${id}`, payload)
  return data.event ?? data.data ?? data
}

export async function updateRegistration(
  id: string,
  type: 'meal' | 'accommodation' | 'transport' | 'all',
  open: boolean
): Promise<void> {
  await api.post(`/events/${id}/registration`, { type, open })
}