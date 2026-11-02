'use client';

import { Megaphone } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderListing } from './provider-listing';
import { toast } from 'sonner';

export function ProviderUpdates({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements, updateAnnouncement, deleteAnnouncement, createAnnouncement } = useAnnouncements();

  return (
    <ProviderListing
      announcements={announcements.filter((a) => a.status === 'published' || a.status === 'scheduled')}
      config={{
        title: 'Scheduled & Published',
        description: 'All live and future product updates without drafts.',
        showStatusFilter: true,
      }}
      onNavigate={onNavigate}
      onEdit={(a) => onNavigate(`/provider/create/${a.id}`)}
      onPublishNow={(a) => {
        updateAnnouncement(a.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
          scheduledFor: undefined,
        });
        toast.success(`Published "${a.title}"`);
      }}
      onDuplicate={(a) => {
        createAnnouncement({
          title: `${a.title} (Copy)`,
          summary: a.summary,
          contentHtml: a.contentHtml,
          category: a.category,
          module: a.module,
          audienceType: a.audienceType,
          audienceOrgs: a.audienceOrgs,
          notifications: a.notifications,
          status: a.status === 'scheduled' ? 'scheduled' : 'published',
          scheduledFor: a.status === 'scheduled' ? a.scheduledFor : undefined,
          heroImage: a.heroImage,
        });
        toast.success('Duplicated announcement');
      }}
      onDelete={(a) => {
        deleteAnnouncement(a.id);
        toast.success(`Deleted "${a.title}"`);
      }}
      emptyIcon={Megaphone}
      emptyTitle="No scheduled or published updates"
      emptyDescription="Create your first announcement to share updates with your customers."
    />
  );
}