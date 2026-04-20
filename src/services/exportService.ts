import api from '../lib/axios'
import type { OrderData } from './orderService'

// ── Helper ────────────────────────────────────────────────────────────────────

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escape(val: unknown): string {
  const s = String(val ?? '').replace(/"/g, '""')
  return `"${s}"`
}

function toDate(s?: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const head = headers.map(escape).join(',')
  const body = rows.map((r) => r.map(escape).join(',')).join('\n')
  return `${head}\n${body}`
}

// ── 1. Attendees (full) ───────────────────────────────────────────────────────

export function exportAttendeesClientSide(orders: OrderData[], eventName = '') {
  const headers = [
    'Order Number', 'First Name', 'Last Name', 'Email', 'WhatsApp Phone',
    'Gender', 'Next of Kin (Name)', 'Next of Kin (Email)',
    'Ticket Types', 'Meal Total (₦)', 'Accommodation Total (₦)', 'Transport Total (₦)',
    'Grand Total (₦)', 'Payment Status', 'Paid At', 'Registered At',
  ]
  const rows = orders.map((o) => {
    const types: string[] = []
    if (o.mealSelections?.some((s) => s.meals.length > 0)) types.push('Meal')
    if (o.accommodationId) types.push('Accommodation')
    if (o.transportId || o.qrCodes?.some((q) => q.type === 'transport')) types.push('Transport')
    return [
      o.orderNumber,
      o.guest.firstName,
      o.guest.lastName,
      o.guest.email,
      o.guest.phone,
      o.guest.gender ?? '',
      o.guest.nextOfKin?.fullName ?? '',
      o.guest.nextOfKin?.email ?? '',
      types.join(', '),
      o.mealTotal ?? '',
      o.accommodationTotal ?? '',
      o.transportTotal ?? '',
      o.totalAmount,
      o.paymentStatus,
      toDate(o.paidAt),
      toDate(o.createdAt),
    ]
  })
  const filename = `attendees-${eventName ? eventName.replace(/\s+/g, '-') + '-' : ''}${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(buildCsv(headers, rows), filename)
}

// ── 2. Meal tickets ───────────────────────────────────────────────────────────

export function exportMealTicketsClientSide(orders: OrderData[], eventName = '') {
  const headers = [
    'Order Number', 'First Name', 'Last Name', 'Email', 'WhatsApp Phone', 'Gender',
    'Day', 'Slot', 'Meal Option', 'Quantity', 'Price (₦)', 'Subtotal (₦)',
    'QR Code', 'Redeemed', 'Payment Status',
  ]
  const rows: unknown[][] = []
  orders.forEach((o) => {
    const mealQrs = o.qrCodes?.filter((q) => q.type === 'meal') ?? []
    if (mealQrs.length === 0) {
      // Fallback to mealSelections if no QR codes yet
      o.mealSelections?.forEach((sel) => {
        sel.meals.forEach((meal) => {
          rows.push([
            o.orderNumber,
            o.guest.firstName, o.guest.lastName, o.guest.email, o.guest.phone, o.guest.gender ?? '',
            sel.day,
            meal.slot,
            meal.optionName,
            meal.quantity,
            meal.price,
            meal.price * meal.quantity,
            '', 'No', o.paymentStatus,
          ])
        })
      })
    } else {
      mealQrs.forEach((qr) => {
        rows.push([
          o.orderNumber,
          o.guest.firstName, o.guest.lastName, o.guest.email, o.guest.phone, o.guest.gender ?? '',
          qr.day ?? '',
          qr.mealType ?? '',
          qr.optionName ?? '',
          qr.quantity ?? 1,
          '', '',
          qr.code,
          qr.redeemed ? 'Yes' : 'No',
          o.paymentStatus,
        ])
      })
    }
  })
  const filename = `meal-tickets-${eventName ? eventName.replace(/\s+/g, '-') + '-' : ''}${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(buildCsv(headers, rows), filename)
}

// ── 3. Accommodation tickets ──────────────────────────────────────────────────

export function exportAccommodationTicketsClientSide(orders: OrderData[], eventName = '') {
  const headers = [
    'Order Number', 'First Name', 'Last Name', 'Email', 'WhatsApp Phone', 'Gender',
    'Next of Kin (Name)', 'Next of Kin (Email)',
    'Accommodation Type', 'Amount (₦)', 'QR Code', 'Redeemed', 'Payment Status', 'Paid At',
  ]
  const rows = orders.map((o) => {
    const qr = o.qrCodes?.find((q) => q.type === 'accommodation')
    return [
      o.orderNumber,
      o.guest.firstName, o.guest.lastName, o.guest.email, o.guest.phone, o.guest.gender ?? '',
      o.guest.nextOfKin?.fullName ?? '',
      o.guest.nextOfKin?.email ?? '',
      qr?.accommodationName ?? '',
      o.accommodationTotal ?? '',
      qr?.code ?? '',
      qr?.redeemed ? 'Yes' : 'No',
      o.paymentStatus,
      toDate(o.paidAt),
    ]
  })
  const filename = `accommodation-tickets-${eventName ? eventName.replace(/\s+/g, '-') + '-' : ''}${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(buildCsv(headers, rows), filename)
}

// ── 4. Transport tickets ──────────────────────────────────────────────────────

export function exportTransportTicketsClientSide(orders: OrderData[], eventName = '') {
  const headers = [
    'Order Number', 'First Name', 'Last Name', 'Email', 'WhatsApp Phone', 'Gender',
    'Pickup Location', 'Direction', 'Amount (₦)', 'QR Code', 'Redeemed', 'Payment Status', 'Paid At',
  ]
  const rows = orders.map((o) => {
    const qr = o.qrCodes?.find((q) => q.type === 'transport')
    return [
      o.orderNumber,
      o.guest.firstName, o.guest.lastName, o.guest.email, o.guest.phone, o.guest.gender ?? '',
      qr?.pickupLocation ?? '',
      qr?.direction ?? '',
      o.transportTotal ?? '',
      qr?.code ?? '',
      qr?.redeemed ? 'Yes' : 'No',
      o.paymentStatus,
      toDate(o.paidAt),
    ]
  })
  const filename = `transport-tickets-${eventName ? eventName.replace(/\s+/g, '-') + '-' : ''}${new Date().toISOString().slice(0, 10)}.csv`
  downloadCsv(buildCsv(headers, rows), filename)
}

// ── Legacy API-based exports (kept for backwards compat) ──────────────────────

export async function exportAttendeesCsv(eventId?: string): Promise<void> {
  const params = eventId ? `?eventId=${eventId}` : ''
  const response = await api.get(`/orders/export/attendees${params}`, { responseType: 'blob' })
  const filename = `attendees-${new Date().toISOString().slice(0, 10)}.csv`
  const blob = response.data
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click()
  document.body.removeChild(link); URL.revokeObjectURL(url)
}

export async function exportOrdersCsv(params?: { eventId?: string; status?: string }): Promise<void> {
  const query = new URLSearchParams()
  if (params?.eventId) query.set('eventId', params.eventId)
  if (params?.status) query.set('status', params.status)
  const queryStr = query.toString() ? `?${query.toString()}` : ''
  const response = await api.get(`/orders/export/orders${queryStr}`, { responseType: 'blob' })
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  const blob = response.data
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click()
  document.body.removeChild(link); URL.revokeObjectURL(url)
}