import type { Place, PlaceCategory, Shop } from "@/d_shared/place";

export type AreaSearchStatus = "loading" | "done" | "failed";

export const SEARCH_KEYWORDS: Record<PlaceCategory, string[]> = {
  // 붕어빵은 노점이 카카오맵에 거의 없어서 카카오 검색 없이 제보만 보여준다
  bungeoppang: [],
  bangeo: ["방어", "대방어"],
};

export const uniqueShops = (shops: readonly Shop[]): Shop[] => [
  ...new Map(shops.map((shop) => [shop.kakaoPlaceId, shop])).values(),
];

// DB의 가게 이름·주소·위치는 브라우저가 보낸 값이라 믿지 않고, 카카오 값 위에 좋아요·태그만 얹는다
export const overlaySavedShops = (
  kakaoShops: readonly Shop[],
  savedPlaces: readonly Place[],
): Shop[] => {
  const savedShopsById = new Map(
    savedPlaces.flatMap((place) => (place.kind === "shop" ? [[place.id, place] as const] : [])),
  );
  return kakaoShops.map((shop) => {
    const savedShop = savedShopsById.get(shop.id);
    if (!savedShop) return shop;
    return {
      ...shop,
      likeCount: savedShop.likeCount,
      isLiked: savedShop.isLiked,
      tags: savedShop.tags,
      savedPlaceId: savedShop.savedPlaceId,
    };
  });
};

export const hasSavedOnlyToggle = (category: PlaceCategory): boolean =>
  SEARCH_KEYWORDS[category].length > 0;

export const emptyListMessage = (status: AreaSearchStatus, isSavedOnly: boolean): string => {
  if (status === "loading") return "이 지역의 가게를 찾고 있어요";
  if (status === "failed") return "가게 정보를 불러오지 못했어요";
  return isSavedOnly ? "이 지역에 저장한 곳이 아직 없어요" : "이 지역에는 아직 없어요";
};
