'use client';

import { FileEdit } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderListing } from './provider-listing';
import { toast } from 'sonner';

export function ProviderDrafts({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const drafts = announcements.filter((a) => a.status === 'draft');

  return (
    <ProviderListing
      announcements={drafts}
      config={{ title: 'Drafts', description: 'Work in progress. Publish when ready.' }}
      onNavigate={onNavigate}
      onPublishNow={(a) => {
        updateAnnouncement(a.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
          scheduledFor: undefined,
        });
        toast.success(`Published "${a.title}"`);
      }}
      onDelete={(a) => {
        deleteAnnouncement(a.id);
        toast.success(`Deleted "${a.title}"`);
      }}
      emptyIcon={FileEdit}
      emptyTitle="No drafts"
      emptyDescription="Save a draft to come back to it later."
    />
  );
}