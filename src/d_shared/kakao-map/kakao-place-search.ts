import type { PlaceCategory, Shop } from "@/d_shared/place";

type KakaoPlace = kakao.maps.services.PlacesSearchResultItem;

export const searchKakaoPlaces = (
  keyword: string,
  options?: kakao.maps.services.PlacesSearchOptions,
): Promise<KakaoPlace[]> =>
  new Promise((resolve, reject) => {
    const collected: KakaoPlace[] = [];
    new kakao.maps.services.Places().keywordSearch(
      keyword,
      (results, status, pagination) => {
        if (status === kakao.maps.services.Status.ERROR) {
          reject(new Error(`카카오 장소 검색 실패: ${keyword}`));
          return;
        }
        if (status === kakao.maps.services.Status.OK) collected.push(...results);
        if (status === kakao.maps.services.Status.OK && pagination.hasNextPage) pagination.nextPage();
        else resolve(collected);
      },
      options,
    );
  });

const lastCategorySegment = (categoryName: string): string =>
  categoryName.split(">").at(-1)?.trim() ?? categoryName;

export const toShop = (place: KakaoPlace, category: PlaceCategory): Shop => ({
  id: place.id,
  kind: "shop",
  category,
  position: { lat: Number(place.y), lng: Number(place.x) },
  address: place.road_address_name || place.address_name,
  name: place.place_name,
  kakaoPlaceId: place.id,
  kakaoCategory: lastCategorySegment(place.category_name),
  phone: place.phone || null,
  // 좋아요·태그는 우리 서비스에 쌓이는 값이라 카카오 검색 결과에는 없다
  likeCount: 0,
  isLiked: false,
  tags: [],
  savedPlaceId: null,
});
