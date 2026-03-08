import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";

type LoginInputProps = {
  label: string;
  type?: "text" | "password";
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  isFocused?: boolean;
};

function LoginInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  isFocused = false,
}: LoginInputProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-[14px] font-medium text-[#374151]">
        {label}
      </label>

      <div
        className={`flex h-10 w-full items-center rounded-lg border bg-white px-3 transition ${
          isFocused
            ? "border-[#3867D6] shadow-[0_0_0_1px_#3867D6]"
            : "border-[#D1D5DB]"
        }`}
      >
        {LeftIcon ? <LeftIcon size={18} className="mr-2 text-[#9CA3AF]" /> : null}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 border-none bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
        />

        {RightIcon ? (
          <button
            type="button"
            onClick={onRightIconClick}
            className="ml-2 cursor-pointer border-none bg-transparent p-0 text-[#9CA3AF] outline-none"
          >
            <RightIcon size={18} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default LoginInput;