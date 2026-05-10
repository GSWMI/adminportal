// RichTextDisplay.tsx
// Use this component wherever event descriptions, consent text, or other
// admin-entered rich text HTML needs to be displayed properly.
// It renders bold, paragraphs, line breaks, lists etc. as intended.

interface RichTextDisplayProps {
  html: string
  className?: string
}

export default function RichTextDisplay({ html, className = '' }: RichTextDisplayProps) {
  if (!html) return null
  return (
    <div
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}