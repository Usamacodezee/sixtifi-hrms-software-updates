'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { formatDateTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ProviderAutomationActivity({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { automationLogs } = useAnnouncements();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return automationLogs.filter((log) =>
      `${log.eventType} ${log.message} ${log.source}`.toLowerCase().includes(lower),
    );
  }, [automationLogs, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Automation Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every PR, AI analysis, approval, and deployment event.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity"
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Event Type</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{log.eventType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.message}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
