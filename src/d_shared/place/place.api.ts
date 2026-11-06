import { signedInSupabase } from "@/d_shared/supabase";

import type { Shop } from "./place";

export const saveShop = async (shop: Shop): Promise<string> => {
  const supabase = await signedInSupabase();
  const { data, error } = await supabase.rpc("save_shop", {
    p_category: shop.category,
    p_kakao_place_id: shop.kakaoPlaceId,
    p_name: shop.name,
    p_kakao_category: shop.kakaoCategory,
    p_phone: shop.phone ?? "",
    p_address: shop.address,
    p_lat: shop.position.lat,
    p_lng: shop.position.lng,
  });
  if (error) throw error;
  return data;
};
