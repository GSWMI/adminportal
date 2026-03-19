import { useRef, useState, useCallback } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, List } from 'lucide-react'

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  minHeight?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RichTextEditor({ value: _value, onChange, placeholder = 'Start typing...', minHeight = '120px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft')
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter')
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList')
    setActiveFormats(formats)
  }, [])

  const exec = (command: string) => {
    ref.current?.focus()
    document.execCommand(command, false)
    if (ref.current) onChange(ref.current.innerHTML)
    updateActiveFormats()
  }

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML)
    updateActiveFormats()
  }

  const handleKeyUp = () => updateActiveFormats()
  const handleMouseUp = () => updateActiveFormats()

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#3b5bdb] focus-within:ring-2 focus-within:ring-[#3b5bdb]/20 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn command="bold" label="Bold" active={activeFormats.has('bold')} onExec={exec}>
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn command="italic" label="Italic" active={activeFormats.has('italic')} onExec={exec}>
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn command="underline" label="Underline" active={activeFormats.has('underline')} onExec={exec}>
          <Underline size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn command="justifyLeft" label="Align left" active={activeFormats.has('justifyLeft')} onExec={exec}>
          <AlignLeft size={13} />
        </ToolbarBtn>
        <ToolbarBtn command="justifyCenter" label="Align center" active={activeFormats.has('justifyCenter')} onExec={exec}>
          <AlignCenter size={13} />
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn command="insertUnorderedList" label="Bullet list" active={activeFormats.has('insertUnorderedList')} onExec={exec}>
          <List size={13} />
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        data-placeholder={placeholder}
        className="px-3 py-2.5 text-[13px] text-gray-800 outline-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        style={{ minHeight }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

interface ToolbarBtnProps {
  command: string
  label: string
  active: boolean
  onExec: (cmd: string) => void
  children: React.ReactNode
}

function ToolbarBtn({ command, label, active, onExec, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault() // prevent losing focus from editor
        onExec(command)
      }}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[#3b5bdb] text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}