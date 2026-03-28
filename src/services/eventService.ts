import api from '../lib/axios'

export interface MealOptionItem {
  name: string
  price: number
  limit?: number
}

export interface MealOptionGroup {
  day: number
  slot: string
  options: MealOptionItem[]
}

export interface CustomQuestion {
  question: string
  required: boolean
}

export interface EventData {
  _id: string
  name: string
  description: string
  startDate: string
  endDate: string
  totalDays: number
  location?: string
  bannerUrl?: string
  slug?: string
  mealOptions?: MealOptionGroup[]
  customQuestions?: CustomQuestion[]
  consentText?: string
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
  if (Array.isArray(data?.data?.events)) return data.data.events
  if (Array.isArray(data?.events)) return data.events
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  if (data?._id) return [data]
  return []
}

export async function getEventById(id: string): Promise<EventData> {
  const { data } = await api.get(`/events/${id}`)
  return data?.data?.event ?? data?.data ?? data?.event ?? data
}

export async function getEventBySlug(slug: string): Promise<EventData> {
  const { data } = await api.get(`/events/s/${slug}`)
  return data?.data?.event ?? data?.data ?? data?.event ?? data
}

export async function createEvent(payload: object): Promise<EventData> {
  const { data } = await api.post('/events/', payload)
  return data?.data?.event ?? data?.data ?? data?.event ?? data
}

export async function updateEvent(id: string, payload: object): Promise<EventData> {
  const { data } = await api.put(`/events/${id}`, payload)
  return data?.data?.event ?? data?.data ?? data?.event ?? data
}

export async function updateRegistration(
  id: string,
  type: 'meal' | 'accommodation' | 'transport' | 'all',
  open: boolean
): Promise<void> {
  await api.post(`/events/${id}/registration`, { type, open })
}

export async function getDashboardStats(eventId: string): Promise<Record<string, unknown>> {
  const { data } = await api.get(`/events/admin/dashboard?eventId=${eventId}`)
  return data?.data ?? data
}

export async function getActivityLog(params?: {
  entity?: string
  action?: string
  page?: number
  limit?: number
}): Promise<{ logs: ActivityLogItem[]; pagination: { page: number; pages: number; total: number } }> {
  const query = new URLSearchParams()
  if (params?.entity) query.set('entity', params.entity)
  if (params?.action) query.set('action', params.action)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const { data } = await api.get(`/events/admin/activity?${query.toString()}`)
  return {
    logs: data?.data?.logs ?? data?.data ?? data?.logs ?? [],
    pagination: data?.data?.pagination ?? data?.pagination ?? { page: 1, pages: 1, total: 0 },
  }
}

export interface ActivityLogItem {
  _id: string
  entity: string
  action: string
  description?: string
  performedBy?: { firstName: string; lastName: string; email: string }
  createdAt: string
}