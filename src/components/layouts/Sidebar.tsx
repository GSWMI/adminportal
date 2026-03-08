import {
  CreditCard,
  LayoutDashboard,
  Ticket,
  Users,
} from "lucide-react";
import SearchField from "./SearchField";
import SidebarNavItem from "./SidebarNavItem";
import UserProfileCard from "./UserProfileCard";

function Sidebar() {
  return (
    <aside className="flex h-screen w-75 flex-col bg-[#0C2039] px-5 py-5">
      <div className="mb-12 flex justify-center">
        <div className="text-center text-white">
          <h1 className="text-[44px] font-medium leading-none tracking-tight">
            GSWMI
          </h1>
          <p className="mt-1 text-[8px] leading-none opacity-95">
            Gbenga Samuel-Wemimo Ministry International
          </p>
        </div>
      </div>

      <div className="mb-10">
        <SearchField />
      </div>

      <nav className="space-y-2">
        <SidebarNavItem label="Dashboard" icon={LayoutDashboard} to="/dashboard" />
        <SidebarNavItem label="Tickets" icon={Ticket} to="/tickets" />
        <SidebarNavItem label="Transactions" icon={CreditCard} to="/transactions" />
        <SidebarNavItem label="Users" icon={Users} to="/users" />
      </nav>

      <div className="mt-auto">
        <UserProfileCard name="Lesi" email="lesi@gswmi.com" />
      </div>
    </aside>
  );
}

export default Sidebar;