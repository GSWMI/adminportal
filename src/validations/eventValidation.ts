import type { TicketFormData } from '../store/ticketStore'

export interface EventApiPayload {
  name: string
  description: string
  startDate: string
  endDate: string
  totalDays: number
  mealPrices: {
    breakfast: number
    lunch: number
    dinner: number
  }
  registrationOpen: boolean
  mealRegistrationOpen: boolean
  accommodationRegistrationOpen: boolean
  transportRegistrationOpen: boolean
}

// Strip HTML tags from rich text editor output for plain text description
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Derive a single price for each meal slot by averaging options in that slot across all days
function deriveMealPrice(form: TicketFormData, slotName: string): number {
  const prices: number[] = []
  form.days.forEach((day) => {
    const slot = day.slots.find((s) => s.name.toLowerCase() === slotName.toLowerCase())
    if (slot) {
      slot.options.forEach((opt) => prices.push(opt.price))
    }
  })
  if (prices.length === 0) return 0
  // Use the first price found — admin sets consistent prices per slot
  return prices[0]
}

export function mapFormToEventPayload(form: TicketFormData): EventApiPayload {
  return {
    name: form.programName.trim(),
    description: stripHtml(form.description) || form.description,
    startDate: form.startDate,
    endDate: form.endDate,
    totalDays: form.totalDays,
    mealPrices: {
      breakfast: deriveMealPrice(form, 'Breakfast'),
      lunch: deriveMealPrice(form, 'Lunch'),
      dinner: deriveMealPrice(form, 'Dinner'),
    },
    registrationOpen: true,
    mealRegistrationOpen: form.ticketType === 'Meal',
    accommodationRegistrationOpen: form.ticketType === 'Accommodation',
    transportRegistrationOpen: form.ticketType === 'Transportation',
  }
}

export function validateEventForm(form: TicketFormData): string | null {
  if (!form.programName.trim()) return 'Program name is required'
  if (!form.startDate) return 'Start date is required'
  if (!form.endDate) return 'End date is required'
  if (!form.totalDays || form.totalDays < 1) return 'Total days must be at least 1'
  if (!form.ticketType) return 'Ticket type is required'
  return null
}