import { create } from 'zustand'

export type TicketType = 'Meal' | 'Accommodation' | 'Transportation' | ''

export interface MealOption {
  id: string
  name: string
  price: number
  limit: number
}

export interface MealSlot {
  id: string
  name: string // Breakfast | Lunch | Dinner
  options: MealOption[]
}

export interface EventDay {
  id: string
  label: string // Day 1 | Day 2 ...
  slots: MealSlot[]
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
  description: string // rich text HTML
  startDate: string
  endDate: string
  location: string
  totalDays: number

  // Step 2 - Ticket type
  ticketType: TicketType

  // Step 3 - Options, prices & quantity limit
  days: EventDay[]

  // Step 4 - Registration form
  customFields: CustomField[]
  consentText: string // rich text HTML

  // Meta
  currentStep: number
  completedSteps: number[]
}

interface TicketStore {
  form: TicketFormData
  setStep: (step: number) => void
  completeStep: (step: number) => void
  updateEventInfo: (data: Partial<TicketFormData>) => void
  updateTicketType: (type: TicketType) => void
  updateDays: (days: EventDay[]) => void
  addMealOption: (dayId: string, slotId: string, option: MealOption) => void
  removeMealOption: (dayId: string, slotId: string, optionId: string) => void
  addCustomField: (field: CustomField) => void
  removeCustomField: (id: string) => void
  updateCustomField: (id: string, data: Partial<CustomField>) => void
  updateConsentText: (text: string) => void
  reset: () => void
}

const defaultDays = (): EventDay[] =>
  [1, 2, 3].map((n) => ({
    id: `day-${n}`,
    label: `Day ${n}`,
    slots: ['Breakfast', 'Lunch', 'Dinner'].map((slot) => ({
      id: `day-${n}-${slot.toLowerCase()}`,
      name: slot,
      options: [],
    })),
  }))

const initialForm: TicketFormData = {
  banner: null,
  bannerPreview: '',
  programName: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  totalDays: 3,
  ticketType: '',
  days: defaultDays(),
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

  updateTicketType: (type) =>
    set((s) => ({ form: { ...s.form, ticketType: type } })),

  updateDays: (days) =>
    set((s) => ({ form: { ...s.form, days } })),

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