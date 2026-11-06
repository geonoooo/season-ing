import { distanceInMeters, formatDistance, type Coordinates } from "@/d_shared/geo";
import type { Place } from "@/d_shared/place";

import { formatBundlePrice } from "../model/bundle-price";
import { formatDaysAgo } from "../model/freshness";
import { placeTitle } from "../model/place-title";

interface PlaceListItemProps {
  place: Place;
  myPosition: Coordinates | null;
  now: Date;
  onSelect: () => void;
}

export const PlaceListItem = ({ place, myPosition, now, onSelect }: PlaceListItemProps) => {
  const distance = myPosition ? formatDistance(distanceInMeters(myPosition, place.position)) : null;
  const meta =
    place.kind === "stall"
      ? [distance, `좋아요 ${place.likeCount}`, `${formatDaysAgo(place.lastConfirmedAt, now)} 확인`]
      : [place.kakaoCategory, distance];
  const highlight = place.kind === "stall" ? formatBundlePrice(place.bundle) : `좋아요 ${place.likeCount}`;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center justify-between gap-3 border-t border-divider px-5 py-3 text-left"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-body font-semibold">{placeTitle(place)}</span>
          <span className="text-caption text-muted">{meta.filter(Boolean).join(" · ")}</span>
        </span>
        <span className="shrink-0 text-control font-bold">{highlight}</span>
      </button>
    </li>
  );
};
