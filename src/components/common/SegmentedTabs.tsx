type TabItem = {
  label: string;
  value: string;
};

type SegmentedTabsProps = {
  items: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
};

function SegmentedTabs({
  items,
  activeValue,
  onChange,
}: SegmentedTabsProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-[10px] border border-[#D0D5DD] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      {items.map((item) => {
        const isActive = item.value === activeValue;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`h-[38px] px-4 text-[16px] font-semibold transition ${
              isActive
                ? "bg-[#E9EEF5] text-[#2A2F3A]"
                : "bg-white text-[#4B5563]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;