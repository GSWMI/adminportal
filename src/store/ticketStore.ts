import { create } from 'zustand'

export type TicketType = 'Meal' | 'Accommodation' | 'Transportation'

export interface MealOption {
  id: string
  name: string
  price: number
  limit: number
}

export interface MealSlot {
  id: string
  name: string
  options: MealOption[]
}

export interface EventDay {
  id: string
  label: string
  slots: MealSlot[]
}

export interface AccommodationOption {
  id: string
  name: string
  description: string
  peoplePerRoom: number
  totalCapacity: number
  price: number
}

export interface TransportPickup {
  id: string
  pickupLocation: string
  price: number
}

export interface TransportOption {
  name: string
  description: string
  pickups: TransportPickup[]
}

export type CustomFieldType =
  | 'Short text'
  | 'Long text'
  | 'Checkbox'
  | 'Single select'
  | 'Multiple select'
  | 'URL link'
  | 'File upload'

export interface CustomField {
  id: string
  type: CustomFieldType
  question: string
  required: boolean
}

export interface TicketFormData {
  // Step 1 - Event info
  banner: File | null
  bannerPreview: string
  programName: string
  description: string
  startDate: string
  endDate: string
  location: string
  totalDays: number

  // Step 2 - Ticket types (multi-select)
  ticketTypes: TicketType[]

  // Step 3 - Meal options
  days: EventDay[]

  // Step 3 - Accommodation options
  accommodations: AccommodationOption[]

  // Step 3 - Transport
  transport: TransportOption

  // Step 4 - Registration form
  customFields: CustomField[]
  consentText: string

  // Meta
  currentStep: number
  completedSteps: number[]
}

interface TicketStore {
  form: TicketFormData
  setStep: (step: number) => void
  completeStep: (step: number) => void
  updateEventInfo: (data: Partial<TicketFormData>) => void
  toggleTicketType: (type: TicketType) => void
  updateDays: (days: EventDay[]) => void
  addDay: () => void
  removeDay: (id: string) => void
  addMealOption: (dayId: string, slotId: string, option: MealOption) => void
  removeMealOption: (dayId: string, slotId: string, optionId: string) => void
  addAccommodation: (option: AccommodationOption) => void
  removeAccommodation: (id: string) => void
  updateTransport: (data: Partial<TransportOption>) => void
  addPickup: (pickup: TransportPickup) => void
  removePickup: (id: string) => void
  addCustomField: (field: CustomField) => void
  removeCustomField: (id: string) => void
  updateCustomField: (id: string, data: Partial<CustomField>) => void
  updateConsentText: (text: string) => void
  reset: () => void
}

function makeDay(n: number): EventDay {
  return {
    id: `day-${n}`,
    label: `Day ${n}`,
    slots: ['Breakfast', 'Lunch', 'Dinner'].map((slot) => ({
      id: `day-${n}-${slot.toLowerCase()}`,
      name: slot,
      options: [],
    })),
  }
}

const defaultDays = (): EventDay[] => [makeDay(1)]

const initialForm: TicketFormData = {
  banner: null,
  bannerPreview: '',
  programName: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  totalDays: 1,
  ticketTypes: [],
  days: defaultDays(),
  accommodations: [],
  transport: { name: '', description: '', pickups: [] },
  customFields: [],
  consentText: '',
  currentStep: 0,
  completedSteps: [],
}

export const useTicketStore = create<TicketStore>()((set) => ({
  form: initialForm,

  setStep: (step) =>
    set((s) => ({ form: { ...s.form, currentStep: step } })),

  completeStep: (step) =>
    set((s) => ({
      form: {
        ...s.form,
        completedSteps: s.form.completedSteps.includes(step)
          ? s.form.completedSteps
          : [...s.form.completedSteps, step],
      },
    })),

  updateEventInfo: (data) =>
    set((s) => ({ form: { ...s.form, ...data } })),

  toggleTicketType: (type) =>
    set((s) => {
      const current = s.form.ticketTypes
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type]
      return { form: { ...s.form, ticketTypes: next } }
    }),

  updateDays: (days) =>
    set((s) => ({ form: { ...s.form, days } })),

  addDay: () =>
    set((s) => {
      const nextN = s.form.days.length + 1
      return { form: { ...s.form, days: [...s.form.days, makeDay(nextN)], totalDays: nextN } }
    }),

  removeDay: (id) =>
    set((s) => {
      const filtered = s.form.days.filter((d) => d.id !== id)
      // Re-label days sequentially after removal
      const relabelled = filtered.map((d, i) => ({ ...d, label: `Day ${i + 1}` }))
      return { form: { ...s.form, days: relabelled, totalDays: relabelled.length } }
    }),

  addMealOption: (dayId, slotId, option) =>
    set((s) => ({
      form: {
        ...s.form,
        days: s.form.days.map((d) =>
          d.id === dayId
            ? {
                ...d,
                slots: d.slots.map((sl) =>
                  sl.id === slotId
                    ? { ...sl, options: [...sl.options, option] }
                    : sl
                ),
              }
            : d
        ),
      },
    })),

  removeMealOption: (dayId, slotId, optionId) =>
    set((s) => ({
      form: {
        ...s.form,
        days: s.form.days.map((d) =>
          d.id === dayId
            ? {
                ...d,
                slots: d.slots.map((sl) =>
                  sl.id === slotId
                    ? { ...sl, options: sl.options.filter((o) => o.id !== optionId) }
                    : sl
                ),
              }
            : d
        ),
      },
    })),

  addAccommodation: (option) =>
    set((s) => ({
      form: { ...s.form, accommodations: [...s.form.accommodations, option] },
    })),

  removeAccommodation: (id) =>
    set((s) => ({
      form: {
        ...s.form,
        accommodations: s.form.accommodations.filter((a) => a.id !== id),
      },
    })),

  updateTransport: (data) =>
    set((s) => ({
      form: { ...s.form, transport: { ...s.form.transport, ...data } },
    })),

  addPickup: (pickup) =>
    set((s) => ({
      form: {
        ...s.form,
        transport: {
          ...s.form.transport,
          pickups: [...s.form.transport.pickups, pickup],
        },
      },
    })),

  removePickup: (id) =>
    set((s) => ({
      form: {
        ...s.form,
        transport: {
          ...s.form.transport,
          pickups: s.form.transport.pickups.filter((p) => p.id !== id),
        },
      },
    })),

  addCustomField: (field) =>
    set((s) => ({
      form: { ...s.form, customFields: [...s.form.customFields, field] },
    })),

  removeCustomField: (id) =>
    set((s) => ({
      form: {
        ...s.form,
        customFields: s.form.customFields.filter((f) => f.id !== id),
      },
    })),

  updateCustomField: (id, data) =>
    set((s) => ({
      form: {
        ...s.form,
        customFields: s.form.customFields.map((f) =>
          f.id === id ? { ...f, ...data } : f
        ),
      },
    })),

  updateConsentText: (text) =>
    set((s) => ({ form: { ...s.form, consentText: text } })),

  reset: () => set({ form: initialForm }),
}))