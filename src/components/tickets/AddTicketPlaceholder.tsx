import { PlusSquare } from "lucide-react";

function AddTicketPlaceholder() {
  return (
    <button
      type="button"
      className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-white text-[16px] font-medium text-[#98A2B3] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition hover:bg-[#FAFAFA]"
    >
      <PlusSquare size={20} />
      <span>Add ticket</span>
    </button>
  );
}

export default AddTicketPlaceholder;