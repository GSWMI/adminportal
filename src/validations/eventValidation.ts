import type { TicketFormData } from '../store/ticketStore'

// ── Interfaces (for type safety) ─────────────────────────────────────────────

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

export interface AccommodationApiPayload {
  name: string
  description: string
  price: number
  peoplePerRoom: number
  totalCapacity: number
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: unknown): string {
  if (!html || typeof html !== 'string') return ''
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

// ── Main event payload — returns FormData (multipart/form-data) ───────────────
// The backend expects: text fields as plain strings, arrays/objects as JSON strings,
// and the banner image as a file field named "banner"

export function mapFormToEventPayload(form: TicketFormData): FormData {
  const fd = new FormData()

  fd.append('name', form.programName.trim())
  fd.append('description', stripHtml(form.description) || form.description || '')
  fd.append('startDate', form.startDate)
  fd.append('endDate', form.endDate)
  fd.append('totalDays', String(Number(form.totalDays) || form.days.length || 1))
  fd.append('location', form.location.trim())
  fd.append('consentText', stripHtml(form.consentText) || form.consentText || '')
  fd.append('registrationOpen', 'true')
  fd.append('mealRegistrationOpen', String(form.ticketTypes.includes('Meal')))
  fd.append('accommodationRegistrationOpen', String(form.ticketTypes.includes('Accommodation')))
  fd.append('transportRegistrationOpen', String(form.ticketTypes.includes('Transportation')))

  // Arrays must be JSON-stringified
  const mealOptions = form.ticketTypes.includes('Meal') ? mapMealOptions(form) : []
  fd.append('mealOptions', JSON.stringify(mealOptions))
  fd.append('customQuestions', JSON.stringify(mapCustomQuestions(form)))

  // Banner: send the actual File if available, otherwise skip (URL mode not supported by backend)
  if (form.banner instanceof File) {
    fd.append('banner', form.banner)
  }
  // If bannerUrl was pasted (URL mode), send it as a text field
  else if (form.bannerPreview && !form.bannerPreview.startsWith('blob:')) {
    fd.append('bannerUrl', form.bannerPreview)
  }

  return fd
}

// ── Accommodation payload ─────────────────────────────────────────────────────

export function mapAccommodationPayload(
  acc: TicketFormData['accommodations'][0],
  eventId: string
): AccommodationApiPayload {
  return {
    name: acc.name,
    description: stripHtml(acc.description) || acc.description,
    price: acc.price,
    peoplePerRoom: acc.peoplePerRoom,
    totalCapacity: acc.totalCapacity,
    available: true,
    amenities: [],
    eventId,
  }
}

// ── Transport payload (one per pickup location) ───────────────────────────────

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
    dropoffLocation: 'Conference Venue',
    eventId,
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateEventForm(form: TicketFormData): string | null {
  if (!form.programName.trim()) return 'Program name is required'
  if (!form.startDate) return 'Start date is required'
  if (!form.endDate) return 'End date is required'
  if (!form.totalDays || form.totalDays < 1) return 'Total days must be at least 1'
  if (form.ticketTypes.length === 0) return 'Select at least one ticket type'
  return null
}