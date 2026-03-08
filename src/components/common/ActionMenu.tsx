import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ActionMenuItem = {
  label: string;
  onClick?: () => void;
  destructive?: boolean;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  align?: "left" | "right";
};

function ActionMenu({ items, align = "right" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-[10px] p-2 text-[#98A2B3] transition hover:bg-[#F8FAFC]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open ? (
        <div
          className={`absolute top-[calc(100%+8px)] z-50 min-w-42 rounded-[14px] border border-[#EAECF0] bg-white p-2 shadow-[0_12px_24px_rgba(16,24,40,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-[10px] px-4 py-3 text-left text-[16px] font-medium transition ${
                item.destructive
                  ? "text-[#D92D20] hover:bg-[#FEF3F2]"
                  : "text-[#1F2430] hover:bg-[#F9FAFB]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ActionMenu;