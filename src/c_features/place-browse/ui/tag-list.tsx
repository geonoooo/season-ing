import { useState } from "react";

import type { TagCount } from "@/d_shared/place";

interface TagListProps {
  tags: TagCount[];
  isSaving: boolean;
  onToggleTag: (tag: TagCount) => void;
  onAddTag: (label: string) => void;
}

// DB의 place_tags.label 길이 제한과 같다
const TAG_MAX_LENGTH = 12;

export const TagList = ({ tags, isSaving, onToggleTag, onAddTag }: TagListProps) => {
  const [draftLabel, setDraftLabel] = useState<string | null>(null);
  const isAdding = draftLabel !== null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label text-muted">태그</h3>
        <button
          type="button"
          aria-expanded={isAdding}
          onClick={() => setDraftLabel(isAdding ? null : "")}
          className="-mr-3 h-touch px-3 text-label font-semibold text-ink"
        >
          {isAdding ? "취소" : "+ 추가"}
        </button>
      </div>
      {isAdding && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAddTag(draftLabel.trim());
            setDraftLabel(null);
          }}
          className="mb-2 flex gap-2"
        >
          <input
            maxLength={TAG_MAX_LENGTH}
            placeholder="예: 양이 많아요"
            aria-label="새 태그"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-field border border-line px-3 text-control text-ink"
          />
          <button
            type="submit"
            disabled={isSaving || !draftLabel.trim()}
            className="h-12 shrink-0 rounded-field bg-ink px-4 text-label font-bold text-white disabled:opacity-40"
          >
            달기
          </button>
        </form>
      )}
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag.label}>
            <button
              type="button"
              aria-pressed={tag.isMine}
              disabled={isSaving}
              onClick={() => onToggleTag(tag)}
              className={`h-touch rounded-full px-3.5 text-label font-medium ${
                tag.isMine ? "bg-ink text-white" : "bg-ground text-ink"
              }`}
            >
              {tag.label} {tag.count}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
