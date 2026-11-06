import { distanceInMeters, formatDistance, type Coordinates } from "@/d_shared/geo";
import { PLACE_CATEGORIES, WEEKDAYS, type Stall } from "@/d_shared/place";
import { BottomSheet } from "@/d_shared/ui";

import { formatBundlePrice } from "../model/bundle-price";
import { formatDaysAgo } from "../model/freshness";
import { kakaoDirectionsUrl } from "../model/kakao-map-link";
import { placeTitle } from "../model/place-title";
import { PlaceDetailHeader } from "./place-detail-header";
import { TagList } from "./tag-list";

interface StallDetailSheetProps {
  stall: Stall;
  myPosition: Coordinates | null;
  now: Date;
  onClose: () => void;
}

export const StallDetailSheet = ({ stall, myPosition, now, onClose }: StallDetailSheetProps) => {
  const { label, textClassName, solidClassName } = PLACE_CATEGORIES[stall.category];
  const title = placeTitle(stall);
  const distance = myPosition
    ? `내 위치에서 ${formatDistance(distanceInMeters(myPosition, stall.position))}`
    : null;

  return (
    <BottomSheet
      label="노점 정보"
      header={
        <div className="px-5 pb-3">
          <PlaceDetailHeader
            badge={`${label} 노점`}
            badgeClassName={textClassName}
            title={title}
            subtitle={distance}
            likeCount={stall.likeCount}
            onClose={onClose}
          />
        </div>
      }
    >
      <div className="px-5 pb-6">
        <p className="mt-5 text-price font-extrabold tracking-tight">
          {formatBundlePrice(stall.bundle)}
        </p>
        <dl className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <dt className="w-20 shrink-0 text-label text-muted">영업 요일</dt>
            <dd className="flex gap-1">
              {WEEKDAYS.map(({ key, label: dayLabel }) => (
                <span
                  key={key}
                  className={`flex size-7 items-center justify-center rounded-field text-caption ${
                    stall.openDays.includes(key)
                      ? "bg-ink font-semibold text-white"
                      : "bg-ground font-medium text-muted"
                  }`}
                >
                  {dayLabel}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="w-20 shrink-0 text-label text-muted">마지막 확인</dt>
            <dd className="text-label">
              {formatDaysAgo(stall.lastConfirmedAt, now)}
              {stall.goneCount > 0 && (
                <span className="text-muted"> · 사라짐 제보 {stall.goneCount}건</span>
              )}
            </dd>
          </div>
        </dl>
        <TagList tags={stall.tags} />
        <p className="mt-6 text-body font-bold">아직 이 자리에 있나요?</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`h-13 flex-1 rounded-control text-control font-bold text-white ${solidClassName}`}
          >
            아직 있어요
          </button>
          <button
            type="button"
            className="h-13 flex-1 rounded-control border border-line bg-white text-control font-semibold text-ink"
          >
            없어졌어요
          </button>
        </div>
        <a
          href={kakaoDirectionsUrl(title, stall.position)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex h-touch items-center justify-center text-label font-semibold text-ink"
        >
          카카오맵에서 길찾기
        </a>
      </div>
    </BottomSheet>
  );
};
