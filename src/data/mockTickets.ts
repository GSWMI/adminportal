export interface TicketEvent {
  id: string
  programName: string
  description: string
  bannerPreview: string
  startDate: string
  endDate: string
  location: string
  ticketType: string
  status: 'upcoming' | 'past'
  days: {
    id: string
    label: string
    slots: {
      id: string
      name: string
      options: { id: string; name: string; price: number; limit: number }[]
    }[]
  }[]
  customFields: { id: string; type: string; question: string; required: boolean }[]
  consentText: string
}

export interface Attendee {
  id: string
  name: string
  email: string
  phone: string
  ticketsPurchased: ('Meal' | 'Accommodation' | 'Transport')[]
}

export interface MealTicketRow {
  id: string
  attendee: string
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner'
  mealOption: string
  packs: number
  status: 'Redeemed' | 'Unredeemed'
  day: number
}

export const mockTickets: TicketEvent[] = [
  {
    id: 'gswmi-june-2026',
    programName: 'GSWMI June Retreat 2026',
    description: 'The GSWMI June Retreat 2026 is a divine gathering of believers — a sacred time of refreshing, revelation, and renewal in the Spirit. It is a moment where hearts are stirred, faith is deepened, and destinies are aligned in God\'s purpose.',
    bannerPreview: '',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    location: 'Kajede, Oyo',
    ticketType: 'Meal',
    status: 'upcoming',
    days: [
      {
        id: 'day-1', label: 'Day 1',
        slots: [
          { id: 'day-1-breakfast', name: 'Breakfast', options: [] },
          { id: 'day-1-lunch', name: 'Lunch', options: [] },
          {
            id: 'day-1-dinner', name: 'Dinner', options: [
              { id: 'o1', name: 'White rice, stew, fried plantain & chicken', price: 7500, limit: 5 },
              { id: 'o2', name: 'Eba, egusi soup, beef & ponmo', price: 5000, limit: 5 },
            ]
          },
        ]
      },
      {
        id: 'day-2', label: 'Day 2',
        slots: [
          { id: 'day-2-breakfast', name: 'Breakfast', options: [] },
          {
            id: 'day-2-lunch', name: 'Lunch', options: [
              { id: 'o3', name: 'White rice, stew, fried plantain & chicken', price: 7500, limit: 5 },
              { id: 'o4', name: 'Eba, egusi soup, beef & ponmo', price: 5000, limit: 5 },
            ]
          },
          {
            id: 'day-2-dinner', name: 'Dinner', options: [
              { id: 'o5', name: 'White rice, stew, fried plantain & chicken', price: 7500, limit: 5 },
              { id: 'o6', name: 'Eba, egusi soup, beef & ponmo', price: 5000, limit: 5 },
            ]
          },
        ]
      },
      {
        id: 'day-3', label: 'Day 3',
        slots: [
          { id: 'day-3-breakfast', name: 'Breakfast', options: [] },
          {
            id: 'day-3-lunch', name: 'Lunch', options: [
              { id: 'o7', name: 'White rice, stew, fried plantain & chicken', price: 7500, limit: 5 },
              { id: 'o8', name: 'Eba, egusi soup, beef & ponmo', price: 5000, limit: 5 },
            ]
          },
          {
            id: 'day-3-dinner', name: 'Dinner', options: [
              { id: 'o9', name: 'White rice, stew, fried plantain & chicken', price: 7500, limit: 5 },
              { id: 'o10', name: 'Eba, egusi soup, beef & ponmo', price: 5000, limit: 5 },
            ]
          },
        ]
      },
    ],
    customFields: [
      { id: 'cf1', type: 'Short text', question: 'Share any food allergies you may have. If you don\'t have any food allergies, type "N/A"', required: true }
    ],
    consentText: 'I confirm that the information provided is accurate and I consent to the use of my details for event coordination and logistics purposes.',
  }
]

export const mockAttendees: Attendee[] = Array.from({ length: 10 }, (_, i) => ({
  id: `att-${i}`,
  name: 'Sienna Hewitt',
  email: 'shewitt@gmail.com',
  phone: '+2348100000000',
  ticketsPurchased: ['Meal', 'Accommodation', 'Transport'],
}))

export const mockMealTickets: MealTicketRow[] = [
  { id: 'm1', attendee: 'Sienna Hewitt', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
  { id: 'm2', attendee: 'Ammar Foley', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
  { id: 'm3', attendee: 'Pippa Wilkinson', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
  { id: 'm4', attendee: 'Olly Schroeder', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Redeemed', day: 1 },
  { id: 'm5', attendee: 'Mathilde Lewis', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Redeemed', day: 1 },
  { id: 'm6', attendee: 'Julius Vaughan', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
  { id: 'm7', attendee: 'Zaid Schwartz', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Redeemed', day: 1 },
  { id: 'm8', attendee: 'Zaid Schwartz', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Redeemed', day: 1 },
  { id: 'm9', attendee: 'Zaid Schwartz', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
  { id: 'm10', attendee: 'Zaid Schwartz', mealSlot: 'Dinner', mealOption: 'White rice, stew, fried plantain & chicken', packs: 2, status: 'Unredeemed', day: 1 },
]