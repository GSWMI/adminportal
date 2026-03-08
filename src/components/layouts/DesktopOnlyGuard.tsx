import type { ReactNode } from "react";
import { Monitor } from "lucide-react";

type DesktopOnlyGuardProps = {
  children: ReactNode;
};

function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  return (
    <>
      <div className="hidden xl:block">
        {children}
      </div>

      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-6 xl:hidden">
        <div className="max-w-105 rounded-[20px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FB]">
            <Monitor size={28} className="text-[#3867D6]" />
          </div>

          <h2 className="mt-5 text-[24px] font-semibold text-[#1F2430]">
            View on a laptop
          </h2>

          <p className="mt-3 text-[16px] leading-7 text-[#5D6470]">
            This admin dashboard is only available on desktop screens. Please open it on a laptop or larger display.
          </p>
        </div>
      </div>
    </>
  );
}

export default DesktopOnlyGuard;