import Link from "next/link";

import { PLACE_CATEGORIES, PLACE_CATEGORY_ORDER, type PlaceCategory } from "@/d_shared/place";

interface CategoryTabsProps {
  current: PlaceCategory;
}

export const CategoryTabs = ({ current }: CategoryTabsProps) => (
  <nav
    aria-label="카테고리"
    className="flex gap-1 rounded-control bg-white p-1 shadow-overlay"
  >
    {PLACE_CATEGORY_ORDER.map((category) => {
      const isCurrent = category === current;
      return (
        <Link
          key={category}
          href={`/?category=${category}`}
          replace
          aria-current={isCurrent ? "page" : undefined}
          className={`flex h-touch flex-1 items-center justify-center rounded-field text-body ${
            isCurrent ? "bg-ink font-bold text-white" : "font-semibold text-ink"
          }`}
        >
          {PLACE_CATEGORIES[category].label}
        </Link>
      );
    })}
  </nav>
);
