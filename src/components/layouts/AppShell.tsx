import type { ReactNode } from "react";
// import AppFooter from "./AppFooter";
import Sidebar from "./Sidebar";
import DesktopOnlyGuard from "./DesktopOnlyGuard";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
   <DesktopOnlyGuard>
     <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">
      <div className="h-screen shrink-0">
        <Sidebar />
      </div>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto w-full max-w-280">{children}</div>
           {/* <AppFooter /> */}
        </main>

       
      </div>
    </div>
   </DesktopOnlyGuard>
  );
}

export default AppShell;