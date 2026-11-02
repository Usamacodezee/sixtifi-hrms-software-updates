'use client';

import { useMemo, useState } from 'react';
import {
  Building2,
  Eye,
  TrendingUp,
  Mail,
  Bell,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ORGANIZATIONS } from '@/lib/mock-data';
import {
  aggregateReadStats,
  readStatsForAnnouncement,
} from '@/lib/analytics';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { CategoryBadge } from '@/components/shared/badges';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ProviderAnalytics({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { announcements, reads } = useAnnouncements();
  const [selectedId, setSelectedId] = useState<string>(
    announcements.find((a) => a.status === 'published')?.id ?? '',
  );

  const agg = useMemo(
    () => aggregateReadStats(announcements, ORGANIZATIONS, reads),
    [announcements, reads],
  );

  const published = useMemo(
    () => announcements.filter((a) => a.status === 'published'),
    [announcements],
  );

  const selected = announcements.find((a) => a.id === selectedId) ?? published[0];
  const selectedStats = selected
    ? readStatsForAnnouncement(selected, ORGANIZATIONS, reads)
    : null;

  // Per-org reach: how many published announcements each org has been targeted by, and read count.
  const orgMatrix = useMemo(() => {
    return ORGANIZATIONS.map((org) => {
      let targeted = 0;
      let read = 0;
      for (const a of published) {
        const reached =
          a.audienceType === 'all' || a.audienceOrgs.includes(org.id);
        if (reached) {
          targeted++;
          if (reads.some((r) => r.announcementId === a.id && r.orgId === org.id)) {
            read++;
          }
        }
      }
      return { org, targeted, read, rate: targeted === 0 ? 0 : read / targeted };
    }).sort((a, b) => b.targeted - a.targeted);
  }, [published, reads]);

  // Category distribution
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    published.forEach((a) => map.set(a.category, (map.get(a.category) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [published]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery and engagement across customer organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Announcements Published" value={published.length} icon={Megaphone} tone="primary" />
        <StatCard label="Organizations Reached" value={agg.totalReached} icon={Building2} tone="info" hint={`of ${ORGANIZATIONS.length} total`} />
        <StatCard label="Total Reads" value={agg.totalRead} icon={Eye} tone="success" />
        <StatCard
          label="Overall Read Rate"
          value={`${Math.round(agg.overallReadRate * 100)}%`}
          icon={TrendingUp}
          tone="primary"
          delta={{ value: 'healthy engagement', positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Per-announcement delivery */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Delivery by Announcement</h2>
              <p className="text-xs text-muted-foreground">Read rate per published announcement</p>
            </div>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="h-9 w-full sm:w-64">
                <SelectValue placeholder="Select announcement" />
              </SelectTrigger>
              <SelectContent>
                {published.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && selectedStats ? (
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={selected.category} />
                <span className="text-xs text-muted-foreground">{selected.module}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{selected.title}</h3>
              <p className="text-xs text-muted-foreground">Published {formatRelative(selected.publishedAt)}</p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <MetricBox label="Reached" value={selectedStats.reachedCount} icon={Building2} tone="text-info" />
                <MetricBox label="Read" value={selectedStats.readCount} icon={Eye} tone="text-success" />
                <MetricBox label="Read Rate" value={`${Math.round(selectedStats.readRate * 100)}%`} icon={TrendingUp} tone="text-primary" />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Organizations ({selectedStats.readCount}/{selectedStats.reachedCount} read)
                </p>
                <div className="max-h-64 space-y-1.5 overflow-y-auto scrollbar-thin">
                  {selectedStats.reachedOrgs.map((orgId) => {
                    const org = ORGANIZATIONS.find((o) => o.id === orgId)!;
                    const read = selectedStats.readOrgs.includes(orgId);
                    return (
                      <div
                        key={orgId}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.industry} · {org.plan}</p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            read ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {read ? <><Eye className="h-3 w-3" /> Read</> : 'Unread'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-muted-foreground">No published announcements yet.</div>
          )}
        </Card>

        {/* Category breakdown */}
        <Card>
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">By Category</h2>
          </div>
          <div className="p-4">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {byCategory.map(([cat, count]) => {
                  const max = byCategory[0][1];
                  return (
                    <li key={cat}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{cat}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Per-org matrix */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Organization Delivery</h2>
            <p className="text-xs text-muted-foreground">Targeted vs. read per organization</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Organization</th>
                <th className="px-5 py-2.5 font-medium">Plan</th>
                <th className="px-5 py-2.5 text-right font-medium">Targeted</th>
                <th className="px-5 py-2.5 text-right font-medium">Read</th>
                <th className="px-5 py-2.5 font-medium">Read Rate</th>
              </tr>
            </thead>
            <tbody>
              {orgMatrix.map(({ org, targeted, read, rate }) => (
                <tr key={org.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.industry} · {org.employeeCount.toLocaleString()} emp.</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">{targeted}</td>
                  <td className="px-5 py-3 text-right font-medium text-success">{read}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={rate * 100} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{Math.round(rate * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notification channel summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ChannelCard icon={Megaphone} label="Product Updates" count={published.filter((a) => a.notifications.productUpdates).length} tone="text-primary" />
        <ChannelCard icon={Bell} label="Notification Bell" count={published.filter((a) => a.notifications.notificationBell).length} tone="text-info" />
        <ChannelCard icon={Mail} label="Email" count={published.filter((a) => a.notifications.email).length} tone="text-success" />
        <ChannelCard icon={TrendingUp} label="Dashboard Banner" count={published.filter((a) => a.notifications.dashboardBanner).length} tone="text-warning" />
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof Eye;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn('h-3.5 w-3.5', tone)} />
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ChannelCard({
  icon: Icon,
  label,
  count,
  tone,
}: {
  icon: typeof Eye;
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', tone)} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground">announcements enabled</p>
    </Card>
  );
}