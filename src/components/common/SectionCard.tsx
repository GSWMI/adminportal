import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  allowOverflow?: boolean;
};

function SectionCard({
  title,
  action,
  children,
  bodyClassName = "",
  className = "",
  allowOverflow = false,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-[#D9D9D9] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        allowOverflow ? "overflow-visible" : "overflow-hidden"
      } ${className}`}
    >
      {title || action ? (
        <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-3">
          <h3 className="text-[16px] font-semibold text-[#1F2430]">{title}</h3>
          {action}
        </div>
      ) : null}

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export default SectionCard;