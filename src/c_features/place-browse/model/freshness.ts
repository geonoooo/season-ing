import type { Place } from "@/d_shared/place";

type Freshness = "fresh" | "stale" | "hidden";

const DAY_MS = 24 * 60 * 60 * 1000;
const FRESH_DAYS = 7;
const HIDDEN_AFTER_DAYS = 30;
const HIDDEN_GONE_COUNT = 3;

// 경과 시간이 아니라 한국 날짜로 세야 어제 저녁에 확인한 곳이 "오늘"로 보이지 않는다
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const kstDayNumber = (date: Date): number => Math.floor((date.getTime() + KST_OFFSET_MS) / DAY_MS);

const daysSince = (isoDate: string, now: Date): number =>
  kstDayNumber(now) - kstDayNumber(new Date(isoDate));

export const formatDaysAgo = (isoDate: string, now: Date): string => {
  const days = daysSince(isoDate, now);
  return days < 1 ? "오늘" : `${days}일 전`;
};

export const classifyFreshness = (place: Place, now: Date): Freshness => {
  if (place.kind === "shop") return "fresh";
  const days = daysSince(place.lastConfirmedAt, now);
  if (days > HIDDEN_AFTER_DAYS || place.goneCount >= HIDDEN_GONE_COUNT) return "hidden";
  return days <= FRESH_DAYS ? "fresh" : "stale";
};
