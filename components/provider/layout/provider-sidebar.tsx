'use client';

import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  Clock,
  Send,
  FileEdit,
  Building2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Counts {
  updates: number;
  published: number;
  scheduled: number;
  drafts: number;
}

interface NavItem {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  to: string;
}

export function ProviderSidebar({
  activeSection,
  counts,
  onNavigate,
}: {
  activeSection: string;
  counts: Counts;
  onNavigate: (to: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/provider/dashboard' },
    { key: 'updates', label: 'Scheduled & Published', icon: Megaphone, badge: counts.updates, to: '/provider/updates' },
    { key: 'create', label: 'Create Announcement', icon: PlusCircle, to: '/provider/create' },
  ];

  const go = (to: string) => {
    onNavigate(to);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground shadow-xl">
            <SidebarContent
              items={items}
              activeSection={activeSection}
              onNavigate={go}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <SidebarContent
          items={items}
          activeSection={activeSection}
          onNavigate={go}
        />
      </aside>

      {/* Mobile open button — floats above content */}
      <button
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-md lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>
    </>
  );
}

function SidebarContent({
  items,
  activeSection,
  onNavigate,
  onClose,
}: {
  items: NavItem[];
  activeSection: string;
  onNavigate: (to: string) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Helix HRMS</div>
            <div className="text-xs text-sidebar-foreground/60">Software Provider</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-white/10"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.to)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-white')} style={{ width: 18, height: 18 }} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    active ? 'bg-white/25 text-primary-foreground' : 'bg-white/10 text-sidebar-foreground/80',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              SW
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-white">Sam Whitfield</div>
              <div className="text-xs text-sidebar-foreground/60">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}