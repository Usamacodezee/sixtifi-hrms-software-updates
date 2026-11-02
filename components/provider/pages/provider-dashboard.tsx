'use client';

import { useMemo } from 'react';
import {
  Megaphone,
  Send,
  Clock,
  Building2,
  Eye,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { DEFAULT_ROLE_PERMISSIONS, ORGANIZATIONS } from '@/lib/mock-data';
import { aggregateReadStats } from '@/lib/analytics';
import { formatRelative } from '@/lib/format';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge, CategoryBadge } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const permissionGroups = [
  { key: 'software_updates.view', label: 'View' },
  { key: 'software_updates.create', label: 'Create' },
  { key: 'software_updates.edit', label: 'Edit' },
  { key: 'software_updates.delete', label: 'Delete' },
] as const;

export function ProviderDashboard({
  onNavigate,
}: {
  onNavigate?: (to: string) => void;
}) {
  const { announcements } = useAnnouncements();

  const stats = useMemo(() => {
    const published = announcements.filter((a) => a.status === 'published');
    const scheduled = announcements.filter((a) => a.status === 'scheduled');
    const drafts = announcements.filter((a) => a.status === 'draft');
    const agg = aggregateReadStats(announcements, ORGANIZATIONS, []);
    return {
      total: announcements.length,
      published: published.length,
      scheduled: scheduled.length,
      drafts: drafts.length,
      reached: agg.totalReached,
      readRate: agg.overallReadRate,
    };
  }, [announcements]);

  const recent = useMemo(
    () =>
      [...announcements]
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime(),
        )
        .slice(0, 5),
    [announcements],
  );

  const upcoming = useMemo(
    () =>
      announcements
        .filter((a) => a.status === 'scheduled')
        .sort(
          (a, b) =>
            new Date(a.scheduledFor ?? 0).getTime() -
            new Date(b.scheduledFor ?? 0).getTime(),
        ),
    [announcements],
  );

  const permissionMatrix = useMemo(
    () => [
      {
        role: 'Employee',
        description: 'Consumer access',
        permissions: DEFAULT_ROLE_PERMISSIONS.employee,
      },
      {
        role: 'Manager',
        description: 'Team visibility',
        permissions: DEFAULT_ROLE_PERMISSIONS.manager,
      },
      {
        role: 'HR Admin',
        description: 'Operational controls',
        permissions: DEFAULT_ROLE_PERMISSIONS['hr-admin'],
      },
      {
        role: 'Organization Admin',
        description: 'Full organization scope',
        permissions: DEFAULT_ROLE_PERMISSIONS['organization-admin'],
      },
      {
        role: 'Super Admin',
        description: 'Provider publisher',
        permissions: DEFAULT_ROLE_PERMISSIONS.provider,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track updates, reach, engagement, and the provider-controlled permission model across the HRMS module.
          </p>
        </div>
        {onNavigate && (
          <Button onClick={() => onNavigate('/provider/create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Updates"
          value={stats.total}
          icon={Megaphone}
          tone="primary"
          delta={{ value: '+3 this month', positive: true }}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={Send}
          tone="success"
          hint="Live to customers"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={Clock}
          tone="warning"
          hint="Awaiting release"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon={Megaphone}
          tone="neutral"
          hint="Not yet sent"
        />
        <StatCard
          label="Organizations Reached"
          value={stats.reached}
          icon={Building2}
          tone="info"
          hint={`of ${ORGANIZATIONS.length} total`}
        />
        <StatCard
          label="Read Rate"
          value={`${Math.round(stats.readRate * 100)}%`}
          icon={Eye}
          tone="primary"
          delta={{ value: '+4% vs last cycle', positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Announcements</h2>
              <p className="text-xs text-muted-foreground">Latest activity across all statuses</p>
            </div>
            {onNavigate && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('/provider/updates')}>
                View all
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="divide-y divide-border">
            {recent.map((a) => (
              <button
                key={a.id}
                onClick={() => onNavigate?.(`/provider/announcement/${a.id}`)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={a.category} />
                    <StatusBadge status={a.status} />
                  </div>
                  <h3 className="mt-2 truncate text-sm font-medium text-foreground">{a.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{formatRelative(a.publishedAt ?? a.createdAt)}</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{a.module}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Clock className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Upcoming Scheduled</h2>
            </div>
            <div className="p-4">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scheduled announcements.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Publishes {formatRelative(a.scheduledFor)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Overall Read Rate</h2>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold text-foreground">
                  {Math.round(stats.readRate * 100)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {ORGANIZATIONS.length} organizations
                </span>
              </div>
              <Progress value={stats.readRate * 100} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                Share of targeted orgs that have opened announcements.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Role Permission Map</h2>
            <p className="text-xs text-muted-foreground">Visual access model for Product Updates and provider announcement controls</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Provider-owned publishing
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Scope</th>
                {permissionGroups.map((group) => (
                  <th key={group.key} className="px-3 py-3 font-medium text-center">
                    <div className="min-w-[130px] text-xs uppercase tracking-wide">{group.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => {
                const rolePerms = new Set(row.permissions);
                return (
                  <tr key={row.role} className="border-b border-border last:border-0 align-top">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {row.role === 'Super Admin' ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : row.role === 'Organization Admin' ? (
                            <Users className="h-4 w-4" />
                          ) : row.role === 'HR Admin' ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{row.role}</div>
                          <div className="text-xs text-muted-foreground">{row.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground align-middle">
                      {row.role === 'Employee' && 'Read only'}
                      {row.role === 'Manager' && 'Team + org visibility'}
                      {row.role === 'HR Admin' && 'Operational oversight'}
                      {row.role === 'Organization Admin' && 'Organization-level control'}
                      {row.role === 'Super Admin' && 'Provider-wide publishing'}
                    </td>
                    {permissionGroups.map((group) => {
                      const allowed = rolePerms.has(group.key);
                      return (
                        <td key={`${row.role}-${group.key}`} className="px-3 py-4 text-center align-middle">
                          <span
                            className={[
                              'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium',
                              allowed
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-muted text-muted-foreground border border-border',
                            ].join(' ')}
                          >
                            {allowed ? 'Yes' : 'No'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <AlertCircle className="h-4 w-4 text-warning" />
          <h2 className="text-base font-semibold text-foreground">Provider Control Summary</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Publisher</div>
            <div className="text-lg font-semibold text-foreground">Software Provider</div>
            <p className="mt-1 text-sm text-muted-foreground">Creates, schedules, and publishes all employee-facing announcements.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Audience</div>
            <div className="text-lg font-semibold text-foreground">Role + Org Scoping</div>
            <p className="mt-1 text-sm text-muted-foreground">Visibility is governed by provider rules and organization eligibility.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Employee Actions</div>
            <div className="text-lg font-semibold text-foreground">Read + Acknowledge</div>
            <p className="mt-1 text-sm text-muted-foreground">Employee access is limited to visible, published, valid update records.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}