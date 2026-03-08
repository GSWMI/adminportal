import type { LucideIcon } from "lucide-react";

type OutlineButtonProps = {
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
};

function OutlineButton({
  label,
  icon: Icon,
  disabled = false,
  onClick,
}: OutlineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[46px] items-center gap-2 rounded-[10px] border px-4 text-[16px] font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition ${
        disabled
          ? "cursor-not-allowed border-[#E5E7EB] bg-white text-[#B0B7C3]"
          : "border-[#D0D5DD] bg-white text-[#1E497E] hover:bg-[#F9FAFB]"
      }`}
    >
      {Icon ? <Icon size={18} /> : null}
      {label}
    </button>
  );
}

export default OutlineButton;