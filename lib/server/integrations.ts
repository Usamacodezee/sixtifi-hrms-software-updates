export type GitHubPullRequestSummary = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  merged_at?: string | null;
  user?: { login?: string };
  state?: string;
  draft?: boolean;
};

export async function getGitHubPullRequests() {
  const enabled = process.env.ENABLE_LIVE_INTEGRATION === 'true';
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!enabled || !owner || !repo) {
    return [] as GitHubPullRequestSummary[];
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=10`,
    { headers, next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data)
    ? data.map((pr) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        html_url: pr.html_url,
        merged_at: pr.merged_at,
        user: pr.user,
        state: pr.state,
        draft: pr.draft,
      }))
    : [];
}
