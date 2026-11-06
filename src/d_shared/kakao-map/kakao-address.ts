import type { Coordinates } from "@/d_shared/geo";

export const addressAt = ({ lat, lng }: Coordinates): Promise<string> =>
  new Promise((resolve, reject) => {
    new kakao.maps.services.Geocoder().coord2Address(lng, lat, (results, status) => {
      const [bestMatch] = results;
      if (status !== kakao.maps.services.Status.OK || !bestMatch) {
        reject(new Error(`카카오 주소 변환 실패: ${lat}, ${lng}`));
        return;
      }
      resolve(bestMatch.road_address?.address_name ?? bestMatch.address.address_name);
    });
  });
