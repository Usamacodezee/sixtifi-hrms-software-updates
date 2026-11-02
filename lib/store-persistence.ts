import type { AcknowledgementRecord, Announcement, ReadRecord } from './types';

export const ANNOUNCEMENTS_KEY = 'helix:announcements';
export const READS_KEY = 'helix:reads';
export const ACKS_KEY = 'helix:acknowledgements';

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