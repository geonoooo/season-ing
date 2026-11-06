import { useState } from "react";

import type { Coordinates } from "@/d_shared/geo";
import { searchKakaoPlaces, toShop } from "@/d_shared/kakao-map";
import type { PlaceCategory, Shop } from "@/d_shared/place";

type SearchStatus = "idle" | "searching" | "done" | "failed";

export const describeSearch = (status: SearchStatus, resultCount: number): string | null => {
  if (status === "searching") return "검색하고 있어요";
  if (status === "failed") return "검색하지 못했어요. 다시 시도해 주세요";
  if (status === "done") return resultCount ? `검색 결과 ${resultCount}곳` : "검색 결과가 없어요";
  return null;
};

export const useShopSearch = (category: PlaceCategory) => {
  const [candidates, setCandidates] = useState<Shop[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");

  const search = async (keyword: string, origin: Coordinates | null) => {
    const query = keyword.trim();
    if (!query) return;
    setStatus("searching");
    try {
      const results = await searchKakaoPlaces(
        query,
        origin
          ? {
              location: new kakao.maps.LatLng(origin.lat, origin.lng),
              sort: kakao.maps.services.SortBy.DISTANCE,
            }
          : undefined,
      );
      setCandidates(results.map((place) => toShop(place, category)));
      setStatus("done");
    } catch {
      setCandidates([]);
      setStatus("failed");
    }
  };

  return { candidates, status, search };
};
