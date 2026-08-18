import { QueryClient, QueryCache } from '@tanstack/react-query'
import { toast } from 'sonner'

// Shared React Query client.
// Defaults tuned for an admin dashboard: show cached data instantly, refresh in the
// background. Per-query staleTime overrides these where data needs to be fresher/staler.
export const queryClient = new QueryClient({
  // Centralized error toast so pages don't each need their own error handling.
  queryCache: new QueryCache({
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to load data')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s: revisits within this window use cache without refetching
      gcTime: 5 * 60_000, // keep unused cache around for 5 min
      refetchOnWindowFocus: true, // refresh when the admin returns to the tab
      retry: 1, // one retry on transient failure
    },
  },
})
