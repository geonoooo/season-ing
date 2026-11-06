import { useCallback, type RefObject } from "react";
import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";

import { SEOUL_CITY_HALL, type Coordinates } from "@/d_shared/geo";
import { KakaoMapGate } from "@/d_shared/kakao-map";
import { PlacePin, type Place } from "@/d_shared/place";

import { classifyFreshness } from "../model/freshness";
import { placeTitle } from "../model/place-title";

interface PlaceMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  myPosition: Coordinates | null;
  now: Date;
  mapRef: RefObject<kakao.maps.Map | null>;
  onSelectPlace: (placeId: string) => void;
  onAreaChange: (bounds: kakao.maps.LatLngBounds) => void;
}

const MyPositionDot = () => (
  <div
    aria-hidden="true"
    className="flex size-12 items-center justify-center rounded-full bg-my-location/15"
  >
    <div className="size-3.5 rounded-full border-3 border-white bg-my-location shadow-overlay" />
  </div>
);

export const PlaceMap = ({
  places,
  selectedPlaceId,
  myPosition,
  now,
  mapRef,
  onSelectPlace,
  onAreaChange,
}: PlaceMapProps) => {
  // 카카오 지도는 처음 만들어질 때 idle을 보내지 않아서 생성 시점에도 검색한다
  const searchVisibleArea = useCallback(
    (map: kakao.maps.Map) => onAreaChange(map.getBounds()),
    [onAreaChange],
  );

  return (
    <KakaoMapGate>
      <Map
        center={myPosition ?? SEOUL_CITY_HALL}
        level={5}
        ref={mapRef}
        onCreate={searchVisibleArea}
        onIdle={searchVisibleArea}
        className="isolate size-full"
      >
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          return (
            <CustomOverlayMap
              key={place.id}
              position={place.position}
              yAnchor={1}
              zIndex={isSelected ? 2 : 1}
              clickable
            >
              <button
                type="button"
                aria-label={placeTitle(place)}
                onClick={() => onSelectPlace(place.id)}
                className="relative block"
              >
                <PlacePin
                  category={place.category}
                  isSelected={isSelected}
                  isFaded={classifyFreshness(place, now) === "stale"}
                />
                {place.likeCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2.5 -top-1 rounded-full bg-white px-1.5 text-caption font-bold text-ink shadow-overlay"
                  >
                    ♥{place.likeCount}
                  </span>
                )}
              </button>
            </CustomOverlayMap>
          );
        })}
        {myPosition && (
          <CustomOverlayMap position={myPosition}>
            <MyPositionDot />
          </CustomOverlayMap>
        )}
      </Map>
    </KakaoMapGate>
  );
};
