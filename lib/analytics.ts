import type { Announcement, Organization, ReadRecord } from './types';

export interface AnnouncementReadStats {
  announcementId: string;
  reachedOrgs: string[];
  readOrgs: string[];
  readCount: number;
  reachedCount: number;
  readRate: number; // 0..1
}

export function orgIdsForAnnouncement(
  a: Announcement,
  orgs: Organization[],
): string[] {
  return a.audienceType === 'all' ? orgs.map((o) => o.id) : a.audienceOrgs;
}

export function readStatsForAnnouncement(
  a: Announcement,
  orgs: Organization[],
  reads: ReadRecord[],
): AnnouncementReadStats {
  const reachedOrgs = orgIdsForAnnouncement(a, orgs);
  const readOrgIds = new Set(
    reads
      .filter((r) => r.announcementId === a.id && reachedOrgs.includes(r.orgId))
      .map((r) => r.orgId),
  );
  const readOrgs = reachedOrgs.filter((id) => readOrgIds.has(id));
  return {
    announcementId: a.id,
    reachedOrgs,
    readOrgs,
    readCount: readOrgs.length,
    reachedCount: reachedOrgs.length,
    readRate: reachedOrgs.length === 0 ? 0 : readOrgs.length / reachedOrgs.length,
  };
}

export function aggregateReadStats(
  announcements: Announcement[],
  orgs: Organization[],
  reads: ReadRecord[],
): {
  totalReached: number;
  totalRead: number;
  overallReadRate: number;
  perAnnouncement: AnnouncementReadStats[];
} {
  const perAnnouncement = announcements
    .filter((a) => a.status === 'published')
    .map((a) => readStatsForAnnouncement(a, orgs, reads));
  // organizations reached = unique orgs targeted by any published announcement
  const reachedSet = new Set<string>();
  perAnnouncement.forEach((s) => s.reachedOrgs.forEach((id) => reachedSet.add(id)));
  const totalReached = reachedSet.size;
  // total read: sum of per-org read pairs (an org reading 3 announcements = 3 reads)
  const totalRead = perAnnouncement.reduce((sum, s) => sum + s.readCount, 0);
  const possibleRead = perAnnouncement.reduce((sum, s) => sum + s.reachedCount, 0);
  return {
    totalReached,
    totalRead,
    overallReadRate: possibleRead === 0 ? 0 : totalRead / possibleRead,
    perAnnouncement,
  };
}
