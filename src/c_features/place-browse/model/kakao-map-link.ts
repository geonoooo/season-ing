import type { Coordinates } from "@/d_shared/geo";

export const kakaoDirectionsUrl = (destination: string, { lat, lng }: Coordinates): string =>
  `https://map.kakao.com/link/to/${encodeURIComponent(destination)},${lat},${lng}`;

export const kakaoPlaceUrl = (kakaoPlaceId: string): string =>
  `https://place.map.kakao.com/${kakaoPlaceId}`;
