import { useCallback } from "react";
import { Map } from "react-kakao-maps-sdk";

import { SEOUL_CITY_HALL, type Coordinates } from "@/d_shared/geo";
import { KakaoMapGate, useMyPositionMap } from "@/d_shared/kakao-map";
import { PlacePin, type PlaceCategory } from "@/d_shared/place";
import { LocateButton } from "@/d_shared/ui";

interface PositionPickerProps {
  category: PlaceCategory;
  onPositionChange: (position: Coordinates) => void;
}

export const PositionPicker = ({ category, onPositionChange }: PositionPickerProps) => {
  const { myPosition, mapRef, panToMyPosition } = useMyPositionMap();
  // 카카오 지도는 onCreate가 바뀔 때마다 다시 부르므로 콜백을 고정한다
  const reportCenter = useCallback(
    (map: kakao.maps.Map) => {
      const center = map.getCenter();
      onPositionChange({ lat: center.getLat(), lng: center.getLng() });
    },
    [onPositionChange],
  );

  return (
    <div className="relative h-50 shrink-0 bg-ground">
      <KakaoMapGate>
        <Map
          center={myPosition ?? SEOUL_CITY_HALL}
          level={3}
          ref={mapRef}
          onCreate={reportCenter}
          onIdle={reportCenter}
          className="isolate size-full"
        />
      </KakaoMapGate>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <PlacePin category={category} />
      </div>
      <LocateButton onClick={panToMyPosition} className="absolute bottom-3 right-3" />
    </div>
  );
};
