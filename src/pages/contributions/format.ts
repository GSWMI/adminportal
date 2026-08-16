import type { SponsorshipCategoryDetails } from '../../services/contributionService'

export function formatDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function money(n?: number) {
  return `₦${(n ?? 0).toLocaleString()}`
}

export function categorySummary(cd: SponsorshipCategoryDetails): string {
  const parts: string[] = []
  if (cd?.meal?.numberOfPersons) parts.push(`Meal ×${cd.meal.numberOfPersons}`)
  if (cd?.transport?.numberOfPersons) parts.push(`Transport ×${cd.transport.numberOfPersons}`)
  const acc = (cd?.accommodation ?? []).reduce((s, a) => s + (a.numberOfPersons || 0), 0)
  if (acc) parts.push(`Accommodation ×${acc}`)
  return parts.join(' · ') || '—'
}
