import { Search } from "lucide-react";

function SearchField() {
  return (
    <div className="flex h-[40px] items-center gap-2 rounded-[10px] border border-[#1E4D86] bg-[#123461] px-3">
      <Search size={18} className="text-[#2F8CFF]" />
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
      />
    </div>
  );
}

export default SearchField;