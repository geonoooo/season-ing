import { useCallback, useMemo, useRef, useState } from "react";

import { searchKakaoPlaces, toShop } from "@/d_shared/kakao-map";
import type { Place, PlaceCategory, Shop } from "@/d_shared/place";

import { placesInArea, type AreaBounds } from "../api/place-browse.api";
import {
  overlaySavedShops,
  SEARCH_KEYWORDS,
  uniqueShops,
  type AreaSearchStatus,
} from "./kakao-shop-search";

const toAreaBounds = (bounds: kakao.maps.LatLngBounds): AreaBounds => {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  return {
    southWest: { lat: southWest.getLat(), lng: southWest.getLng() },
    northEast: { lat: northEast.getLat(), lng: northEast.getLng() },
  };
};

export const useAreaPlaces = (category: PlaceCategory) => {
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [kakaoShops, setKakaoShops] = useState<Shop[]>([]);
  const [status, setStatus] = useState<AreaSearchStatus>("loading");
  const latestSearchId = useRef(0);
  const latestArea = useRef<AreaBounds | null>(null);

  const searchArea = useCallback(async (bounds: kakao.maps.LatLngBounds) => {
    const area = toAreaBounds(bounds);
    latestArea.current = area;
    const searchId = ++latestSearchId.current;
    setStatus("loading");
    try {
      const [saved, resultsByKeyword] = await Promise.all([
        placesInArea(category, area),
        Promise.all(
          SEARCH_KEYWORDS[category].map((keyword) => searchKakaoPlaces(keyword, { bounds })),
        ),
      ]);
      if (searchId !== latestSearchId.current) return;
      setSavedPlaces(saved);
      setKakaoShops(uniqueShops(resultsByKeyword.flat().map((place) => toShop(place, category))));
      setStatus("done");
    } catch {
      if (searchId !== latestSearchId.current) return;
      setSavedPlaces([]);
      setKakaoShops([]);
      setStatus("failed");
    }
  }, [category]);

  // 좋아요·태그를 바꾼 뒤에는 카카오 검색은 그대로 두고 우리 DB 값만 다시 읽는다
  const refreshSavedPlaces = useCallback(async () => {
    if (!latestArea.current) return;
    const searchId = latestSearchId.current;
    const saved = await placesInArea(category, latestArea.current);
    if (searchId === latestSearchId.current) setSavedPlaces(saved);
  }, [category]);

  const kakaoPlaces = useMemo(
    () => overlaySavedShops(kakaoShops, savedPlaces),
    [kakaoShops, savedPlaces],
  );

  return { savedPlaces, kakaoPlaces, status, searchArea, refreshSavedPlaces };
};
