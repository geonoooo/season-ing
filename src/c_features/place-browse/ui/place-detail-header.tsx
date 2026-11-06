import { CloseIcon, HeartIcon } from "@/d_shared/ui";

interface PlaceDetailHeaderProps {
  badge: string;
  badgeClassName: string;
  title: string;
  subtitle: string | null;
  likeCount: number;
  isLiked: boolean;
  isSaving: boolean;
  onToggleLike: () => void;
  onClose: () => void;
}

export const PlaceDetailHeader = ({
  badge,
  badgeClassName,
  title,
  subtitle,
  likeCount,
  isLiked,
  isSaving,
  onToggleLike,
  onClose,
}: PlaceDetailHeaderProps) => (
  <>
    <div className="mt-1 flex items-center justify-between">
      <span className={`text-caption font-bold ${badgeClassName}`}>{badge}</span>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="-mr-3 flex size-touch items-center justify-center text-ink"
      >
        <CloseIcon />
      </button>
    </div>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-heading font-bold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-label text-muted">{subtitle}</p>}
      </div>
      <button
        type="button"
        aria-pressed={isLiked}
        aria-label={`좋아요 ${likeCount}`}
        disabled={isSaving}
        onClick={onToggleLike}
        className={`flex h-touch shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-body font-semibold text-ink ${
          isLiked ? "border-ink" : "border-line"
        }`}
      >
        <HeartIcon isFilled={isLiked} />
        {likeCount}
      </button>
    </div>
  </>
);
