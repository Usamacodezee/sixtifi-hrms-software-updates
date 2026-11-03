'use client';

import { useEffect, useState } from 'react';
import { Activity, GitBranch, Globe, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchIntegrationStatus, type IntegrationStatus } from '@/lib/client/integrations';

export function ProviderIntegrations({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const next = await fetchIntegrationStatus();
        if (active) setStatus(next);
      } catch {
        if (active) {
          setStatus({
            enabled: false,
            demoMode: true,
            github: { connected: false, pullRequests: [] },
            message: 'Unable to load live GitHub status.',
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const repoConfig = [
    { label: 'Repository', value: 'sixtify/app' },
    { label: 'Branch', value: 'main' },
    { label: 'PR trigger', value: 'Merged PRs only' },
    { label: 'Labels included', value: 'feature, bug-fix, improvement' },
    { label: 'Ignored paths', value: 'internal/**, docs/**' },
    { label: 'Source of truth', value: 'GitHub only' },
  ];

  const liveEnabled = !!status?.enabled;
  const githubConnected = !!status?.github.connected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">GitHub Integration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {liveEnabled
            ? 'Live GitHub data is enabled for this environment.'
            : 'This demo uses sample GitHub data so the workflow is easy to understand. Real PR sync is available once GitHub credentials are configured.'}
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="h-4 w-4" />
          {liveEnabled ? 'Live GitHub sync active' : 'Demo mode is active'}
        </div>
        <p className="mt-1 text-xs leading-6 opacity-90">
          {status?.message ?? 'To use live GitHub data, add secure credentials and enable live integration in the backend environment.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">GitHub</div>
                <div className="text-xs text-muted-foreground">{githubConnected ? 'Connected' : 'Demo connection'}</div>
              </div>
            </div>
            <span className={[
              'rounded-full border px-2 py-1 text-xs font-medium',
              githubConnected
                ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
            ].join(' ')}>
              {githubConnected ? 'Live' : 'Demo mode'}
            </span>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Repository</dt><dd className="font-medium text-foreground">sixtify/app</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Default branch</dt><dd className="font-medium text-foreground">main</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last sync</dt><dd className="font-medium text-foreground">{loading ? 'Loading…' : githubConnected ? 'Connected now' : 'Demo snapshot'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Status</dt><dd className="font-medium text-foreground">{status?.github.error ?? (githubConnected ? 'Connected' : 'Demo only')}</dd></div>
          </dl>

          <div className="mt-5 space-y-3">
            {(status?.github.pullRequests ?? []).slice(0, 5).map((pr) => (
              <div key={pr.number} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="font-medium text-foreground">#{pr.number} {pr.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{pr.user?.login ?? 'Unknown author'}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled={!liveEnabled}>Connect GitHub</Button>
            <Button variant="outline">Configure repo</Button>
            <Button variant="outline">Test connection</Button>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">GitHub setup</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {repoConfig.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-sm font-medium text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
