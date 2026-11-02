'use client';

import { useHashRoute, parsePath } from '@/lib/router';
import { EmployeeTopbar } from '@/components/employee/layout/employee-topbar';
import { EmployeeWhatsNew } from '@/components/employee/pages/employee-whats-new';
import { EmployeeAnnouncementDetail } from '@/components/employee/pages/employee-announcement-detail';
import { EmployeeReleaseHistory } from '@/components/employee/pages/employee-release-history';
import { EmployeeDashboard } from '@/components/employee/pages/employee-dashboard';
import { Toaster } from '@/components/ui/sonner';
import { useAnnouncements } from '@/lib/announcement-store';
import { useLayoutEffect, useState } from 'react';

export function EmployeePortal() {
  const { path, navigate } = useHashRoute();
  const {
    visibleToEmployee,
    isRead,
    markAllRead,
    unreadCount,
    canViewProductUpdates,
  } = useAnnouncements();
  const { segments } = parsePath(path);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Reset banner dismissal when a new banner announcement arrives
  const bannerAnnouncement = visibleToEmployee.find(
    (a) => a.notifications.dashboardBanner && !isRead(a.id),
  );
  useLayoutEffect(() => {
    if (bannerAnnouncement) setBannerDismissed(false);
  }, [bannerAnnouncement?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const section = segments[1];

  let content: React.ReactNode;
  if ((section === 'whats-new' || section === 'release-history') && !canViewProductUpdates) {
    content = (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Product Updates access is not enabled</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not currently have permission to view the Product Updates feed.
        </p>
      </div>
    );
  } else if (section === 'whats-new' && !segments[2]) {
    content = <EmployeeWhatsNew onNavigate={navigate} />;
  } else if (section === 'whats-new' && segments[2]) {
    content = <EmployeeAnnouncementDetail id={segments[2]} onNavigate={navigate} />;
  } else if (section === 'release-history') {
    content = <EmployeeReleaseHistory onNavigate={navigate} />;
  } else if (section === 'dashboard' || !section) {
    content = <EmployeeWhatsNew onNavigate={navigate} />;
  } else {
    content = <EmployeeWhatsNew onNavigate={navigate} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-subtle">
      <EmployeeTopbar onNavigate={navigate} onMarkAllRead={markAllRead} />
      {bannerAnnouncement && !bannerDismissed && (
        <div className="border-b border-primary/20 bg-primary-soft px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              !
            </span>
            <p className="min-w-0 flex-1 text-sm text-foreground">
              <span className="font-semibold">{bannerAnnouncement.title}.</span>{' '}
              <span className="text-muted-foreground">{bannerAnnouncement.summary}</span>
            </p>
            <button
              onClick={() => navigate(`/employee/whats-new/${bannerAnnouncement.id}`)}
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              View
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="shrink-0 rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-primary/10"
              aria-label="Dismiss banner"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {content}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}