import { WEEKDAYS, type Weekday } from "@/d_shared/place";

interface WeekdayTogglesProps {
  selectedDays: Weekday[];
  onToggle: (day: Weekday) => void;
}

export const WeekdayToggles = ({ selectedDays, onToggle }: WeekdayTogglesProps) => (
  <div className="mt-2.5 grid grid-cols-7 gap-px overflow-hidden rounded-field border border-line bg-line">
    {WEEKDAYS.map(({ key, label }) => {
      const isSelected = selectedDays.includes(key);
      return (
        <button
          key={key}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onToggle(key)}
          className={`h-12 text-body ${isSelected ? "bg-ink font-bold text-white" : "bg-white font-medium text-ink"}`}
        >
          {label}
        </button>
      );
    })}
  </div>
);
