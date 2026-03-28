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

// Strip HTML tags from rich text editor output
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Map store days/slots/options to the new API mealOptions structure
function mapMealOptions(form: TicketFormData): MealOptionGroupPayload[] {
  const result: MealOptionGroupPayload[] = []

  form.days.forEach((day, dayIndex) => {
    day.slots.forEach((slot) => {
      if (slot.options.length > 0) {
        result.push({
          day: dayIndex + 1,
          slot: slot.name.toLowerCase(), // breakfast | lunch | dinner
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

// Map store customFields to API customQuestions
function mapCustomQuestions(form: TicketFormData): CustomQuestionPayload[] {
  return form.customFields.map((f) => ({
    question: f.question,
    required: f.required,
  }))
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
    mealOptions: mapMealOptions(form),
    customQuestions: mapCustomQuestions(form),
    consentText: stripHtml(form.consentText) || form.consentText,
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