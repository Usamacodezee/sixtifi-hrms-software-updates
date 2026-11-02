'use client';

import { Clock } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderListing } from './provider-listing';
import { toast } from 'sonner';

export function ProviderScheduled({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const scheduled = announcements.filter((a) => a.status === 'scheduled');

  return (
    <ProviderListing
      announcements={scheduled}
      config={{ title: 'Scheduled', description: 'Announcements queued for future release.' }}
      onNavigate={onNavigate}
      onPublishNow={(a) => {
        updateAnnouncement(a.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
          scheduledFor: undefined,
        });
        toast.success(`Published "${a.title}" now`);
      }}
      onDelete={(a) => {
        deleteAnnouncement(a.id);
        toast.success(`Deleted "${a.title}"`);
      }}
      emptyIcon={Clock}
      emptyTitle="Nothing scheduled"
      emptyDescription="Schedule an announcement to publish at a later time."
    />
  );
}