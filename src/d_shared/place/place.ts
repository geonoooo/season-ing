import type { Coordinates } from "@/d_shared/geo";

export type PlaceCategory = "bungeoppang" | "bangeo";
export type StallCategory = "bungeoppang";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TagCount {
  label: string;
  count: number;
}

export interface Bundle {
  count: number;
  price: number;
}

interface PlaceBase {
  id: string;
  position: Coordinates;
  address: string;
  likeCount: number;
  tags: TagCount[];
}

export interface Stall extends PlaceBase {
  kind: "stall";
  category: StallCategory;
  bundle: Bundle;
  openDays: Weekday[];
  lastConfirmedAt: string;
  goneCount: number;
}

export interface Shop extends PlaceBase {
  kind: "shop";
  category: PlaceCategory;
  name: string;
  kakaoPlaceId: string;
  kakaoCategory: string;
  phone: string | null;
}

export type Place = Stall | Shop;
