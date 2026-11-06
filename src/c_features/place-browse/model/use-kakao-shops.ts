import { useCallback, useRef, useState } from "react";

import { searchKakaoPlaces, toShop } from "@/d_shared/kakao-map";
import type { PlaceCategory, Shop } from "@/d_shared/place";

import { SEARCH_KEYWORDS, uniqueShops, type ShopSearchStatus } from "./kakao-shop-search";

export const useKakaoShops = (category: PlaceCategory) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [status, setStatus] = useState<ShopSearchStatus>("loading");
  const latestSearchId = useRef(0);

  const searchArea = useCallback(async (bounds: kakao.maps.LatLngBounds) => {
    const searchId = ++latestSearchId.current;
    setStatus("loading");
    try {
      const resultsByKeyword = await Promise.all(
        SEARCH_KEYWORDS[category].map((keyword) => searchKakaoPlaces(keyword, { bounds })),
      );
      if (searchId !== latestSearchId.current) return;
      setShops(uniqueShops(resultsByKeyword.flat().map((place) => toShop(place, category))));
      setStatus("done");
    } catch {
      if (searchId !== latestSearchId.current) return;
      setShops([]);
      setStatus("failed");
    }
  }, [category]);

  return { shops, status, searchArea };
};
