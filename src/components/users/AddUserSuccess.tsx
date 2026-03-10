import { ArrowLeft, Copy, UserRoundPlus } from "lucide-react";

type AddUserSuccessProps = {
  username: string;
  password: string;
  onAddAnother: () => void;
  onBackToDashboard: () => void;
};

function AddUserSuccess({
  username,
  password,
  onAddAnother,
  onBackToDashboard,
}: AddUserSuccessProps) {
  return (
    <div className="mx-auto w-full max-w-87.5">
      <h2 className="text-center text-[18px] font-semibold text-[#111111]">
        User added successfully
      </h2>

      <div className="mt-10 rounded-xl bg-[#F9FAFB] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[16px] font-semibold text-[#374151]">
            Username
          </span>
          <span className="text-[16px] font-semibold text-[#9CA3AF]">
            {username}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-[16px] font-semibold text-[#374151]">
            Password
          </span>
          <span className="text-[16px] font-semibold text-[#9CA3AF]">
            {password}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mx-auto mt-4 flex items-center gap-2 text-[16px] font-semibold text-[#2F55D4]"
      >
        <Copy size={18} />
        Copy
      </button>

      <div className="my-5 border-t border-[#E5E7EB]" />

      <div>
        <label className="mb-2 block text-[14px] font-medium text-[#374151]">
          Share via email
        </label>

        <div className="flex h-10 overflow-hidden rounded-[10px] border border-[#D1D5DB] bg-white">
          <input
            type="email"
            placeholder="Enter email address of recipient"
            className="flex-1 border-none bg-transparent px-4 text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />

          <button
            type="button"
            className="h-full bg-[#3867D6] px-5 text-[16px] font-semibold text-white"
          >
            Send
          </button>
        </div>
      </div>

      <div className="my-10 border-t border-[#E5E7EB]" />

      <button
        type="button"
        onClick={onAddAnother}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white text-[16px] font-semibold text-[#4B5563] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
      >
        <UserRoundPlus size={18} />
        Add another user
      </button>

      <button
        type="button"
        onClick={onBackToDashboard}
        className="mx-auto mt-8 flex items-center gap-2 text-[16px] font-semibold text-[#4B5563]"
      >
        <ArrowLeft size={18} />
        Back to dashboard
      </button>
    </div>
  );
}

export default AddUserSuccess;