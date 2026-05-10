import { useState, useMemo } from 'react'

const DEFAULT_PAGE_SIZE = 20

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reset to page 1 if items change and current page is out of range
  const safePage = Math.min(page, totalPages)

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )

  return {
    page: safePage,
    setPage,
    totalPages,
    total: items.length,
    paged,
  }
}