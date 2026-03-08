import type { LucideIcon } from "lucide-react";

type QuickActionButtonProps = {
  label: string;
  icon: LucideIcon;
};

function QuickActionButton({
  label,
  icon: Icon,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-[48px] items-center gap-3 rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[#1E497E] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:bg-[#F8FAFC]"
    >
      <Icon size={18} />
      <span className="text-[16px] font-semibold">{label}</span>
    </button>
  );
}

export default QuickActionButton;