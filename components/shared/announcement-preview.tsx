'use client';

import { Megaphone, Mail, Bell, LayoutDashboard, Calendar } from 'lucide-react';
import type { AnnouncementCategory, AnnouncementStatus, HRMSModule, NotificationPrefs } from '@/lib/types';
import { CategoryBadge, StatusBadge } from '@/components/shared/badges';
import { cn } from '@/lib/utils';

export function AnnouncementPreview({
  title,
  summary,
  contentHtml,
  category,
  module,
  heroImage,
  status,
  notifications,
  audienceType,
  audienceCount,
}: {
  title: string;
  summary: string;
  contentHtml: string;
  category: AnnouncementCategory;
  module: HRMSModule;
  heroImage?: string;
  status: AnnouncementStatus;
  notifications: NotificationPrefs;
  audienceType: 'all' | 'selected';
  audienceCount: number;
}) {
  const notifs = [
    { on: notifications.productUpdates, label: 'Product Updates', icon: Megaphone },
    { on: notifications.notificationBell, label: 'Notification Bell', icon: Bell },
    { on: notifications.email, label: 'Email', icon: Mail },
    { on: notifications.dashboardBanner, label: 'Dashboard Banner', icon: LayoutDashboard },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {heroImage ? (
        <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center bg-primary-soft">
          <Megaphone className="h-7 w-7 text-primary" />
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={category} />
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground">{module}</span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-foreground">{title || 'Untitled announcement'}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{summary || 'No summary yet.'}</p>

        <div
          className="rte-content mt-3 max-h-56 overflow-y-auto scrollbar-thin border-t border-border pt-3 text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-muted-foreground">Announcement content will appear here.</p>' }}
        />
      </div>
      <div className="border-t border-border bg-muted/40 px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery</p>
        <div className="flex flex-wrap gap-1.5">
          {notifs.map((n) => {
            const Icon = n.icon;
            return (
              <span
                key={n.label}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs',
                  n.on
                    ? 'border-primary/30 bg-primary-soft text-primary'
                    : 'border-border bg-card text-muted-foreground line-through',
                )}
              >
                <Icon className="h-3 w-3" />
                {n.label}
              </span>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {audienceType === 'all' ? 'All organizations' : `${audienceCount} selected organization${audienceCount === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  );
}