'use client';

import { Megaphone } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderListing } from './provider-listing';
import { toast } from 'sonner';

export function ProviderUpdates({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements, updateAnnouncement, deleteAnnouncement, createAnnouncement } = useAnnouncements();

  return (
    <ProviderListing
      announcements={announcements}
      config={{
        title: 'Product Updates',
        description: 'All announcements across published, scheduled, and draft statuses.',
        showStatusFilter: true,
      }}
      onNavigate={onNavigate}
      onPublishNow={(a) => {
        updateAnnouncement(a.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
          scheduledFor: undefined,
        });
        toast.success(`Published "${a.title}"`);
      }}
      onDuplicate={(a) => {
        const copy = { ...a };
        createAnnouncement({
          title: `${a.title} (Copy)`,
          summary: a.summary,
          contentHtml: a.contentHtml,
          category: a.category,
          module: a.module,
          audienceType: a.audienceType,
          audienceOrgs: a.audienceOrgs,
          notifications: a.notifications,
          status: 'draft',
        });
        toast.success('Duplicated as draft');
      }}
      onDelete={(a) => {
        deleteAnnouncement(a.id);
        toast.success(`Deleted "${a.title}"`);
      }}
      emptyIcon={Megaphone}
      emptyTitle="No product updates"
      emptyDescription="Create your first announcement to share updates with your customers."
    />
  );
}