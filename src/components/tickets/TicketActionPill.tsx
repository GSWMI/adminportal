import { ArrowRight } from "lucide-react";

type TicketActionPillProps = {
  label: string;
};

function TicketActionPill({ label }: TicketActionPillProps) {
  return (
    <button
      type="button"
      className="inline-flex h-12 items-center gap-3 rounded-[14px] bg-[#EEF3FB] px-4 text-[16px] font-semibold text-[#3867D6] transition hover:bg-[#E5EDF9]"
    >
      <span>{label}</span>
      <ArrowRight size={18} />
    </button>
  );
}

export default TicketActionPill;