import { TicketPlus } from "lucide-react";
import PrimaryButton from "../common/PrimaryButton";

function TicketsEmptyState() {
  return (
    <div className="flex min-h-[680px] flex-col items-center justify-center">
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#F6F7F8]">
        <div className="text-[52px] text-[#D0D5DD]">🏷️</div>
      </div>

      <p className="mt-8 text-[18px] font-medium text-[#5D6470]">
        No tickets created yet
      </p>

      <div className="mt-6">
        <PrimaryButton label="Add ticket" icon={TicketPlus} />
      </div>
    </div>
  );
}

export default TicketsEmptyState;