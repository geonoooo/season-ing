import type { Coordinates } from "@/d_shared/geo";
import { PLACE_CATEGORIES, type Place, type PlaceCategory } from "@/d_shared/place";
import { BottomSheet } from "@/d_shared/ui";

import { SORT_OPTIONS, type SortKey } from "../model/list-places";
import { PlaceListItem } from "./place-list-item";

interface PlaceListSheetProps {
  category: PlaceCategory;
  places: Place[];
  sortKey: SortKey;
  myPosition: Coordinates | null;
  now: Date;
  emptyMessage: string;
  onSortChange: (sortKey: SortKey) => void;
  onSelectPlace: (placeId: string) => void;
}

export const PlaceListSheet = ({
  category,
  places,
  sortKey,
  myPosition,
  now,
  emptyMessage,
  onSortChange,
  onSelectPlace,
}: PlaceListSheetProps) => {
  const { label } = PLACE_CATEGORIES[category];

  return (
    <BottomSheet
      label={`${label} 목록`}
      header={
        <div className="flex items-center justify-between py-1 pl-5 pr-3">
          <h2 className="text-title font-bold">
            {label} {places.length}곳
          </h2>
          <div className="flex gap-0.5">
            {SORT_OPTIONS[category].map((option) => {
              const isCurrent = option.key === sortKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={isCurrent}
                  onClick={() => onSortChange(option.key)}
                  className={`h-touch rounded-full px-3.5 text-label ${
                    isCurrent ? "bg-ground font-bold text-ink" : "font-medium text-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      {places.length === 0 ? (
        <p className="px-5 py-6 text-body text-muted">{emptyMessage}</p>
      ) : (
        <ul>
          {places.map((place) => (
            <PlaceListItem
              key={place.id}
              place={place}
              myPosition={myPosition}
              now={now}
              onSelect={() => onSelectPlace(place.id)}
            />
          ))}
        </ul>
      )}
    </BottomSheet>
  );
};
