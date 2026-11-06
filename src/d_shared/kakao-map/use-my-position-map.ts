import { useRef } from "react";

import { useCurrentPosition } from "@/d_shared/geo";

export const useMyPositionMap = () => {
  const { position, locate } = useCurrentPosition();
  const mapRef = useRef<kakao.maps.Map>(null);

  const panToMyPosition = () => {
    locate();
    if (mapRef.current && position) {
      mapRef.current.panTo(new kakao.maps.LatLng(position.lat, position.lng));
    }
  };

  return { myPosition: position, mapRef, panToMyPosition };
};
