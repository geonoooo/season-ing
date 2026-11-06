const STROKE_ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const CloseIcon = () => (
  <svg width={22} height={22} {...STROKE_ICON}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const LocateIcon = () => (
  <svg width={22} height={22} {...STROKE_ICON}>
    <circle cx={12} cy={12} r={6.5} />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    <circle cx={12} cy={12} r={2} fill="currentColor" stroke="none" />
  </svg>
);

export const PlusIcon = () => (
  <svg width={18} height={18} {...STROKE_ICON} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

interface HeartIconProps {
  isFilled?: boolean;
}

export const HeartIcon = ({ isFilled = false }: HeartIconProps) => (
  <svg width={18} height={18} {...STROKE_ICON} fill={isFilled ? "currentColor" : "none"}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

interface SavedPinIconProps {
  isFilled?: boolean;
}

export const SavedPinIcon = ({ isFilled = false }: SavedPinIconProps) => (
  <svg width={20} height={20} {...STROKE_ICON}>
    <path d="M12 21.5s-7-6-7-11.6a7 7 0 0 1 14 0c0 5.6-7 11.6-7 11.6Z" />
    <path
      d="M12 12.8c-2.2-1.4-3.3-2.6-3.3-3.7a1.65 1.65 0 0 1 3.3-.5 1.65 1.65 0 0 1 3.3.5c0 1.1-1.1 2.3-3.3 3.7Z"
      strokeWidth={1.6}
      fill={isFilled ? "currentColor" : "none"}
    />
  </svg>
);

export const SearchIcon = () => (
  <svg width={20} height={20} {...STROKE_ICON}>
    <circle cx={11} cy={11} r={6.5} />
    <path d="M16 16l4.5 4.5" />
  </svg>
);
