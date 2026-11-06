import { formatNumber } from "@/d_shared/format";

export const digitsOnly = (text: string): string => text.replace(/\D/g, "");

export const formatDigits = (digits: string): string => (digits ? formatNumber(Number(digits)) : "");
