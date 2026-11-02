'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Copy,
  Send,
  Clock,
  Inbox,
} from 'lucide-react';
import type { Announcement, AnnouncementCategory, AnnouncementStatus } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { formatRelative, formatDate } from '@/lib/format';
import { StatusBadge, CategoryBadge } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SortKey = 'newest' | 'oldest' | 'title';

export interface ListingConfig {
  status?: AnnouncementStatus | 'all';
  showStatusFilter?: boolean;
  title: string;
  description?: string;
}

export function ProviderListing({
  announcements,
  config,
  onNavigate,
  onPublishNow,
  onDuplicate,
  onDelete,
  emptyIcon = Inbox,
  emptyTitle = 'No announcements yet',
  emptyDescription = 'Create your first announcement to see it here.',
}: {
  announcements: Announcement[];
  config: ListingConfig;
  onNavigate: (to: string) => void;
  onPublishNow?: (a: Announcement) => void;
  onDuplicate?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
  emptyIcon?: typeof Inbox;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>(config.status ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    const effectiveStatus = config.status ?? statusFilter;
    let list = announcements.filter((a) => {
      if (effectiveStatus !== 'all' && a.status !== effectiveStatus) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${a.title} ${a.summary} ${a.module}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      const at = new Date(a.publishedAt ?? a.scheduledFor ?? a.createdAt).getTime();
      const bt = new Date(b.publishedAt ?? b.scheduledFor ?? b.createdAt).getTime();
      return sort === 'oldest' ? at - bt : bt - at;
    });
    return list;
  }, [announcements, query, statusFilter, categoryFilter, sort, config.status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{config.title}</h1>
        {config.description && (
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or module..."
              className="h-9 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {config.showStatusFilter && (
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AnnouncementStatus | 'all')}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AnnouncementCategory | 'all')}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={
                <Button size="sm" onClick={() => onNavigate('/provider/create')}>
                  Create Announcement
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4 sm:px-5',
                )}
              >
                <button
                  onClick={() => onNavigate(`/provider/announcement/${a.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={a.category} />
                    <StatusBadge status={a.status} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {a.module}
                    </span>
                  </div>
                  <h3 className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.summary}</p>
                </button>

                <div className="flex shrink-0 items-center gap-3 sm:gap-2">
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    {a.status === 'scheduled' ? (
                      <>
                        <div className="font-medium text-warning">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatDate(a.scheduledFor)}
                        </div>
                      </>
                    ) : (
                      <div>{formatRelative(a.publishedAt ?? a.createdAt)}</div>
                    )}
                    <div className="mt-0.5">{a.author}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onNavigate(`/provider/announcement/${a.id}`)}>
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
                      </DropdownMenuItem>
                      {a.status === 'draft' && onPublishNow && (
                        <DropdownMenuItem onClick={() => onPublishNow(a)}>
                          <Send className="mr-2 h-3.5 w-3.5" />
                          Publish now
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(a)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(a)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}