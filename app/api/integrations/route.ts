import { NextResponse } from 'next/server';
import { getGitHubPullRequests } from '@/lib/server/integrations';

export async function GET() {
  const enabled = process.env.ENABLE_LIVE_INTEGRATION === 'true';

  if (!enabled) {
    return NextResponse.json({
      enabled: false,
      demoMode: true,
      message: 'GitHub sync is disabled. The app is running with demo data.',
      github: { connected: false, pullRequests: [] },
    });
  }

  try {
    const result = await getGitHubPullRequests();

    return NextResponse.json({
      enabled: true,
      demoMode: false,
      github: {
        connected: true,
        pullRequests: result,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        enabled: true,
        demoMode: false,
        github: { connected: false, pullRequests: [], error: error instanceof Error ? error.message : 'GitHub sync failed' },
      },
      { status: 500 },
    );
  }
}
