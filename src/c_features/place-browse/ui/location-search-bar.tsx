import { useState } from "react";

import { SearchIcon } from "@/d_shared/ui";

interface LocationSearchBarProps {
  isSearching: boolean;
  message: string | null;
  onSearch: (keyword: string) => void;
}

export const LocationSearchBar = ({ isSearching, message, onSearch }: LocationSearchBarProps) => {
  const [keyword, setKeyword] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(keyword);
      }}
    >
      <label className="flex h-12 items-center gap-2 rounded-control bg-white px-3 text-muted shadow-overlay">
        <SearchIcon />
        <input
          type="search"
          enterKeyHint="search"
          placeholder="지역, 역 이름으로 찾기"
          aria-label="지역 검색"
          value={keyword}
          disabled={isSearching}
          onChange={(event) => setKeyword(event.target.value)}
          className="h-touch min-w-0 flex-1 bg-transparent text-control text-ink outline-none"
        />
      </label>
      {message && (
        <p role="status" className="mt-2 w-fit rounded-full bg-white px-3 py-1 text-caption text-ink shadow-overlay">
          {message}
        </p>
      )}
    </form>
  );
};
