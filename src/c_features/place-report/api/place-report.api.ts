import type { Coordinates } from "@/d_shared/geo";
import type { Bundle, StallCategory, Weekday } from "@/d_shared/place";
import { signedInSupabase } from "@/d_shared/supabase";

interface StallReport {
  category: StallCategory;
  position: Coordinates;
  address: string;
  bundle: Bundle;
  openDays: Weekday[];
}

export const reportStall = async ({ category, position, address, bundle, openDays }: StallReport) => {
  const supabase = await signedInSupabase();
  const { error } = await supabase.rpc("report_stall", {
    p_category: category,
    p_lat: position.lat,
    p_lng: position.lng,
    p_address: address,
    p_bundle_count: bundle.count,
    p_bundle_price: bundle.price,
    p_open_days: openDays,
  });
  if (error) throw error;
};

export type DailyLimitCode = "daily_report_limit" | "daily_save_limit";

const DAILY_LIMIT_CODES: readonly DailyLimitCode[] = ["daily_report_limit", "daily_save_limit"];

// report_stall·save_shop DB 함수가 하루 제한을 넘기면 이 메시지로 예외를 던진다
export const dailyLimitCodeOf = (error: unknown): DailyLimitCode | null => {
  const message = error instanceof Object && "message" in error ? error.message : null;
  return DAILY_LIMIT_CODES.find((code) => code === message) ?? null;
};
