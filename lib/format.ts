import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import type { Announcement, AnnouncementCategory, AnnouncementStatus } from './types';

export function formatRelative(iso?: string): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  return format(new Date(iso), 'MMM d, yyyy');
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  return format(new Date(iso), 'MMM d');
}

export function groupDateLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM yyyy');
}

export const STATUS_META: Record<
  AnnouncementStatus,
  { label: string; className: string; dot: string }
> = {
  published: {
    label: 'Published',
    className: 'bg-success-soft text-success border-success/30',
    dot: 'bg-success',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-warning-soft text-warning border-warning/30',
    dot: 'bg-warning',
  },
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  archived: {
    label: 'Archived',
    className: 'bg-secondary text-secondary-foreground border-border',
    dot: 'bg-muted-foreground',
  },
};

export const CATEGORY_BADGE: Record<AnnouncementCategory, string> = {
  'New Feature': 'bg-primary-soft text-primary border-primary/30',
  Enhancement: 'bg-info-soft text-info border-info/30',
  'Bug Fix': 'bg-warning-soft text-warning border-warning/30',
  Maintenance: 'bg-secondary text-secondary-foreground border-border',
  Security: 'bg-destructive/10 text-destructive border-destructive/30',
  Deprecation: 'bg-muted text-muted-foreground border-border',
};

export function isPublishedVisibleToOrg(
  a: Announcement,
  orgId: string,
): boolean {
  return (
    a.status === 'published' &&
    (a.audienceType === 'all' || a.audienceOrgs.includes(orgId))
  );
}

export function orgIdsReached(a: Announcement, allOrgIds: string[]): string[] {
  return a.audienceType === 'all' ? allOrgIds : a.audienceOrgs;
}
