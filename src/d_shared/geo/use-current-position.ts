import { useCallback, useEffect, useState } from "react";

import type { Coordinates } from "./coordinates";

export const useCurrentPosition = () => {
  const [position, setPosition] = useState<Coordinates | null>(null);

  const locate = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(({ coords }) =>
      setPosition({ lat: coords.latitude, lng: coords.longitude }),
    );
  }, []);

  useEffect(locate, [locate]);

  return { position, locate };
};
