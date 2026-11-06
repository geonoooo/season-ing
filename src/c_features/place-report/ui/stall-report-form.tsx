"use client";

import { useState } from "react";

import { PLACE_CATEGORIES, toggleWeekday, type StallCategory, type Weekday } from "@/d_shared/place";

import { digitsOnly, formatDigits } from "../model/number-input";
import { PositionPicker } from "./position-picker";
import { ReportHeader } from "./report-header";
import { WeekdayToggles } from "./weekday-toggles";

interface StallReportFormProps {
  category: StallCategory;
}

const NUMBER_FIELD =
  "h-12 rounded-field border border-line bg-white px-3 text-right text-control text-ink";

export const StallReportForm = ({ category }: StallReportFormProps) => {
  const { label, solidClassName } = PLACE_CATEGORIES[category];
  const [bundleCount, setBundleCount] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");
  const [openDays, setOpenDays] = useState<Weekday[]>([]);

  return (
    <div className="flex h-full flex-col bg-white">
      <ReportHeader title={`${label} 제보`} closeHref={`/?category=${category}`} />
      <form className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <PositionPicker category={category} />
        <p className="px-4 pt-2.5 text-caption text-muted">지도를 움직여 핀을 노점 자리에 맞춰주세요</p>
        <div className="flex flex-col gap-6 px-4 pt-5">
          <fieldset>
            <legend className="text-body font-bold">가격</legend>
            <div className="mt-2.5 flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-body">
                <input
                  inputMode="numeric"
                  placeholder="3"
                  aria-label="개수"
                  value={bundleCount}
                  onChange={(event) => setBundleCount(digitsOnly(event.target.value))}
                  className={`w-16 ${NUMBER_FIELD}`}
                />
                개
              </label>
              <label className="flex items-center gap-1.5 text-body">
                <input
                  inputMode="numeric"
                  placeholder="2,000"
                  aria-label="가격"
                  value={formatDigits(bundlePrice)}
                  onChange={(event) => setBundlePrice(digitsOnly(event.target.value))}
                  className={`w-26 ${NUMBER_FIELD}`}
                />
                원
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-body font-bold">
              영업 요일
              <span className="ml-1.5 text-caption font-normal text-muted">모르면 비워두세요</span>
            </legend>
            <WeekdayToggles
              selectedDays={openDays}
              onToggle={(day) => setOpenDays((days) => toggleWeekday(days, day))}
            />
          </fieldset>
        </div>
        <div className="mt-auto px-4 pb-4 pt-6">
          <p className="mb-2 text-center text-caption text-muted">기기당 하루 3번까지 제보할 수 있어요</p>
          <button
            type="button"
            className={`h-13 w-full rounded-control text-control font-bold text-white ${solidClassName}`}
          >
            제보하기
          </button>
        </div>
      </form>
    </div>
  );
};
