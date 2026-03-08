type TablePaginationProps = {
  pageLabel: string;
  disablePrevious?: boolean;
  disableNext?: boolean;
};

function TablePagination({
  pageLabel,
  disablePrevious = false,
  disableNext = false,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#EAECF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[16px] font-medium text-[#4B5563]">{pageLabel}</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disablePrevious}
          className={`rounded-[10px] border px-4 py-2 text-[16px] font-semibold ${
            disablePrevious
              ? "cursor-not-allowed border-[#E5E7EB] bg-white text-[#B0B7C3]"
              : "border-[#D0D5DD] bg-white text-[#4B5563]"
          }`}
        >
          Previous
        </button>

        <button
          type="button"
          disabled={disableNext}
          className={`rounded-[10px] border px-4 py-2 text-[16px] font-semibold ${
            disableNext
              ? "cursor-not-allowed border-[#E5E7EB] bg-white text-[#B0B7C3]"
              : "border-[#D0D5DD] bg-white text-[#4B5563]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TablePagination;