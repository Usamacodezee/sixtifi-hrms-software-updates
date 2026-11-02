'use client';

import { useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Eye,
  Send,
  Trash2,
  CalendarClock,
  Save,
  Mail,
  Bell,
  Megaphone,
  LayoutDashboard,
} from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ORGANIZATIONS } from '@/lib/mock-data';
import { readStatsForAnnouncement } from '@/lib/analytics';
import { formatDateTime, formatRelative } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryBadge, StatusBadge } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Megaphone as EmptyIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProviderAnnouncementDetail({
  id,
  onNavigate,
}: {
  id: string;
  onNavigate?: (to: string) => void;
}) {
  const { getAnnouncement, updateAnnouncement, deleteAnnouncement, reads } = useAnnouncements();
  const a = getAnnouncement(id);

  const stats = useMemo(
    () => (a ? readStatsForAnnouncement(a, ORGANIZATIONS, reads) : null),
    [a, reads],
  );

  if (!a) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title="Announcement not found"
        description="It may have been deleted."
        action={<Button size="sm" onClick={() => onNavigate?.('/provider/updates')}>Back to updates</Button>}
      />
    );
  }

  const notifs = [
    { on: a.notifications.productUpdates, label: 'Product Updates', icon: Megaphone },
    { on: a.notifications.notificationBell, label: 'Notification Bell', icon: Bell },
    { on: a.notifications.email, label: 'Email', icon: Mail },
    { on: a.notifications.dashboardBanner, label: 'Dashboard Banner', icon: LayoutDashboard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onNavigate?.('/provider/updates')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card className="overflow-hidden">
            {a.heroImage && (
              <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.heroImage} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={a.category} />
                <StatusBadge status={a.status} />
                <span className="text-xs text-muted-foreground">{a.module}</span>
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{a.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{a.summary}</p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>By {a.author}</span>
                <span>Created {formatDateTime(a.createdAt)}</span>
                {a.publishedAt && <span>Published {formatRelative(a.publishedAt)}</span>}
                {a.scheduledFor && <span className="text-warning">Schedules for {formatDateTime(a.scheduledFor)}</span>}
              </div>

              <div
                className="rte-content mt-5 border-t border-border pt-4 text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: a.contentHtml }}
              />
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            {a.status === 'draft' && (
              <Button
                onClick={() => {
                  updateAnnouncement(a.id, { status: 'published', publishedAt: new Date().toISOString(), scheduledFor: undefined });
                  toast.success('Published');
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish now
              </Button>
            )}
            {a.status === 'scheduled' && (
              <Button
                onClick={() => {
                  updateAnnouncement(a.id, { status: 'published', publishedAt: new Date().toISOString(), scheduledFor: undefined });
                  toast.success('Published now');
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish now
              </Button>
            )}
            {a.status === 'published' && (
              <Button
                variant="outline"
                onClick={() => {
                  updateAnnouncement(a.id, { status: 'draft', publishedAt: undefined });
                  toast.success('Moved to drafts');
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                Unpublish to draft
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (confirm(`Delete "${a.title}"? This cannot be undone in the demo.`)) {
                  deleteAnnouncement(a.id);
                  toast.success('Deleted');
                  onNavigate?.('/provider/updates');
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Eye className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Delivery</h2>
            </div>
            <div className="p-5">
              {a.status !== 'published' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  {a.status === 'draft' ? 'Not yet delivered — draft.' : `Scheduled ${formatDateTime(a.scheduledFor)}`}
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Reached</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{stats.reachedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Read</p>
                      <p className="mt-1 text-lg font-semibold text-success">{stats.readCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="mt-1 text-lg font-semibold text-primary">{Math.round(stats.readRate * 100)}%</p>
                    </div>
                  </div>
                  <Progress value={stats.readRate * 100} className="mt-3" />
                </>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Building2 className="h-4 w-4 text-info" />
              <h2 className="text-sm font-semibold text-foreground">
                Audience ({a.audienceType === 'all' ? 'All' : `${a.audienceOrgs.length} selected`})
              </h2>
            </div>
            <div className="max-h-56 overflow-y-auto scrollbar-thin p-3">
              <ul className="space-y-1">
                {stats?.reachedOrgs.map((orgId) => {
                  const org = ORGANIZATIONS.find((o) => o.id === orgId)!;
                  const read = stats.readOrgs.includes(orgId);
                  return (
                    <li
                      key={orgId}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <span className="min-w-0 truncate text-foreground">{org.name}</span>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-medium',
                          read ? 'text-success' : 'text-muted-foreground',
                        )}
                      >
                        {read ? 'Read' : 'Unread'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Channels</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {notifs.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li key={n.label} className="flex items-center gap-2 text-sm">
                      <Icon className={cn('h-4 w-4', n.on ? 'text-primary' : 'text-muted-foreground')} />
                      <span className={n.on ? 'text-foreground' : 'text-muted-foreground line-through'}>{n.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}