'use client';

import { ArrowRight, BellDot, CalendarClock } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { formatRelative } from '@/lib/format';
import { CategoryBadge } from '@/components/shared/badges';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmployeeWhatsNew({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { visibleToEmployee, isRead, employeeAccessRole, canAcknowledgeProductUpdates, canManageAnnouncements } = useAnnouncements();
  const sorted = [...visibleToEmployee].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">What\'s New</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Product updates and announcements published for your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <BellDot className="h-3.5 w-3.5 text-primary" />
            {sorted.filter((a) => !isRead(a.id)).length} unread
          </div>
          <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
            {employeeAccessRole === 'organization-admin'
              ? 'Org Admin'
              : employeeAccessRole === 'hr-admin'
                ? 'HR Admin'
                : employeeAccessRole === 'manager'
                  ? 'Manager'
                  : 'Employee'}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
        {canManageAnnouncements
          ? 'This role can manage publishing, scheduling, and communication controls.'
          : canAcknowledgeProductUpdates
            ? 'This role can review and acknowledge HRMS product updates.'
            : 'This role has view-only access to employee updates.'}
      </div>

      {sorted.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          There are no active announcements for your organization right now.
        </Card>
      ) : (
        <div className="grid gap-4">
          {sorted.map((a) => {
            const read = isRead(a.id);
            return (
              <Card key={a.id} className="overflow-hidden transition-colors hover:border-primary/40">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={a.category} />
                        <span className="text-xs text-muted-foreground">Update</span>
                        {!read && (
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            New
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-semibold text-foreground">{a.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{a.summary}</p>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {formatRelative(a.publishedAt ?? a.createdAt)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{a.module}</span>
                      <span>•</span>
                      <span>{a.author}</span>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate(`/employee/whats-new/${a.id}`)}>
                      {read ? 'View update' : 'Read update'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
