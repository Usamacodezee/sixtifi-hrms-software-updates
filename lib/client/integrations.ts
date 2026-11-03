export type IntegrationStatus = {
  enabled: boolean;
  demoMode: boolean;
  message?: string;
  github: {
    connected: boolean;
    pullRequests: Array<{ number: number; title: string; html_url?: string; user?: { login?: string } }>;
    error?: string;
  };
};

export async function fetchIntegrationStatus(): Promise<IntegrationStatus> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${baseUrl}/api/integrations`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load integration status');
  }

  return (await response.json()) as IntegrationStatus;
}
