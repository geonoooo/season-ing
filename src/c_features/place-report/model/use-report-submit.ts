import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PlaceCategory } from "@/d_shared/place";

import { isDailyReportLimitError } from "../api/place-report.api";

type ReportStatus = "idle" | "submitting" | "dailyLimit" | "failed";

const reportErrorMessage =(status: ReportStatus): string | null => {
  if (status === "dailyLimit") return "오늘은 제보를 3번 다 했어요. 내일 다시 제보해 주세요";
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
      setStatus(isDailyReportLimitError(error) ? "dailyLimit" : "failed");
    }
  };

  return { isSubmitting: status === "submitting", errorMessage: reportErrorMessage(status), submit };
};
