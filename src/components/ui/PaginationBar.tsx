interface PaginationBarProps {
  page: number
  totalPages: number
  total: number
  label?: string
  onPage: (page: number) => void
}

export default function PaginationBar({ page, totalPages, total, label = 'records', onPage }: PaginationBarProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return start + i
  })

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <span className="text-[12px] text-gray-500">
        Page {page} of {totalPages} · {total} {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-[12px] transition-colors ${
              p === page
                ? 'bg-[#3b5bdb] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          Next
        </button>
      </div>
    </div>
  )
}