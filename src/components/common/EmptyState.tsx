import { FileText } from "lucide-react";

type EmptyStateProps = {
  minHeight?: string;
};

function EmptyState({ minHeight = "min-h-[420px]" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight}`}>
      <div className="flex h-19.5 w-19.5 items-center justify-center rounded-full bg-[#F3F4F6]">
        <FileText size={34} className="text-[#C4C7CE]" />
      </div>
      <p className="mt-5 text-[18px] font-medium text-[#5D6470]">
        No records yet.
      </p>
    </div>
  );
}

export default EmptyState;