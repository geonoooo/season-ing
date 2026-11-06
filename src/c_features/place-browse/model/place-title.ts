import type { Place } from "@/d_shared/place";

export const placeTitle = (place: Place): string =>
  place.kind === "shop" ? place.name : `${place.address} 근처`;
