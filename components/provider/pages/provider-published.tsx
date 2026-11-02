'use client';

import { Send } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderListing } from './provider-listing';
import { toast } from 'sonner';

export function ProviderPublished({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements, deleteAnnouncement } = useAnnouncements();
  const published = announcements.filter((a) => a.status === 'published');

  return (
    <ProviderListing
      announcements={published}
      config={{
        title: 'Published',
        description: 'Announcements currently live to customer organizations.',
      }}
      onNavigate={onNavigate}
      onDelete={(a) => {
        deleteAnnouncement(a.id);
        toast.success(`Deleted "${a.title}"`);
      }}
      emptyIcon={Send}
      emptyTitle="Nothing published"
      emptyDescription="Publish an announcement to make it visible to your customers."
    />
  );
}