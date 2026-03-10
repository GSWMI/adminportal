import { useEffect, type MouseEvent, type ReactNode } from "react";

type ModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

function ModalShell({
  children,
  onClose,
  maxWidthClassName = "max-w-[810px]",
}: ModalShellProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidthClassName} overflow-y-auto rounded-[18px] bg-white p-10 shadow-[0_24px_64px_rgba(0,0,0,0.28)]`}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
}

export default ModalShell;