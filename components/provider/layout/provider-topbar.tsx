'use client';

import { Bell, Search } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { RoleSwitcher } from '@/components/shared/role-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProviderTopbar({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { announcements } = useAnnouncements();
  const recent = announcements.filter((a) => a.status === 'published').slice(0, 3);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6 lg:pl-8">
      <div className="hidden flex-1 sm:block">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="h-9 bg-background-subtle pl-9"
            onChange={(e) => {
              const q = e.target.value.trim();
              onNavigate(q ? `/provider/updates?q=${encodeURIComponent(q)}` : '/provider/updates');
            }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button
          size="sm"
          onClick={() => onNavigate('/provider/create')}
          className="hidden sm:inline-flex"
        >
          New Announcement
        </Button>

        <div className="relative hidden sm:block">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          {recent.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary pulse-dot" />
          )}
        </div>

        <RoleSwitcher />
      </div>
    </header>
  );
}