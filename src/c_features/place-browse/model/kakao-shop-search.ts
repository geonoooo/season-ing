import type { PlaceCategory, Shop } from "@/d_shared/place";

export type ShopSearchStatus = "loading" | "done" | "failed";

export const SEARCH_KEYWORDS: Record<PlaceCategory, string[]> = {
  bungeoppang: ["붕어빵"],
  bangeo: ["방어", "대방어"],
};

export const uniqueShops = (shops: readonly Shop[]): Shop[] => [
  ...new Map(shops.map((shop) => [shop.kakaoPlaceId, shop])).values(),
];

export const emptyListMessage = (status: ShopSearchStatus): string => {
  if (status === "loading") return "이 지역의 가게를 찾고 있어요";
  if (status === "failed") return "가게 정보를 불러오지 못했어요";
  return "이 지역에는 아직 없어요";
};
