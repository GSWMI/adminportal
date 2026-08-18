// Central query-key factory. Use these everywhere so invalidation after mutations
// targets the exact keys (e.g. queryClient.invalidateQueries({ queryKey: qk.events() })).
export const qk = {
  // Dashboard aggregate stats (per event or cumulative)
  dashboard: (eventId?: string) => ['dashboard', eventId ?? 'all'] as const,

  // Events
  events: () => ['events'] as const,
  event: (id: string) => ['event', id] as const,
  eventAccommodations: (eventId: string) => ['event', eventId, 'accommodations'] as const,
  eventTransports: (eventId: string) => ['event', eventId, 'transports'] as const,

  // Orders / transactions
  orders: (params?: { eventId?: string; page?: number; limit?: number }) =>
    ['orders', params ?? {}] as const,
  order: (id: string) => ['order', id] as const,

  // Per-event ticket lists
  attendees: (eventId: string) => ['attendees', eventId] as const,
  mealTickets: (eventId: string, page?: number) => ['mealTickets', eventId, page ?? 1] as const,
  accommodationTickets: (eventId: string) => ['accommodationTickets', eventId] as const,
  transportTickets: (eventId: string) => ['transportTickets', eventId] as const,

  // Admins + activity
  admins: () => ['admins'] as const,
  activity: (params?: { entity?: string; page?: number }) => ['activity', params ?? {}] as const,

  // Contributions
  sponsorships: (eventId?: string) => ['sponsorships', eventId ?? 'all'] as const,
  sponsorship: (id: string) => ['sponsorship', id] as const,
  donations: (eventId?: string) => ['donations', eventId ?? 'all'] as const,
  donation: (id: string) => ['donation', id] as const,
} as const
