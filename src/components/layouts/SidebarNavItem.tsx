import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarNavItemProps = {
  label: string;
  icon: LucideIcon;
  to: string;
};

function SidebarNavItem({
  label,
  icon: Icon,
  to,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition ${
          isActive
            ? "bg-[#1D477F] text-white"
            : "bg-transparent text-white/90 hover:bg-white/5"
        }`
      }
    >
      <Icon size={20} className="shrink-0 text-[#2F8CFF]" />
      <span className="text-[15px] font-medium">{label}</span>
    </NavLink>
  );
}

export default SidebarNavItem;