'use client';

import { useEffect, useMemo } from 'react';
import { ArrowLeft, Check, Clock3, Eye, UserRound } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { formatDateTime, formatRelative } from '@/lib/format';
import { CategoryBadge, StatusBadge } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Megaphone } from 'lucide-react';

export function EmployeeAnnouncementDetail({
  id,
  onNavigate,
}: {
  id: string;
  onNavigate: (to: string) => void;
}) {
  const { getAnnouncement, isRead, markAsRead } = useAnnouncements();
  const announcement = useMemo(() => getAnnouncement(id), [getAnnouncement, id]);

  useEffect(() => {
    if (announcement && !isRead(announcement.id)) {
      markAsRead(announcement.id);
    }
  }, [announcement, isRead, markAsRead]);

  if (!announcement) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Update not found"
        description="This announcement is no longer available in the employee portal."
        action={<Button onClick={() => onNavigate('/employee/whats-new')}>Back to updates</Button>}
      />
    );
  }

  const read = isRead(announcement.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/employee/whats-new')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        {announcement.heroImage && (
          <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
            <img src={announcement.heroImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={announcement.category} />
            <StatusBadge status={announcement.status} />
            <span className="text-xs text-muted-foreground">{announcement.module}</span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{announcement.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{announcement.summary}</p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" /> {announcement.author}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Published {formatRelative(announcement.publishedAt ?? announcement.createdAt)}</span>
            {announcement.publishedAt && <span>{formatDateTime(announcement.publishedAt)}</span>}
          </div>

          <div
            className="rte-content mt-6 border-t border-border pt-5 text-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: announcement.contentHtml }}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => markAsRead(announcement.id)} variant={read ? 'secondary' : 'default'}>
              {read ? <Check className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {read ? 'Marked as read' : 'Mark as read'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
