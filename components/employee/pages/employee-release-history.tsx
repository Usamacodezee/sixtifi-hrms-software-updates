'use client';

import { History, Sparkles } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { formatDate } from '@/lib/format';
import { CategoryBadge } from '@/components/shared/badges';
import { Card } from '@/components/ui/card';

export function EmployeeReleaseHistory({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { visibleToEmployee } = useAnnouncements();
  const releases = [...visibleToEmployee].sort(
    (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Release History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Archive of previously published product updates and feature rollouts for your org.
        </p>
      </div>

      <div className="space-y-4">
        {releases.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <button type="button" onClick={() => onNavigate(`/employee/whats-new/${a.id}`)} className="w-full p-4 text-left sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={a.category} />
                    <span className="text-xs text-muted-foreground">Update</span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-foreground">{a.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(a.publishedAt ?? a.createdAt)}
                </div>
              </div>
            </button>
          </Card>
        ))}

        {releases.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center text-sm text-muted-foreground">
            <History className="h-6 w-6 text-muted-foreground" />
            <div>No release history is available yet.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
