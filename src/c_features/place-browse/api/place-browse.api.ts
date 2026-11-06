import type { Coordinates } from "@/d_shared/geo";
import { saveShop, type Place, type PlaceCategory, type Stall, type StallCategory, type TagCount } from "@/d_shared/place";
import { signedInSupabase, supabaseClient, type Database } from "@/d_shared/supabase";

type AreaPlaceRow = Database["public"]["Functions"]["places_in_area"]["Returns"][number];

export interface AreaBounds {
  southWest: Coordinates;
  northEast: Coordinates;
}

const toPlace = (row: AreaPlaceRow): Place => {
  const shared = {
    position: { lat: row.lat, lng: row.lng },
    address: row.address,
    likeCount: row.like_count,
    isLiked: row.is_liked,
    // DB 함수가 jsonb로 {label, count, isMine} 배열을 만들어 보낸다
    tags: row.tags as unknown as TagCount[],
  };
  if (row.kind === "stall") {
    return {
      ...shared,
      id: row.id,
      kind: "stall",
      // 노점 카테고리가 아닌 노점은 DB 제약에서 막힌다
      category: row.category as StallCategory,
      bundle: { count: row.bundle_count, price: row.bundle_price },
      openDays: row.open_days,
      lastConfirmedAt: row.last_confirmed_at,
      goneCount: row.gone_count,
    };
  }
  return {
    ...shared,
    id: row.kakao_place_id,
    kind: "shop",
    category: row.category,
    name: row.name,
    kakaoPlaceId: row.kakao_place_id,
    kakaoCategory: row.kakao_category,
    phone: row.phone || null,
    savedPlaceId: row.id,
  };
};

export const placesInArea = async (
  category: PlaceCategory,
  { southWest, northEast }: AreaBounds,
): Promise<Place[]> => {
  const { data, error } = await supabaseClient().rpc("places_in_area", {
    p_category: category,
    p_south: southWest.lat,
    p_west: southWest.lng,
    p_north: northEast.lat,
    p_east: northEast.lng,
  });
  if (error) throw error;
  return data.map(toPlace);
};

const savedPlaceIdOf = async (place: Place): Promise<string> =>
  place.kind === "stall" ? place.id : (place.savedPlaceId ?? (await saveShop(place)));

export const setLike = async (place: Place, liked: boolean): Promise<void> => {
  const [supabase, placeId] = await Promise.all([signedInSupabase(), savedPlaceIdOf(place)]);
  const { error } = await supabase.rpc("set_like", { p_place_id: placeId, p_liked: liked });
  if (error) throw error;
};

export const setTag = async (place: Place, label: string, tagged: boolean): Promise<void> => {
  const [supabase, placeId] = await Promise.all([signedInSupabase(), savedPlaceIdOf(place)]);
  const { error } = await supabase.rpc("set_tag", { p_place_id: placeId, p_label: label, p_tagged: tagged });
  if (error) throw error;
};

export const saveStallCheck = async (stall: Stall, isStillThere: boolean): Promise<void> => {
  const supabase = await signedInSupabase();
  const { error } = await supabase.rpc("check_stall", {
    p_place_id: stall.id,
    p_is_still_there: isStillThere,
  });
  if (error) throw error;
};
