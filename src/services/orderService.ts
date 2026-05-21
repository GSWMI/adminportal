import api from '../lib/axios'

export interface MealItem {
  slot: string
  optionIndex: number
  optionName: string
  price: number
  quantity: number
}

export interface MealSelection {
  day: number
  meals: MealItem[]
}

export interface QRCode {
  code: string
  type: 'meal' | 'transport' | 'accommodation'
  day?: number
  mealType?: string
  optionName?: string
  direction?: string
  pickupLocation?: string
  accommodationId?: string
  accommodationName?: string
  quantity?: number
  redeemed: boolean
  redeemedAt?: string
  qrImage?: string
}

export interface OrderGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender?: string
  nextOfKin?: { fullName: string; email: string; phone?: string }
}

export interface OrderData {
  _id: string
  orderNumber: string
  eventId: string
  guest: OrderGuest
  status: string
  paymentStatus: string
  totalAmount: number
  mealTotal?: number
  accommodationTotal?: number
  transportTotal?: number
  paystackReference?: string
  paymentReference?: string
  mealSelections?: MealSelection[]
  accommodationId?: string
  transportId?: string
  wantsTransport?: boolean
  qrCodes?: QRCode[]
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pages: number
  limit: number
  total: number
}

export interface MealTicketRow {
  guest: OrderGuest
  orderNumber: string
  day: number
  slot: string
  code: string
  optionName: string
  quantity: number
  price: number
  paidAt: string
  registeredAt: string
  qrCodes: QRCode[]
}

export interface AccommodationTicketRow {
  orderNumber: string
  guest: OrderGuest
  accommodation: {
    id: string; name: string; description: string; price: number
    peoplePerRoom: number; totalCapacity: number; available: boolean
    amenities: string[]; eventId: string
  }
  paidAt: string
  registeredAt: string
  qrCodes: QRCode[]
}

export interface TransportTicketRow {
  orderNumber: string
  guest: OrderGuest
  transport: {
    id: string; name: string; description: string; price: number
    available: boolean; pickupLocation: string; eventId: string
  }
  paidAt: string
  registeredAt: string
  qrCodes: QRCode[]
}

export interface AttendeeRow {
  orderNumber: string
  guest: OrderGuest
  ticketTypes: string[]
  mealTotal: number
  accommodationTotal: number
  transportTotal: number
  totalAmount: number
  paidAt: string
  registeredAt: string
}

export interface TicketListPagination {
  total: number; page: number; limit: number; pages: number
}

function normalizeOrder(order: Record<string, unknown>): OrderData {
  return { ...order, _id: (order._id ?? order.id ?? '') as string } as OrderData
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getAllOrders(params?: {
  eventId?: string
  page?: number
  limit?: number
}): Promise<{ orders: OrderData[]; pagination: Pagination }> {
  const query = new URLSearchParams()
  if (params?.eventId) query.set('eventId', params.eventId)
  if (params?.page) query.set('page', String(params.page))
  query.set('limit', String(params?.limit ?? 20))
  const { data } = await api.get(`/orders?${query.toString()}`)
  const inner = data?.data ?? data
  const rawOrders = Array.isArray(inner?.orders) ? inner.orders : Array.isArray(inner) ? inner : []
  return {
    orders: rawOrders.map(normalizeOrder),
    pagination: inner?.pagination ?? { page: 1, pages: 1, limit: 20, total: rawOrders.length },
  }
}

export async function getOrderById(id: string): Promise<OrderData> {
  const { data } = await api.get(`/orders/${id}`)
  return normalizeOrder(data?.data?.order ?? data?.order ?? data?.data ?? data)
}

// ── Meal tickets — server-side pagination ─────────────────────────────────────
// Uses page + limit instead of limit=1000 to avoid MongoDB 16MB BSON limit.
// With 268 meal rows the aggregation document exceeded 16MB at limit=1000.

export async function getMealTickets(
  eventId: string,
  params?: { page?: number; limit?: number }
): Promise<{ list: MealTicketRow[]; pagination: TicketListPagination }> {
  const query = new URLSearchParams()
  query.set('page', String(params?.page ?? 1))
  query.set('limit', String(params?.limit ?? 20))
  const { data } = await api.get(`/orders/${eventId}/meals?${query.toString()}`)
  return {
    list: data?.data?.list ?? [],
    pagination: data?.data?.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 },
  }
}

// ── Other ticket endpoints — keep limit=500 (accommodation/transport lists
//    are much smaller documents and haven't hit the BSON limit) ───────────────

export async function getAccommodationTickets(eventId: string): Promise<{ list: AccommodationTicketRow[]; pagination: TicketListPagination }> {
  const { data } = await api.get(`/orders/${eventId}/accommodations?limit=500`)
  return {
    list: data?.data?.list ?? [],
    pagination: data?.data?.pagination ?? { total: 0, page: 1, limit: 500, pages: 1 },
  }
}

export async function getTransportTickets(eventId: string): Promise<{ list: TransportTicketRow[]; pagination: TicketListPagination }> {
  const { data } = await api.get(`/orders/${eventId}/transports?limit=500`)
  return {
    list: data?.data?.list ?? [],
    pagination: data?.data?.pagination ?? { total: 0, page: 1, limit: 500, pages: 1 },
  }
}

export async function getAttendees(eventId: string): Promise<{ list: AttendeeRow[]; pagination: TicketListPagination }> {
  const { data } = await api.get(`/orders/${eventId}/attendees?limit=500`)
  return {
    list: data?.data?.list ?? [],
    pagination: data?.data?.pagination ?? { total: 0, page: 1, limit: 500, pages: 1 },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTicketTypes(order: OrderData): string[] {
  const types: string[] = []
  if (order.mealSelections && order.mealSelections.length > 0) types.push('Meal')
  if (order.accommodationId) types.push('Accommodation')
  if (order.transportId || order.wantsTransport || order.qrCodes?.some((q) => q.type === 'transport')) types.push('Transport')
  return types.length > 0 ? types : ['General']
}

export function mapPaymentStatus(order: OrderData): string {
  const raw = order.paymentStatus ?? order.status ?? ''
  const map: Record<string, string> = {
    success: 'Successful', paid: 'Successful', pending: 'Pending',
    cancelled: 'Cancelled', canceled: 'Cancelled', failed: 'Failed',
  }
  return map[raw.toLowerCase()] ?? raw
}

export async function resendTicket(orderId: string): Promise<void> {
  await api.post(`/orders/${orderId}/resend-ticket`)
}