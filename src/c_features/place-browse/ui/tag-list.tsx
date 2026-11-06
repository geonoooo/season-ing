import type { TagCount } from "@/d_shared/place";

interface TagListProps {
  tags: TagCount[];
}

export const TagList = ({ tags }: TagListProps) => (
  <div className="mt-4">
    <div className="flex items-center justify-between">
      <h3 className="text-label text-muted">태그</h3>
      <button type="button" className="-mr-3 h-touch px-3 text-label font-semibold text-ink">
        + 추가
      </button>
    </div>
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag.label}>
          <button
            type="button"
            aria-pressed={false}
            className="h-touch rounded-full bg-ground px-3.5 text-label font-medium text-ink"
          >
            {tag.label} {tag.count}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
