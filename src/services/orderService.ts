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
}

export interface OrderGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender?: string
  nextOfKin?: {
    fullName: string
    email: string
  }
}

export interface OrderData {
  _id: string
  orderNumber: string
  eventId: string
  guest: OrderGuest
  status: string           // legacy field
  paymentStatus: string    // 'success' | 'pending' | 'failed'
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

export async function getAllOrders(eventId?: string): Promise<{ orders: OrderData[]; pagination: Pagination }> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const { data } = await api.get(`/orders${params}`)
  // Response shape: { success, data: { orders: [], pagination: {} } }
  const inner = data?.data ?? data
  const orders = Array.isArray(inner?.orders) ? inner.orders
    : Array.isArray(inner) ? inner
    : []
  const pagination = inner?.pagination ?? { page: 1, pages: 1, limit: 20, total: orders.length }
  return { orders, pagination }
}

export async function getOrderById(id: string): Promise<OrderData> {
  const { data } = await api.get(`/orders/${id}`)
  return data?.data?.order ?? data?.order ?? data?.data ?? data
}

// Derive ticket types from order contents
export function getTicketTypes(order: OrderData): string[] {
  const types: string[] = []
  if (order.mealSelections && order.mealSelections.length > 0) types.push('Meal')
  if (order.accommodationId) types.push('Accommodation')
  // Check transportId or transport QR code since wantsTransport is not always returned
  if (order.transportId || order.wantsTransport || order.qrCodes?.some((q) => q.type === 'transport')) types.push('Transport')
  return types.length > 0 ? types : ['General']
}

// Map API paymentStatus to display status
export function mapPaymentStatus(order: OrderData): string {
  const raw = order.paymentStatus ?? order.status ?? ''
  const map: Record<string, string> = {
    success: 'Successful',
    paid: 'Successful',
    pending: 'Pending',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    failed: 'Failed',
  }
  return map[raw.toLowerCase()] ?? raw
}

export async function resendTicket(orderId: string): Promise<void> {
  await api.post(`/orders/${orderId}/resend-ticket`)
}