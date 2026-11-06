import { useMemo, useState } from "react";

import { useMyPositionMap } from "@/d_shared/kakao-map";
import type { PlaceCategory } from "@/d_shared/place";

import { emptyListMessage, hasSavedOnlyToggle } from "./kakao-shop-search";
import { listPlaces, SORT_OPTIONS, type SortKey } from "./list-places";
import { useAreaPlaces } from "./use-area-places";
import { useLocationSearch } from "./use-location-search";
import { usePlaceActions } from "./use-place-actions";

interface UsePlaceBrowseParams {
  category: PlaceCategory;
  now: string;
}

export const usePlaceBrowse = ({ category, now }: UsePlaceBrowseParams) => {
  const [sortKey, setSortKey] = useState<SortKey>(SORT_OPTIONS[category][0].key);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const { myPosition, mapRef, panToMyPosition } = useMyPositionMap();
  const [isSavedOnly, setIsSavedOnly] = useState(false);
  const { savedPlaces, kakaoPlaces, status, searchArea, refreshSavedPlaces } =
    useAreaPlaces(category);
  const placeActions = usePlaceActions(refreshSavedPlaces);
  const locationSearch = useLocationSearch(mapRef);

  const hasToggle = hasSavedOnlyToggle(category);
  // 카카오 검색이 없는 음식(붕어빵)은 저장한 곳이 곧 전체다
  const shownPlaces = isSavedOnly || !hasToggle ? savedPlaces : kakaoPlaces;
  const nowDate = useMemo(() => new Date(now), [now]);
  const listedPlaces = useMemo(
    () => listPlaces({ places: shownPlaces, category, sortKey, origin: myPosition, now: nowDate }),
    [shownPlaces, category, sortKey, myPosition, nowDate],
  );
  const selectedPlace = listedPlaces.find((place) => place.id === selectedPlaceId) ?? null;

  return {
    sortKey,
    changeSort: setSortKey,
    hasSavedOnlyToggle: hasToggle,
    isSavedOnly,
    toggleSavedOnly: () => setIsSavedOnly((savedOnly) => !savedOnly),
    listedPlaces,
    placeActions,
    locationSearch,
    searchArea,
    emptyMessage: emptyListMessage(status, isSavedOnly),
    selectedPlace,
    selectPlace: setSelectedPlaceId,
    closeDetail: () => setSelectedPlaceId(null),
    myPosition,
    mapRef,
    panToMyPosition,
    now: nowDate,
  };
};
