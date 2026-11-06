import { useMemo, useState } from "react";

import { useMyPositionMap } from "@/d_shared/kakao-map";
import type { PlaceCategory } from "@/d_shared/place";

import { listPlaces, SORT_OPTIONS, type SortKey } from "./list-places";
import { useKakaoShops } from "./use-kakao-shops";

interface UsePlaceBrowseParams {
  category: PlaceCategory;
  now: string;
}

export const usePlaceBrowse = ({ category, now }: UsePlaceBrowseParams) => {
  const [sortKey, setSortKey] = useState<SortKey>(SORT_OPTIONS[category][0].key);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const { myPosition, mapRef, panToMyPosition } = useMyPositionMap();
  const { shops, status: searchStatus, searchArea } = useKakaoShops(category);

  const nowDate = useMemo(() => new Date(now), [now]);
  const listedPlaces = useMemo(
    () => listPlaces({ places: shops, category, sortKey, origin: myPosition, now: nowDate }),
    [shops, category, sortKey, myPosition, nowDate],
  );
  const selectedPlace = listedPlaces.find((place) => place.id === selectedPlaceId) ?? null;

  return {
    sortKey,
    changeSort: setSortKey,
    listedPlaces,
    searchArea,
    searchStatus,
    selectedPlace,
    selectPlace: setSelectedPlaceId,
    closeDetail: () => setSelectedPlaceId(null),
    myPosition,
    mapRef,
    panToMyPosition,
    now: nowDate,
  };
};
