import type { PlaceCategory } from "./place";
import { PLACE_CATEGORIES } from "./place-category";

interface PlacePinProps {
  category: PlaceCategory;
  isSelected?: boolean;
  isFaded?: boolean;
}

const PIN_OUTLINE =
  "M16 1.5C8.3 1.5 2 7.6 2 15.2 2 25 16 38.5 16 38.5S30 25 30 15.2C30 7.6 23.7 1.5 16 1.5Z";

const PIN_ICONS: Record<PlaceCategory, { paths: string[]; eye: { cx: number; cy: number } }> = {
  bungeoppang: {
    paths: [
      "M7 12c1.7-3.4 4.4-5.2 7.6-5.2 3 0 5.3 2.1 6.4 5.2-1.1 3.1-3.4 5.2-6.4 5.2-3.2 0-5.9-1.8-7.6-5.2Z",
      "M7 12 3 8.6v6.8Z",
      "M11 10.2l1.6 1.8-1.6 1.8M14 10.2l1.6 1.8-1.6 1.8",
    ],
    eye: { cx: 17.6, cy: 11 },
  },
  bangeo: {
    paths: [
      "M5 12c2.5-3.6 6-5.4 9.5-5.4 3 0 5.3 1.8 6.5 5.4-1.2 3.6-3.5 5.4-6.5 5.4-3.5 0-7-1.8-9.5-5.4Z",
      "M5 12 2 8.5M5 12l-3 3.5",
      "M15.5 9.3c.7 1.7.7 3.7 0 5.4",
    ],
    eye: { cx: 18.2, cy: 11 },
  },
};

export const PlacePin = ({ category, isSelected = false, isFaded = false }: PlacePinProps) => {
  const { paths, eye } = PIN_ICONS[category];

  return (
    <svg
      width={isSelected ? 44 : 32}
      height={isSelected ? 55 : 40}
      viewBox="0 0 32 40"
      aria-hidden="true"
      className={`${isSelected ? "drop-shadow-pin-selected" : "drop-shadow-pin"} ${isFaded ? "opacity-40" : ""}`}
    >
      <path
        d={PIN_OUTLINE}
        strokeWidth={2}
        className={`${PLACE_CATEGORIES[category].pinFillClassName} stroke-white`}
      />
      <g
        transform="translate(5 4.2) scale(0.9167)"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-white"
      >
        {paths.map((path) => (
          <path key={path} d={path} />
        ))}
        <circle cx={eye.cx} cy={eye.cy} r={0.9} stroke="none" className="fill-white" />
      </g>
    </svg>
  );
};
