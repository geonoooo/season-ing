import { SavedPinIcon } from "@/d_shared/ui";

interface SavedOnlyToggleProps {
  isSavedOnly: boolean;
  onToggle: () => void;
}

export const SavedOnlyToggle = ({ isSavedOnly, onToggle }: SavedOnlyToggleProps) => (
  <button
    type="button"
    aria-pressed={isSavedOnly}
    onClick={onToggle}
    className={`flex h-12 items-center gap-1.5 rounded-full pl-3.5 pr-4.5 text-body font-bold shadow-overlay ${
      isSavedOnly ? "bg-ink text-white" : "bg-white text-ink"
    }`}
  >
    <SavedPinIcon isFilled={isSavedOnly} />
    저장한 곳
  </button>
);
