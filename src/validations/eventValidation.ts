import type { TicketFormData } from '../store/ticketStore'

export interface MealOptionPayload {
  name: string
  price: number
  limit?: number
}

export interface MealOptionGroupPayload {
  day: number
  slot: string
  options: MealOptionPayload[]
}

export interface CustomQuestionPayload {
  question: string
  required: boolean
}

export interface EventApiPayload {
  name: string
  description: string
  startDate: string
  endDate: string
  totalDays: number
  location: string
  bannerUrl: string
  mealOptions: MealOptionGroupPayload[]
  customQuestions: CustomQuestionPayload[]
  consentText: string
  registrationOpen: boolean
  mealRegistrationOpen: boolean
  accommodationRegistrationOpen: boolean
  transportRegistrationOpen: boolean
}

export interface AccommodationApiPayload {
  name: string
  description: string
  price: number
  capacity: number
  available: boolean
  amenities: string[]
  eventId: string
}

export interface TransportApiPayload {
  name: string
  description: string
  price: number
  available: boolean
  pickupLocation: string
  dropoffLocation: string
  eventId: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function mapMealOptions(form: TicketFormData): MealOptionGroupPayload[] {
  const result: MealOptionGroupPayload[] = []
  form.days.forEach((day, dayIndex) => {
    day.slots.forEach((slot) => {
      if (slot.options.length > 0) {
        result.push({
          day: dayIndex + 1,
          slot: slot.name.toLowerCase(),
          options: slot.options.map((opt) => ({
            name: opt.name,
            price: opt.price,
            ...(opt.limit > 0 ? { limit: opt.limit } : {}),
          })),
        })
      }
    })
  })
  return result
}

function mapCustomQuestions(form: TicketFormData): CustomQuestionPayload[] {
  return form.customFields.map((f) => ({ question: f.question, required: f.required }))
}

export function mapFormToEventPayload(form: TicketFormData): EventApiPayload {
  return {
    name: form.programName.trim(),
    description: stripHtml(form.description) || form.description,
    startDate: form.startDate,
    endDate: form.endDate,
    totalDays: form.totalDays,
    location: form.location.trim(),
    bannerUrl: form.bannerPreview || '',
    mealOptions: form.ticketTypes.includes('Meal') ? mapMealOptions(form) : [],
    customQuestions: mapCustomQuestions(form),
    consentText: stripHtml(form.consentText) || form.consentText,
    registrationOpen: true,
    mealRegistrationOpen: form.ticketTypes.includes('Meal'),
    accommodationRegistrationOpen: form.ticketTypes.includes('Accommodation'),
    transportRegistrationOpen: form.ticketTypes.includes('Transportation'),
  }
}

// Map accommodation options for POST /events/accommodation
export function mapAccommodationPayload(
  acc: TicketFormData['accommodations'][0],
  eventId: string
): AccommodationApiPayload {
  return {
    name: acc.name,
    description: stripHtml(acc.description) || acc.description,
    price: acc.price,
    capacity: acc.capacity,
    available: true,
    amenities: [],
    eventId,
  }
}

// Map each transport pickup for POST /events/transport
export function mapTransportPayload(
  transport: TicketFormData['transport'],
  pickup: TicketFormData['transport']['pickups'][0],
  eventId: string
): TransportApiPayload {
  return {
    name: transport.name,
    description: stripHtml(transport.description) || transport.description,
    price: pickup.price,
    available: true,
    pickupLocation: pickup.pickupLocation,
    dropoffLocation: 'Conference Venue', // default — backend requires this field
    eventId,
  }
}

export function validateEventForm(form: TicketFormData): string | null {
  if (!form.programName.trim()) return 'Program name is required'
  if (!form.startDate) return 'Start date is required'
  if (!form.endDate) return 'End date is required'
  if (!form.totalDays || form.totalDays < 1) return 'Total days must be at least 1'
  if (form.ticketTypes.length === 0) return 'Select at least one ticket type'
  return null
}