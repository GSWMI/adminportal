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

export interface AccommodationData {
  _id: string
  id?: string // fetch returns `id` rather than `_id`
  name: string
  description: string
  price: number
  capacity: number
  totalCapacity?: number // fetch returns `totalCapacity`; create takes `capacity`
  remainingCapacity?: number // spots left — returned on fetch; use for availability display
  peoplePerRoom?: number
  available: boolean
  amenities: string[]
  eventId: string
}

export interface TransportData {
  _id: string
  name: string
  description: string
  price: number
  available: boolean
  pickupLocation: string
  dropoffLocation: string
  eventId: string
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
  whatsappLink?: string
  sponsorshipUnitPrices?: {
    meal: number
    transport: number
    accommodation: { accommodationId: string; pricePerPerson: number }[]
  }
  registrationOpen: boolean
  mealRegistrationOpen: boolean
  accommodationRegistrationOpen: boolean
  transportRegistrationOpen: boolean
  mealPrices?: { breakfast: number; lunch: number; dinner: number }
  accommodations?: AccommodationData[]
  transport?: TransportData[]
  createdAt: string
  updatedAt: string
}

function normalizeEvent(raw: Record<string, unknown>): EventData {
  return { ...raw, _id: (raw._id ?? raw.id ?? '') as string } as EventData
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<EventData[]> {
  const { data } = await api.get('/events/')
  let raw: unknown[] = []
  if (Array.isArray(data?.data?.events)) raw = data.data.events
  else if (Array.isArray(data?.events)) raw = data.events
  else if (Array.isArray(data?.data)) raw = data.data
  else if (Array.isArray(data)) raw = data
  else if (data?._id || data?.id) raw = [data]
  return raw.map((e) => normalizeEvent(e as Record<string, unknown>))
}

export async function getEventById(id: string): Promise<EventData> {
  const { data } = await api.get(`/events/${id}`)
  const raw = data?.data?.event ?? data?.data ?? data?.event ?? data
  return normalizeEvent(raw)
}

export async function getEventBySlug(slug: string): Promise<EventData> {
  const { data } = await api.get(`/events/s/${slug}`)
  const raw = data?.data?.event ?? data?.data ?? data?.event ?? data
  return normalizeEvent(raw)
}

export async function createEvent(payload: FormData | object): Promise<EventData> {
  const isFormData = payload instanceof FormData
  const { data } = await api.post('/events/', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
  })
  return normalizeEvent(data?.data?.event ?? data?.data ?? data?.event ?? data)
}

export async function updateEvent(id: string, payload: object): Promise<EventData> {
  const { data } = await api.put(`/events/${id}`, payload)
  return normalizeEvent(data?.data?.event ?? data?.data ?? data?.event ?? data)
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`)
}

export async function updateRegistration(
  id: string,
  type: 'meal' | 'accommodation' | 'transport' | 'all',
  open: boolean
): Promise<void> {
  await api.post(`/events/${id}/registration`, { type, open })
}

// ── Accommodation ─────────────────────────────────────────────────────────────

export async function createAccommodation(payload: object): Promise<AccommodationData> {
  const { data } = await api.post('/events/accommodation', payload)
  return data?.data?.accommodation ?? data?.data ?? data?.accommodation ?? data
}

export async function updateAccommodation(id: string, payload: object): Promise<AccommodationData> {
  const { data } = await api.put(`/events/accommodation/${id}`, payload)
  return data?.data?.accommodation ?? data?.data ?? data?.accommodation ?? data
}

export async function getEventAccommodations(eventId: string): Promise<AccommodationData[]> {
  const { data } = await api.get(`/events/${eventId}/accommodations`)
  const inner = data?.data ?? data
  if (Array.isArray(inner)) return inner
  if (Array.isArray(inner?.accommodations)) return inner.accommodations
  return []
}

export async function getAccommodationById(accommodationId: string): Promise<AccommodationData> {
  const { data } = await api.get(`/events/accommodations/${accommodationId}`)
  return data?.data?.accommodation ?? data?.data ?? data?.accommodation ?? data
}

export async function deleteAccommodation(id: string): Promise<void> {
  await api.delete(`/events/accommodation/${id}`)
}

// ── Transport ─────────────────────────────────────────────────────────────────

export async function createTransport(payload: object): Promise<TransportData> {
  const { data } = await api.post('/events/transport', payload)
  return data?.data?.transport ?? data?.data ?? data?.transport ?? data
}

export async function updateTransportById(id: string, payload: object): Promise<TransportData> {
  const { data } = await api.put(`/events/transport/${id}`, payload)
  return data?.data?.transport ?? data?.data ?? data?.transport ?? data
}

export async function getEventTransport(eventId: string): Promise<TransportData[]> {
  const { data } = await api.get(`/events/${eventId}/transports`)
  const inner = data?.data ?? data
  if (Array.isArray(inner)) return inner
  if (Array.isArray(inner?.transport)) return inner.transport
  return []
}

export async function getTransportById(transportId: string): Promise<TransportData> {
  const { data } = await api.get(`/events/transports/${transportId}`)
  return data?.data?.transport ?? data?.data ?? data?.transport ?? data
}

export async function deleteTransport(id: string): Promise<void> {
  await api.delete(`/events/transport/${id}`)
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getDashboardStats(eventId?: string): Promise<Record<string, unknown>> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const { data } = await api.get(`/events/admin/dashboard${params}`)
  return data?.data ?? data
}

// ── Activity Log ──────────────────────────────────────────────────────────────
// entity is now REQUIRED per Postman v8.
// We fetch logs for each entity type and merge them so we get the full picture.

export interface ActivityLogItem {
  id: string
  action: string
  entity: string
  entityId?: string
  userId?: string
  details?: {
    orderNumber?: string
    guest?: string
    name?: string
  }
  createdAt: string
  updatedAt?: string
}

// `entity` is optional — omitting it returns logs across ALL entity types
// (event, order, user, sponsorship, donation), server-paginated.
export async function getActivityLog(params?: {
  entity?: string
  action?: string
  page?: number
  limit?: number
}): Promise<{ logs: ActivityLogItem[]; pagination: { page: number; pages: number; total: number } }> {
  const query = new URLSearchParams()
  if (params?.entity) query.set('entity', params.entity)
  if (params?.action) query.set('action', params.action)
  query.set('page', String(params?.page ?? 1))
  query.set('limit', String(params?.limit ?? 10))
  const { data } = await api.get(`/events/admin/activity?${query.toString()}`)
  return {
    logs: data?.data?.logs ?? data?.data ?? data?.logs ?? [],
    pagination: data?.data?.pagination ?? data?.pagination ?? { page: 1, pages: 1, total: 0 },
  }
}