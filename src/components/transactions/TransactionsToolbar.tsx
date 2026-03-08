import { CalendarDays, Search, SlidersHorizontal } from "lucide-react";

function TransactionsToolbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-[#EAECF0] px-5 py-3 xl:flex-row xl:items-center xl:justify-between">
      <button
        type="button"
        className="inline-flex h-10 w-fit items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[16px] font-semibold text-[#4B5563] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
      >
        <CalendarDays size={18} className="text-[#98A2B3]" />
        Jan 10, 2025 – Jan 16, 2025
      </button>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] lg:w-72.5">
          <Search size={18} className="text-[#98A2B3]" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-[16px] text-[#1F2430] outline-none placeholder:text-[#98A2B3]"
          />
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[16px] font-semibold text-[#4B5563] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
        >
          <SlidersHorizontal size={18} className="text-[#98A2B3]" />
          Filters
        </button>
      </div>
    </div>
  );
}

export default TransactionsToolbar;