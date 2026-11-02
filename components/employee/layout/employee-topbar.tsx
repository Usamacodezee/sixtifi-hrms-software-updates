'use client';

import { Bell, CheckCheck, Clock3, Rocket, Sparkles } from 'lucide-react';
import { RoleSwitcher } from '@/components/shared/role-switcher';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAnnouncements } from '@/lib/announcement-store';

export function EmployeeTopbar({
  onNavigate,
  onMarkAllRead,
}: {
  onNavigate: (to: string) => void;
  onMarkAllRead: () => void;
}) {
  const { unreadCount, canViewProductUpdates } = useAnnouncements();

  const navItems = [
    { label: 'What\'s New', to: '/employee/whats-new', icon: Sparkles },
    { label: 'Release History', to: '/employee/release-history', icon: Clock3 },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6 lg:pl-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          H
        </div>
        <div className="hidden leading-tight md:block">
          <div className="text-sm font-semibold text-foreground">Helix HRMS</div>
          <div className="text-[11px] text-muted-foreground">Employee Hub</div>
        </div>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              onClick={() => onNavigate(item.to)}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Button variant="outline" size="sm" onClick={onMarkAllRead} className="hidden sm:inline-flex">
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all read
        </Button>

        {canViewProductUpdates && (
          <button
            type="button"
            title="Product Updates"
            onClick={() => onNavigate('/employee/whats-new')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background-subtle text-foreground transition-colors hover:bg-muted"
            aria-label="Product Updates"
          >
            <Rocket className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className={cn(
                'absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground',
              )}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('/employee/whats-new')}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background-subtle text-foreground transition-colors hover:bg-muted"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className={cn(
              'absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground',
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <RoleSwitcher />
      </div>
    </header>
  );
}
