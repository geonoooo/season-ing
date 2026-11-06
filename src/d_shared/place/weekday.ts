import type { Weekday } from "./place";

export const WEEKDAYS: readonly { key: Weekday; label: string }[] = [
  { key: "mon", label: "월" },
  { key: "tue", label: "화" },
  { key: "wed", label: "수" },
  { key: "thu", label: "목" },
  { key: "fri", label: "금" },
  { key: "sat", label: "토" },
  { key: "sun", label: "일" },
];

export const toggleWeekday = (days: readonly Weekday[], day: Weekday): Weekday[] => {
  const toggled = days.includes(day) ? days.filter((selected) => selected !== day) : [...days, day];
  return WEEKDAYS.map(({ key }) => key).filter((key) => toggled.includes(key));
};
