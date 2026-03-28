import api from '../lib/axios'

export interface MealSelection {
  day: number
  meals: string[]
}

export interface QRCode {
  code: string
  type: 'meal' | 'transport' | 'accommodation'
  day?: number
  mealType?: string
  direction?: string
  redeemed: boolean
  redeemedAt?: string
}

export interface OrderGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
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

export async function getAllOrders(): Promise<{ orders: OrderData[]; pagination: Pagination }> {
  const { data } = await api.get('/orders')
  return {
    orders: Array.isArray(data.orders) ? data.orders : Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [],
    pagination: data.pagination ?? { page: 1, pages: 1, limit: 20, total: 0 },
  }
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
  if (order.wantsTransport) types.push('Transport')
  return types.length > 0 ? types : ['Meal']
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