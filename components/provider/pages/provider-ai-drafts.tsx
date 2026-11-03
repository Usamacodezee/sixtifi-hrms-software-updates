'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, FileX2, Pencil, Trash2, XCircle } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/lib/format';

export function ProviderAIDrafts({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { announcements, approveDraft, rejectDraft, deleteAnnouncement } = useAnnouncements();
  const [tab, setTab] = useState<'all' | 'pending' | 'needs-clarification' | 'approved' | 'rejected'>('all');

  const drafts = useMemo(() => {
    const aiDrafts = announcements.filter((a) => a.aiGenerated);
    return aiDrafts.filter((draft) => {
      if (tab === 'all') return true;
      if (tab === 'pending') return draft.reviewStatus === 'pending';
      if (tab === 'needs-clarification') return draft.reviewStatus === 'needs-clarification';
      if (tab === 'approved') return draft.reviewStatus === 'approved';
      return draft.reviewStatus === 'rejected';
    });
  }, [announcements, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Generated Drafts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review, edit and approve AI-created announcements before deployment.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'needs-clarification', 'approved', 'rejected'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item as typeof tab)}
            className={[
              'rounded-full border px-3 py-1.5 text-xs font-medium',
              tab === item ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground',
            ].join(' ')}
          >
            {item === 'needs-clarification' ? 'Needs Clarification' : item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Announcement</th>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source PR</th>
                <th className="px-4 py-3 font-medium">AI Confidence</th>
                <th className="px-4 py-3 font-medium">Generated</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No drafts match the current filter.
                  </td>
                </tr>
              ) : (
                drafts.map((draft) => (
                  <tr key={draft.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{draft.title}</p>
                      <p className="text-xs text-muted-foreground">{draft.summary}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{draft.module}</td>
                    <td className="px-4 py-3 text-muted-foreground">{draft.changeCategory ?? draft.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{draft.sourcePullRequests?.[0] ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{draft.aiConfidence ?? 0}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(draft.generatedDate ?? draft.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {draft.reviewStatus ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onNavigate?.(`/provider/announcement/${draft.id}`)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onNavigate?.(`/provider/announcement/${draft.id}`)}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => approveDraft(draft.id, 'Super Admin')}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rejectDraft(draft.id, 'Needs manual review before publish.')}>
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAnnouncement(draft.id)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
