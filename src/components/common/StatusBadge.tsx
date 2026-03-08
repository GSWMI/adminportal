type StatusTone = "gray" | "green" | "orange" | "red" | "blue";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const toneStyles: Record<StatusTone, string> = {
  gray: "border-[#D0D5DD] bg-white text-[#4B5563]",
  green: "border-[#D0D5DD] bg-white text-[#4B5563]",
  orange: "border-[#D0D5DD] bg-white text-[#4B5563]",
  red: "border-[#D0D5DD] bg-white text-[#4B5563]",
  blue: "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]",
};

const dotStyles: Record<StatusTone, string> = {
  gray: "bg-[#98A2B3]",
  green: "bg-[#12B76A]",
  orange: "bg-[#F79009]",
  red: "bg-[#F04438]",
  blue: "bg-[#175CD3]",
};

function StatusBadge({ label, tone = "gray" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[14px] font-medium ${toneStyles[tone]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotStyles[tone]}`} />
      {label}
    </span>
  );
}

export default StatusBadge;