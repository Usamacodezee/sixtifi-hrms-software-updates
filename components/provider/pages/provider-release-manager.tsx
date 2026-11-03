'use client';

import { CalendarClock, CheckCircle2, Rocket } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/lib/format';

export function ProviderReleaseManager({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { releases } = useAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Release Manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plan, review, and schedule grouped product releases across modules and Jira-linked changes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {releases.map((release) => (
          <Card key={release.id} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-foreground">{release.name}</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{release.version}</div>
              </div>
              <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{release.status}</span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between"><span>Included changes</span><strong className="text-foreground">{release.announcementIds.length}</strong></div>
              <div className="flex items-center justify-between"><span>Included modules</span><strong className="text-foreground">{release.modules.length}</strong></div>
              <div className="flex items-center justify-between"><span>Approval status</span><strong className="text-foreground">{release.approvalStatus}</strong></div>
              <div className="flex items-center justify-between"><span>Deployment status</span><strong className="text-foreground">{release.deploymentStatus}</strong></div>
              <div className="flex items-center justify-between"><span>Planned date</span><strong className="text-foreground">{release.scheduledAt ? formatDateTime(release.scheduledAt) : 'Not scheduled'}</strong></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
