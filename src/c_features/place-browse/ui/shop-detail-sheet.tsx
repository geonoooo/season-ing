import { distanceInMeters, formatDistance, type Coordinates } from "@/d_shared/geo";
import { PLACE_CATEGORIES, type Shop } from "@/d_shared/place";

import { kakaoPlaceUrl } from "../model/kakao-map-link";
import type { PlaceActions } from "../model/use-place-actions";
import { BottomSheet } from "./bottom-sheet";
import { PlaceDetailHeader } from "./place-detail-header";
import { TagList } from "./tag-list";

interface ShopDetailSheetProps {
  shop: Shop;
  myPosition: Coordinates | null;
  actions: PlaceActions;
  onClose: () => void;
}

export const ShopDetailSheet = ({ shop, myPosition, actions, onClose }: ShopDetailSheetProps) => {
  const { label, textClassName, solidClassName } = PLACE_CATEGORIES[shop.category];
  const distance = myPosition
    ? formatDistance(distanceInMeters(myPosition, shop.position))
    : null;

  return (
    <BottomSheet label="가게 정보" className="max-h-[75dvh] overflow-y-auto px-5 pb-6">
      <PlaceDetailHeader
        badge={`${label} · ${shop.kakaoCategory}`}
        badgeClassName={textClassName}
        title={shop.name}
        subtitle={[shop.address, distance && `내 위치에서 ${distance}`].filter(Boolean).join(" · ")}
        likeCount={shop.likeCount}
        isLiked={shop.isLiked}
        isSaving={actions.isSaving}
        onToggleLike={() => actions.toggleLike(shop)}
        onClose={onClose}
      />
      <TagList
        tags={shop.tags}
        isSaving={actions.isSaving}
        onToggleTag={(tag) => actions.toggleTag(shop, tag)}
        onAddTag={(label) => actions.addTag(shop, label)}
      />
      <div className="mt-6 flex gap-2">
        <a
          href={kakaoPlaceUrl(shop.kakaoPlaceId)}
          target="_blank"
          rel="noreferrer"
          className={`flex h-13 flex-1 items-center justify-center rounded-control text-control font-bold text-white ${solidClassName}`}
        >
          카카오맵에서 보기
        </a>
        {shop.phone && (
          <a
            href={`tel:${shop.phone}`}
            className="flex h-13 flex-1 items-center justify-center rounded-control border border-line bg-white text-control font-semibold text-ink"
          >
            전화하기
          </a>
        )}
      </div>
      <p className="mt-3 text-center text-caption text-muted">
        {label} 가격은 시세에 따라 바뀌어서 따로 적지 않아요
      </p>
    </BottomSheet>
  );
};
