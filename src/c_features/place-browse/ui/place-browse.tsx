"use client";

import Link from "next/link";

import { PLACE_CATEGORIES, type PlaceCategory } from "@/d_shared/place";
import { LocateButton, PlusIcon } from "@/d_shared/ui";

import { locationSearchMessage } from "../model/use-location-search";
import { usePlaceBrowse } from "../model/use-place-browse";
import { CategoryTabs } from "./category-tabs";
import { LocationSearchBar } from "./location-search-bar";
import { PlaceListSheet } from "./place-list-sheet";
import { PlaceMap } from "./place-map";
import { SavedOnlyToggle } from "./saved-only-toggle";
import { ShopDetailSheet } from "./shop-detail-sheet";
import { StallDetailSheet } from "./stall-detail-sheet";

interface PlaceBrowseProps {
  category: PlaceCategory;
  now: string;
}

export const PlaceBrowse = ({ category, now }: PlaceBrowseProps) => {
  const browse = usePlaceBrowse({ category, now });
  const { selectedPlace, placeActions, locationSearch } = browse;

  return (
    <div className="relative h-full overflow-hidden bg-ground">
      <div className="absolute inset-0">
        <PlaceMap
          places={browse.listedPlaces}
          selectedPlaceId={selectedPlace?.id ?? null}
          myPosition={browse.myPosition}
          now={browse.now}
          mapRef={browse.mapRef}
          onSelectPlace={browse.selectPlace}
          onAreaChange={browse.searchArea}
        />
      </div>
      <div className="absolute inset-x-4 top-4 flex flex-col gap-2">
        <LocationSearchBar
          isSearching={locationSearch.status === "searching"}
          message={locationSearchMessage(locationSearch.status)}
          onSearch={locationSearch.moveToLocation}
        />
        <CategoryTabs current={category} />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        {placeActions.hasFailed && (
          <p
            role="alert"
            className="mx-auto mb-2 w-fit rounded-full bg-ink px-4 py-2 text-label font-semibold text-white"
          >
            저장하지 못했어요. 다시 시도해 주세요
          </p>
        )}
        {selectedPlace?.kind === "stall" && (
          <StallDetailSheet
            stall={selectedPlace}
            myPosition={browse.myPosition}
            now={browse.now}
            actions={placeActions}
            onClose={browse.closeDetail}
          />
        )}
        {selectedPlace?.kind === "shop" && (
          <ShopDetailSheet
            shop={selectedPlace}
            myPosition={browse.myPosition}
            actions={placeActions}
            onClose={browse.closeDetail}
          />
        )}
        {!selectedPlace && (
          <>
            <div className="flex items-end justify-between px-4 pb-4">
              <LocateButton onClick={browse.panToMyPosition} />
              <div className="flex flex-col items-end gap-2">
                {browse.hasSavedOnlyToggle && (
                  <SavedOnlyToggle
                    isSavedOnly={browse.isSavedOnly}
                    onToggle={browse.toggleSavedOnly}
                  />
                )}
                <Link
                  href={`/report/${category}`}
                  className={`flex h-12 items-center gap-1.5 rounded-full pl-3.5 pr-4.5 text-body font-bold text-white shadow-overlay ${PLACE_CATEGORIES[category].solidClassName}`}
                >
                  <PlusIcon />
                  제보하기
                </Link>
              </div>
            </div>
            <PlaceListSheet
              category={category}
              places={browse.listedPlaces}
              isSavedOnly={browse.isSavedOnly}
              sortKey={browse.sortKey}
              myPosition={browse.myPosition}
              now={browse.now}
              emptyMessage={browse.emptyMessage}
              onSortChange={browse.changeSort}
              onSelectPlace={browse.selectPlace}
            />
          </>
        )}
      </div>
    </div>
  );
};
