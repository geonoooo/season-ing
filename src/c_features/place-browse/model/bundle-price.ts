import { formatNumber } from "@/d_shared/format";
import type { Bundle } from "@/d_shared/place";

export const pricePerPiece = ({ count, price }: Bundle): number => price / count;

export const formatBundlePrice = ({ count, price }: Bundle): string =>
  `${count}개 ${formatNumber(price)}원`;
