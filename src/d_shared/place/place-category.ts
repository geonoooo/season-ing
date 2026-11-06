import type { PlaceCategory } from "./place";

interface PlaceCategoryDefinition {
  label: string;
  pinFillClassName: string;
  solidClassName: string;
  textClassName: string;
}

export const PLACE_CATEGORIES: Record<PlaceCategory, PlaceCategoryDefinition> = {
  bungeoppang: {
    label: "붕어빵",
    pinFillClassName: "fill-bungeoppang",
    solidClassName: "bg-bungeoppang",
    textClassName: "text-bungeoppang",
  },
  bangeo: {
    label: "방어",
    pinFillClassName: "fill-bangeo",
    solidClassName: "bg-bangeo",
    textClassName: "text-bangeo",
  },
};

export const PLACE_CATEGORY_ORDER: PlaceCategory[] = ["bungeoppang", "bangeo"];

export const parsePlaceCategory = (value: string | string[] | undefined): PlaceCategory =>
  PLACE_CATEGORY_ORDER.find((category) => category === value) ?? PLACE_CATEGORY_ORDER[0];
