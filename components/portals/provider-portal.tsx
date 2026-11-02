'use client';

import { useMemo } from 'react';
import { useHashRoute, parsePath } from '@/lib/router';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderSidebar } from '@/components/provider/layout/provider-sidebar';
import { ProviderTopbar } from '@/components/provider/layout/provider-topbar';
import { ProviderDashboard } from '@/components/provider/pages/provider-dashboard';
import { ProviderUpdates } from '@/components/provider/pages/provider-updates';
import { ProviderCreate } from '@/components/provider/pages/provider-create';
import { ProviderScheduled } from '@/components/provider/pages/provider-scheduled';
import { ProviderPublished } from '@/components/provider/pages/provider-published';
import { ProviderDrafts } from '@/components/provider/pages/provider-drafts';
import { ProviderAnnouncementDetail } from '@/components/provider/pages/provider-announcement-detail';
import { Toaster } from '@/components/ui/sonner';

export function ProviderPortal() {
  const { path, navigate } = useHashRoute();
  const { announcements } = useAnnouncements();
  const { segments } = parsePath(path);

  const counts = useMemo(
    () => ({
      updates: announcements.filter((a) => a.status === 'published' || a.status === 'scheduled').length,
      published: announcements.filter((a) => a.status === 'published').length,
      scheduled: announcements.filter((a) => a.status === 'scheduled').length,
      drafts: 0,
    }),
    [announcements],
  );

  let content: React.ReactNode;
  const section = segments[1];

  if (section === 'dashboard' || !section) {
    content = <ProviderDashboard onNavigate={navigate} />;
  } else if (section === 'updates') {
    content = <ProviderUpdates onNavigate={navigate} />;
  } else if (section === 'create') {
    content = (
      <ProviderCreate
        editingId={segments[2]}
        onPublished={() => navigate('/provider/updates')}
      />
    );
  } else if (section === 'scheduled' || section === 'published') {
    content = <ProviderUpdates onNavigate={navigate} />;
  } else if (section === 'analytics') {
    content = <ProviderDashboard onNavigate={navigate} />;
  } else if (section === 'announcement' && segments[2]) {
    content = <ProviderAnnouncementDetail id={segments[2]} onNavigate={navigate} />;
  } else {
    content = <ProviderDashboard onNavigate={navigate} />;
  }

  return (
    <div className="flex min-h-screen bg-background-subtle">
      <ProviderSidebar
        activeSection={section || 'dashboard'}
        counts={counts}
        onNavigate={navigate}
      />
      <div className="flex flex-1 flex-col min-w-0 lg:pl-0">
        <ProviderTopbar onNavigate={navigate} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {content}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}