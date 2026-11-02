'use client';

import { ArrowRight, BellRing, BookOpenText, Megaphone, Sparkles } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { formatRelative } from '@/lib/format';
import { CategoryBadge, StatusBadge } from '@/components/shared/badges';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmployeeDashboard({ onNavigate }: { onNavigate: (to: string) => void }) {
  const {
    visibleToEmployee,
    isRead,
    employeeAccessRole,
    canAcknowledgeProductUpdates,
    canManageAnnouncements,
  } = useAnnouncements();

  const unread = visibleToEmployee.filter((a) => !isRead(a.id));
  const accessSummary =
    employeeAccessRole === 'organization-admin'
      ? 'Org Admin: Full rollout visibility and publishing control'
      : employeeAccessRole === 'hr-admin'
        ? 'HR Admin: Can review and acknowledge product updates'
        : employeeAccessRole === 'manager'
          ? 'Manager: Read-only access to employee-facing releases'
          : 'Employee: Basic access to company updates';
  const recent = [...visibleToEmployee]
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt ?? a.createdAt).getTime();
      const dateB = new Date(b.publishedAt ?? b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep up with the latest HRMS product updates and company announcements.
          </p>
        </div>
        <Button onClick={() => onNavigate('/employee/whats-new')}>
          View all updates
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Published updates" value={visibleToEmployee.length} icon={Megaphone} tone="primary" />
        <MetricCard label="Unread" value={unread.length} icon={BellRing} tone="warning" />
        <MetricCard label="Read" value={visibleToEmployee.length - unread.length} icon={BookOpenText} tone="success" />
        <MetricCard label="Active updates" value={visibleToEmployee.length} icon={Sparkles} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Recent announcements</h2>
          </div>
          <div className="divide-y divide-border">
            {recent.map((a) => {
              const read = isRead(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onNavigate(`/employee/whats-new/${a.id}`)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge category={a.category} />
                      {!read && <StatusBadge status="published" className="bg-primary-soft text-primary border-primary/30" />}
                    </div>
                    <h3 className="mt-2 truncate text-sm font-semibold text-foreground">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.summary}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div>{formatRelative(a.publishedAt ?? a.createdAt)}</div>
                    <div className="mt-1 font-medium text-foreground">Update</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="h-fit">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Your updates</h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Access summary</p>
              <p className="mt-1 text-sm font-medium text-foreground">{accessSummary}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {visibleToEmployee.length} active announcements are visible to your organization.</p>
              <p>• {unread.length} are still unread.</p>
              <p>• {new Set(visibleToEmployee.map((a) => a.module)).size} tracked HRMS modules are included.</p>
              <p>• {canAcknowledgeProductUpdates ? 'Acknowledgement is enabled for this role.' : 'No acknowledgement requirement for this role.'}</p>
              <p>• {canManageAnnouncements ? 'This role can manage update publishing and scheduling.' : 'This role is restricted to viewing updates.'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Megaphone;
  tone: 'primary' | 'warning' | 'success' | 'info';
}) {
  const toneClass = {
    primary: 'bg-primary-soft text-primary',
    warning: 'bg-warning-soft text-warning',
    success: 'bg-success-soft text-success',
    info: 'bg-info-soft text-info',
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
