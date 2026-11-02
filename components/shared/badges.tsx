import { cn } from '@/lib/utils';
import {
  CATEGORY_BADGE,
  STATUS_META,
} from '@/lib/format';
import type { AnnouncementCategory, AnnouncementStatus } from '@/lib/types';

export function StatusBadge({
  status,
  className,
}: {
  status: AnnouncementStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: AnnouncementCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        CATEGORY_BADGE[category],
        className,
      )}
    >
      {category}
    </span>
  );
}