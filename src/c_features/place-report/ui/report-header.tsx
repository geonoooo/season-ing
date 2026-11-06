import Link from "next/link";

import { CloseIcon } from "@/d_shared/ui";

interface ReportHeaderProps {
  title: string;
  closeHref: string;
}

export const ReportHeader = ({ title, closeHref }: ReportHeaderProps) => (
  <header className="flex h-14 shrink-0 items-center gap-1 border-b border-divider pl-1 pr-4">
    <Link href={closeHref} aria-label="닫기" className="flex size-touch items-center justify-center text-ink">
      <CloseIcon />
    </Link>
    <h1 className="text-title font-bold">{title}</h1>
  </header>
);
