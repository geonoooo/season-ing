import type { ReactNode } from "react";

import { useSheetDrag } from "./use-sheet-drag";

interface BottomSheetProps {
  label: string;
  header: ReactNode;
  children: ReactNode;
}

export const BottomSheet = ({ label, header, children }: BottomSheetProps) => {
  const { sheetRef, headerRef, bodyRef, style, isDragging, isCollapsed, startDrag, finishSettling } =
    useSheetDrag();

  return (
    <section
      ref={sheetRef}
      aria-label={label}
      style={style}
      onTransitionEnd={finishSettling}
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-t-sheet bg-white shadow-sheet ${
        isDragging ? "" : "transition-[height] duration-200 ease-out"
      }`}
    >
      <div
        ref={headerRef}
        onPointerDown={startDrag}
        className="shrink-0 cursor-grab touch-none select-none"
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 rounded-full bg-line" />
        {header}
      </div>
      <div
        ref={bodyRef}
        inert={isCollapsed}
        className={isCollapsed ? "h-0 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}
      >
        {children}
      </div>
    </section>
  );
};
