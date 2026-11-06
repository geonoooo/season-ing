"use client";

import { KakaoMapGate } from "@/d_shared/kakao-map";
import { PLACE_CATEGORIES, type PlaceCategory } from "@/d_shared/place";

import { ReportHeader } from "./report-header";
import { ShopPicker } from "./shop-picker";

interface ShopReportFormProps {
  category: PlaceCategory;
}

export const ShopReportForm = ({ category }: ShopReportFormProps) => (
  <div className="flex h-full flex-col bg-white">
    <ReportHeader
      title={`${PLACE_CATEGORIES[category].label} 가게 제보`}
      closeHref={`/?category=${category}`}
    />
    <KakaoMapGate>
      <ShopPicker category={category} />
    </KakaoMapGate>
  </div>
);
