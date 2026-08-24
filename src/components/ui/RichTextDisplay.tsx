// RichTextDisplay.tsx
// Renders admin-entered rich text (event description, consent text) with its
// formatting intact — bold, italic, underline, paragraphs, line breaks, lists,
// and links. The HTML is run through sanitizeRichHtml first (defense in depth),
// and the list/paragraph/link styling is applied inline because Tailwind's
// preflight strips default list markers and paragraph spacing.
import { sanitizeRichHtml } from '../../lib/richText'

interface RichTextDisplayProps {
  html: string
  className?: string
}

export default function RichTextDisplay({ html, className = '' }: RichTextDisplayProps) {
  const safe = sanitizeRichHtml(html)
  if (!safe) return null
  return (
    <div
      className={`rich-text-display [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-[#3b5bdb] [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
