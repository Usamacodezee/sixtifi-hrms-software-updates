import type {
  AcknowledgementRecord,
  Announcement,
  AutomationLog,
  AutomationSettings,
  PullRequest,
  ReadRecord,
  Release,
} from './types';

export const ANNOUNCEMENTS_KEY = 'helix:announcements';
export const READS_KEY = 'helix:reads';
export const ACKS_KEY = 'helix:acknowledgements';
export const PULL_REQUESTS_KEY = 'helix:pull-requests';
export const AUTOMATION_LOGS_KEY = 'helix:automation-logs';
export const RELEASES_KEY = 'helix:releases';
export const AUTOMATION_SETTINGS_KEY = 'helix:automation-settings';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const storeAnnouncements = {
  load: (): Announcement[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<Announcement[]>(localStorage.getItem(ANNOUNCEMENTS_KEY)),
  save: (value: Announcement[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ANNOUNCEMENTS_KEY);
  },
};

export const storeReads = {
  load: (): ReadRecord[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<ReadRecord[]>(localStorage.getItem(READS_KEY)),
  save: (value: ReadRecord[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(READS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(READS_KEY);
  },
};

export const storeAcknowledgements = {
  load: (): AcknowledgementRecord[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<AcknowledgementRecord[]>(localStorage.getItem(ACKS_KEY)),
  save: (value: AcknowledgementRecord[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACKS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACKS_KEY);
  },
};

export const storePullRequests = {
  load: (): PullRequest[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<PullRequest[]>(localStorage.getItem(PULL_REQUESTS_KEY)),
  save: (value: PullRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PULL_REQUESTS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PULL_REQUESTS_KEY);
  },
};

export const storeAutomationLogs = {
  load: (): AutomationLog[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<AutomationLog[]>(localStorage.getItem(AUTOMATION_LOGS_KEY)),
  save: (value: AutomationLog[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTOMATION_LOGS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTOMATION_LOGS_KEY);
  },
};

export const storeReleases = {
  load: (): Release[] | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<Release[]>(localStorage.getItem(RELEASES_KEY)),
  save: (value: Release[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RELEASES_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RELEASES_KEY);
  },
};

export const storeAutomationSettings = {
  load: (): AutomationSettings | null =>
    typeof window === 'undefined'
      ? null
      : safeParse<AutomationSettings>(localStorage.getItem(AUTOMATION_SETTINGS_KEY)),
  save: (value: AutomationSettings) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTOMATION_SETTINGS_KEY, JSON.stringify(value));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTOMATION_SETTINGS_KEY);
  },
};
