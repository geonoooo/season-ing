import type { ReactNode } from "react";

interface BottomSheetProps {
  label: string;
  className?: string;
  children: ReactNode;
}

export const BottomSheet = ({ label, className = "", children }: BottomSheetProps) => (
  <section aria-label={label} className={`rounded-t-sheet bg-white shadow-sheet ${className}`}>
    <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 rounded-full bg-line" />
    {children}
  </section>
);
