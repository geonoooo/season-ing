import { LocateIcon } from "./icons";

interface LocateButtonProps {
  onClick: () => void;
  className?: string;
}

export const LocateButton = ({ onClick, className = "" }: LocateButtonProps) => (
  <button
    type="button"
    aria-label="내 위치로 이동"
    onClick={onClick}
    className={`flex size-touch items-center justify-center rounded-full bg-white text-ink shadow-overlay ${className}`}
  >
    <LocateIcon />
  </button>
);
