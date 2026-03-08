type StatCardProps = {
  title: string;
  value: number;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="min-h-[104px] rounded-[14px] border border-[#D9D9D9] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <p className="text-[16px] font-medium text-[#5D6470]">{title}</p>
      <h3 className="mt-3 text-[42px] font-semibold leading-none text-[#1F2430]">
        {value}
      </h3>
    </div>
  );
}

export default StatCard;