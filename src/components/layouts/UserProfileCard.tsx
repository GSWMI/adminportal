import { ChevronsUpDown } from "lucide-react";

type UserProfileCardProps = {
  name: string;
  email: string;
  imageUrl?: string;
};

function UserProfileCard({
  name,
  email,
  imageUrl = "https://i.pravatar.cc/80?img=12",
}: UserProfileCardProps) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#184A87] bg-[#0C2039] px-3 py-2">
      <div className="flex items-center gap-3">
        <img
          src={imageUrl}
          alt={name}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div>
          <p className="text-[15px] font-semibold text-white">{name}</p>
          <p className="text-[14px] text-white/60">{email}</p>
        </div>
      </div>

      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#123461] text-[#2F8CFF]"
      >
        <ChevronsUpDown size={16} />
      </button>
    </div>
  );
}

export default UserProfileCard;