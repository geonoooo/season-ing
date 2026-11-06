"use client";

import Link from "next/link";

import { PLACE_CATEGORIES, type PlaceCategory } from "@/d_shared/place";
import { LocateButton, PlusIcon } from "@/d_shared/ui";

import { emptyListMessage } from "../model/kakao-shop-search";
import { usePlaceBrowse } from "../model/use-place-browse";
import { CategoryTabs } from "./category-tabs";
import { PlaceListSheet } from "./place-list-sheet";
import { PlaceMap } from "./place-map";
import { ShopDetailSheet } from "./shop-detail-sheet";
import { StallDetailSheet } from "./stall-detail-sheet";

interface PlaceBrowseProps {
  category: PlaceCategory;
  now: string;
}

export const PlaceBrowse = ({ category, now }: PlaceBrowseProps) => {
  const browse = usePlaceBrowse({ category, now });
  const { selectedPlace } = browse;

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
      <div className="pointer-events-none absolute inset-0 flex flex-col gap-2">
        <div className="pointer-events-auto mx-4 mt-4">
          <CategoryTabs current={category} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end">
          {selectedPlace?.kind === "stall" && (
            <StallDetailSheet
              stall={selectedPlace}
              myPosition={browse.myPosition}
              now={browse.now}
              onClose={browse.closeDetail}
            />
          )}
          {selectedPlace?.kind === "shop" && (
            <ShopDetailSheet
              shop={selectedPlace}
              myPosition={browse.myPosition}
              onClose={browse.closeDetail}
            />
          )}
          {!selectedPlace && (
            <>
              <div className="flex items-center justify-between px-4 pb-4">
                <LocateButton onClick={browse.panToMyPosition} className="pointer-events-auto" />
                <Link
                  href={`/report/${category}`}
                  className={`pointer-events-auto flex h-12 items-center gap-1.5 rounded-full pl-3.5 pr-4.5 text-body font-bold text-white shadow-overlay ${PLACE_CATEGORIES[category].solidClassName}`}
                >
                  <PlusIcon />
                  제보하기
                </Link>
              </div>
              <PlaceListSheet
                category={category}
                places={browse.listedPlaces}
                sortKey={browse.sortKey}
                myPosition={browse.myPosition}
                now={browse.now}
                emptyMessage={emptyListMessage(browse.searchStatus)}
                onSortChange={browse.changeSort}
                onSelectPlace={browse.selectPlace}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
