import { Map } from "react-kakao-maps-sdk";

import { SEOUL_CITY_HALL } from "@/d_shared/geo";
import { KakaoMapGate, useMyPositionMap } from "@/d_shared/kakao-map";
import { PlacePin, type PlaceCategory } from "@/d_shared/place";
import { LocateButton } from "@/d_shared/ui";

interface PositionPickerProps {
  category: PlaceCategory;
}

export const PositionPicker = ({ category }: PositionPickerProps) => {
  const { myPosition, mapRef, panToMyPosition } = useMyPositionMap();

  return (
    <div className="relative h-50 shrink-0 bg-ground">
      <KakaoMapGate>
        <Map center={myPosition ?? SEOUL_CITY_HALL} level={3} ref={mapRef} className="isolate size-full" />
      </KakaoMapGate>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <PlacePin category={category} />
      </div>
      <LocateButton onClick={panToMyPosition} className="absolute bottom-3 right-3" />
    </div>
  );
};
