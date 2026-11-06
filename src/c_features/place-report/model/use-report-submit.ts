import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PlaceCategory } from "@/d_shared/place";

import { dailyLimitCodeOf, type DailyLimitCode } from "../api/place-report.api";

type ReportStatus = "idle" | "submitting" | "failed" | DailyLimitCode;

const reportErrorMessage = (status: ReportStatus): string | null => {
  if (status === "daily_report_limit") return "오늘은 제보를 3번 다 했어요. 내일 다시 제보해 주세요";
  if (status === "daily_save_limit") return "오늘은 가게를 30곳 다 저장했어요. 내일 다시 해주세요";
  if (status === "failed") return "제보하지 못했어요. 다시 시도해 주세요";
  return null;
};

export const useReportSubmit = (category: PlaceCategory) => {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>("idle");

  const submit = async (report: () => Promise<unknown>) => {
    setStatus("submitting");
    try {
      await report();
      router.push(`/?category=${category}`);
    } catch (error) {
      setStatus(dailyLimitCodeOf(error) ?? "failed");
    }
  };

  return { isSubmitting: status === "submitting", errorMessage: reportErrorMessage(status), submit };
};
