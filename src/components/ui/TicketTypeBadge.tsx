export default function TicketTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
      {type}
    </span>
  )
}