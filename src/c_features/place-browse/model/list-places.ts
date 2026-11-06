import { distanceInMeters, type Coordinates } from "@/d_shared/geo";
import type { Place, PlaceCategory } from "@/d_shared/place";

import { pricePerPiece } from "./bundle-price";
import { classifyFreshness } from "./freshness";

export type SortKey = "price" | "likes" | "distance";

export const SORT_OPTIONS: Record<PlaceCategory, readonly { key: SortKey; label: string }[]> = {
  bungeoppang: [
    { key: "price", label: "가격순" },
    { key: "likes", label: "좋아요순" },
  ],
  bangeo: [
    { key: "likes", label: "좋아요순" },
    { key: "distance", label: "거리순" },
  ],
};

const piecePriceOf = (place: Place) =>
  place.kind === "stall" ? pricePerPiece(place.bundle) : Number.POSITIVE_INFINITY;

export const sortPlaces = (
  places: readonly Place[],
  sortKey: SortKey,
  origin: Coordinates | null,
): Place[] => {
  const sorted = [...places];
  if (sortKey === "price") return sorted.sort((a, b) => piecePriceOf(a) - piecePriceOf(b));
  if (sortKey === "likes") return sorted.sort((a, b) => b.likeCount - a.likeCount);
  if (!origin) return sorted;
  return sorted.sort(
    (a, b) => distanceInMeters(origin, a.position) - distanceInMeters(origin, b.position),
  );
};

interface ListPlacesParams {
  places: readonly Place[];
  category: PlaceCategory;
  sortKey: SortKey;
  origin: Coordinates | null;
  now: Date;
}

export const listPlaces = ({ places, category, sortKey, origin, now }: ListPlacesParams): Place[] =>
  sortPlaces(
    places.filter(
      (place) => place.category === category && classifyFreshness(place, now) !== "hidden",
    ),
    sortKey,
    origin,
  );
