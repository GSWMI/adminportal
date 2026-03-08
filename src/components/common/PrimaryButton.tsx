import type { LucideIcon } from "lucide-react";

type PrimaryButtonProps = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
};

function PrimaryButton({
  label,
  icon: Icon,
  onClick,
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-[#3867D6] px-4 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.18)] transition hover:bg-[#2F5DCA]"
    >
      {Icon ? <Icon size={18} /> : null}
      {label}
    </button>
  );
}

export default PrimaryButton;