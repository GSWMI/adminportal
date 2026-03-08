import { Search } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  className?: string;
};

function SearchInput({
  placeholder = "Search",
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex h-[44px] items-center gap-3 rounded-[10px] border border-[#D0D5DD] bg-white px-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${className}`}
    >
      <Search size={18} className="text-[#98A2B3]" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent text-[16px] text-[#1F2430] outline-none placeholder:text-[#98A2B3]"
      />
    </div>
  );
}

export default SearchInput;