import { useState } from "react";

import { distanceInMeters, formatDistance, useCurrentPosition } from "@/d_shared/geo";
import { PLACE_CATEGORIES, saveShop, type PlaceCategory } from "@/d_shared/place";
import { SearchIcon } from "@/d_shared/ui";

import { useReportSubmit } from "../model/use-report-submit";
import { describeSearch, useShopSearch } from "../model/use-shop-search";

interface ShopPickerProps {
  category: PlaceCategory;
}

export const ShopPicker = ({ category }: ShopPickerProps) => {
  const [keyword, setKeyword] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const { position } = useCurrentPosition();
  const { candidates, status, search } = useShopSearch(category);
  const searchMessage = describeSearch(status, candidates.length);
  const { isSubmitting, errorMessage, submit } = useReportSubmit(category);
  const selectedShop = candidates.find((candidate) => candidate.kakaoPlaceId === selectedPlaceId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          search(keyword, position);
        }}
        className="px-4 pt-4"
      >
        <label className="flex h-12 items-center gap-2 rounded-field border border-line px-3 text-muted">
          <SearchIcon />
          <input
            type="search"
            enterKeyHint="search"
            placeholder="가게 이름"
            aria-label="가게 이름 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="h-touch min-w-0 flex-1 bg-transparent text-control text-ink outline-none"
          />
        </label>
        <p className="mt-2 text-caption text-muted">카카오맵에 등록된 가게 중에서 골라요</p>
      </form>

      <div role="radiogroup" aria-label="검색 결과" className="mt-5 min-h-0 flex-1 overflow-y-auto px-4">
        {searchMessage && <p className="text-caption text-muted">{searchMessage}</p>}
        <ul className="mt-2 flex flex-col gap-2">
          {candidates.map((candidate) => {
            const isSelected = candidate.kakaoPlaceId === selectedPlaceId;
            const meta = [
              candidate.kakaoCategory,
              candidate.address,
              position && formatDistance(distanceInMeters(position, candidate.position)),
            ];
            return (
              <li key={candidate.kakaoPlaceId}>
                <label
                  className={`flex items-center gap-3 rounded-control border px-3.5 py-3 ${
                    isSelected ? "border-ink ring-1 ring-ink" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="kakao-place"
                    value={candidate.kakaoPlaceId}
                    checked={isSelected}
                    onChange={() => setSelectedPlaceId(candidate.kakaoPlaceId)}
                    className="size-5 shrink-0 accent-ink"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-body font-semibold">{candidate.name}</span>
                    <span className="text-caption text-muted">{meta.filter(Boolean).join(" · ")}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-4 pb-4 pt-3">
        <button type="button" className="mb-2 h-touch w-full text-label font-semibold text-ink underline">
          검색에 안 나오면 지도에서 직접 찍기
        </button>
        {errorMessage && (
          <p role="alert" className="mb-2 text-center text-caption font-semibold text-ink">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          disabled={!selectedShop || isSubmitting}
          onClick={() => selectedShop && submit(() => saveShop(selectedShop))}
          className={`h-13 w-full rounded-control text-control font-bold text-white disabled:opacity-40 ${PLACE_CATEGORIES[category].solidClassName}`}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};
