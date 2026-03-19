type Status = 'Pending' | 'Successful' | 'Cancelled' | 'Failed' | string

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  Pending:    { dot: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  Successful: { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  Cancelled:  { dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
  Failed:     { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  )
}