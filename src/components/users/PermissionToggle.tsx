type PermissionToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function PermissionToggle({
  label,
  checked,
  onChange,
}: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[16px] text-[#4B5563]">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-10 rounded-full transition ${
          checked ? "bg-[#3867D6]" : "bg-[#E5E7EB]"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-4" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default PermissionToggle;