interface Props {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled = false }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none
        ${checked ? 'bg-[#3b5bdb]' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  )
}