import { useState, type RefObject } from "react";

import { searchKakaoPlaces } from "@/d_shared/kakao-map";

type LocationSearchStatus = "idle" | "searching" | "notFound" | "failed";

export const locationSearchMessage = (status: LocationSearchStatus): string | null => {
  if (status === "notFound") return "찾는 곳이 없어요";
  if (status === "failed") return "검색하지 못했어요. 다시 시도해 주세요";
  return null;
};

export const useLocationSearch = (mapRef: RefObject<kakao.maps.Map | null>) => {
  const [status, setStatus] = useState<LocationSearchStatus>("idle");

  // 지도를 옮기기만 하면 idle 이벤트에서 그 영역의 장소를 다시 찾는다
  const moveToLocation = async (keyword: string) => {
    const query = keyword.trim();
    const map = mapRef.current;
    if (!query || !map) return;
    setStatus("searching");
    try {
      const [bestMatch] = await searchKakaoPlaces(query);
      if (!bestMatch) {
        setStatus("notFound");
        return;
      }
      map.setCenter(new kakao.maps.LatLng(Number(bestMatch.y), Number(bestMatch.x)));
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  };

  return { status, moveToLocation };
};
