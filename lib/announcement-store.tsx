'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ANNOUNCEMENTS_KEY,
  READS_KEY,
  storeReads,
  storeAnnouncements,
} from './store-persistence';
import type {
  Announcement,
  AppRole,
  EmployeeAccessRole,
  NotificationPrefs,
  PermissionKey,
  ReadRecord,
} from './types';
import {
  DEFAULT_ROLE_PERMISSIONS,
  EMPLOYEE_ORG_ID,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_READS,
} from './mock-data';

interface CreateAnnouncementInput {
  title: string;
  summary: string;
  contentHtml: string;
  category: Announcement['category'];
  module: Announcement['module'];
  audienceType: 'all' | 'selected';
  audienceOrgs: string[];
  notifications: NotificationPrefs;
  status: Announcement['status'];
  scheduledFor?: string;
  heroImage?: string;
}

interface AnnouncementContextValue {
  announcements: Announcement[];
  reads: ReadRecord[];
  role: AppRole;
  setRole: (role: AppRole) => void;
  employeeAccessRole: EmployeeAccessRole;
  setEmployeeAccessRole: (role: EmployeeAccessRole) => void;
  permissions: PermissionKey[];
  hasPermission: (permission: PermissionKey) => boolean;
  canViewProductUpdates: boolean;
  canAcknowledgeProductUpdates: boolean;
  canManageAnnouncements: boolean;
  employeeOrgId: string;
  createAnnouncement: (input: CreateAnnouncementInput) => Announcement;
  updateAnnouncement: (id: string, patch: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  markAsRead: (announcementId: string) => void;
  markAllRead: () => void;
  isRead: (announcementId: string) => boolean;
  unreadCount: number;
  visibleToEmployee: Announcement[];
  getAnnouncement: (id: string) => Announcement | undefined;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

export function AnnouncementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    () => storeAnnouncements.load() ?? INITIAL_ANNOUNCEMENTS,
  );
  const [reads, setReads] = useState<ReadRecord[]>(
    () => storeReads.load() ?? INITIAL_READS,
  );
  const [role, setPortalRole] = useState<AppRole>('provider');
  const [employeeAccessRole, setEmployeeAccessRoleState] =
    useState<EmployeeAccessRole>('employee');
  const [permissions, setPermissions] = useState<PermissionKey[]>(
    DEFAULT_ROLE_PERMISSIONS.provider,
  );

  const setRole = useCallback((nextRole: AppRole) => {
    setPortalRole(nextRole);
    if (nextRole === 'provider') {
      setPermissions(DEFAULT_ROLE_PERMISSIONS.provider);
      return;
    }
    setPermissions(DEFAULT_ROLE_PERMISSIONS[employeeAccessRole]);
  }, [employeeAccessRole]);

  const setEmployeeAccessRole = useCallback((nextRole: EmployeeAccessRole) => {
    setEmployeeAccessRoleState(nextRole);
    setPermissions(DEFAULT_ROLE_PERMISSIONS[nextRole]);
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionKey) => permissions.includes(permission),
    [permissions],
  );

  const canViewProductUpdates = useMemo(
    () => hasPermission('software_updates.view'),
    [hasPermission],
  );

  const canAcknowledgeProductUpdates = useMemo(
    () => hasPermission('software_updates.view'),
    [hasPermission],
  );

  const canManageAnnouncements = useMemo(
    () => role === 'provider' && (
      hasPermission('software_updates.create') ||
      hasPermission('software_updates.edit') ||
      hasPermission('software_updates.delete') ||
      hasPermission('software_updates.view')
    ),
    [role, hasPermission],
  );

  // Persist to localStorage so demo state survives reloads and stays in sync
  // across the two portals (same origin).
  useEffect(() => {
    storeAnnouncements.save(announcements);
  }, [announcements]);
  useEffect(() => {
    storeReads.save(reads);
  }, [reads]);

  const createAnnouncement = useCallback((input: CreateAnnouncementInput) => {
    const nowIso = new Date().toISOString();
    const id = `a-${Date.now().toString(36)}`;
    const record: Announcement = {
      id,
      title: input.title,
      summary: input.summary,
      contentHtml: input.contentHtml,
      category: input.category,
      module: input.module,
      author: 'Sam Whitfield',
      audienceType: input.audienceType,
      audienceOrgs: input.audienceOrgs,
      notifications: input.notifications,
      status: input.status,
      createdAt: nowIso,
      scheduledFor: input.status === 'scheduled' ? input.scheduledFor : undefined,
      publishedAt: input.status === 'published' ? nowIso : undefined,
      heroImage: input.heroImage,
    };
    setAnnouncements((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateAnnouncement = useCallback(
    (id: string, patch: Partial<Announcement>) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      );
    },
    [],
  );

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setReads((prev) => prev.filter((r) => r.announcementId !== id));
  }, []);

  const markAsRead = useCallback((announcementId: string) => {
    if (!canViewProductUpdates) {
      return;
    }
    setReads((prev) => {
      if (prev.some((r) => r.announcementId === announcementId && r.orgId === EMPLOYEE_ORG_ID)) {
        return prev;
      }
      return [
        ...prev,
        { announcementId, orgId: EMPLOYEE_ORG_ID, readAt: new Date().toISOString() },
      ];
    });
  }, [canViewProductUpdates]);

  const markAllRead = useCallback(() => {
    if (!canViewProductUpdates) {
      return;
    }
    setReads((prev) => {
      const existing = new Set(
        prev.filter((r) => r.orgId === EMPLOYEE_ORG_ID).map((r) => r.announcementId),
      );
      const additions: ReadRecord[] = [];
      for (const a of announcements) {
        if (a.status === 'published' && !existing.has(a.id)) {
          additions.push({
            announcementId: a.id,
            orgId: EMPLOYEE_ORG_ID,
            readAt: new Date().toISOString(),
          });
        }
      }
      return [...prev, ...additions];
    });
  }, [announcements, canViewProductUpdates]);

  // Demo scheduler: promote scheduled announcements whose time has come.
  // Polls every 5 seconds so the simulation is observable in a live demo.
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      lastTickRef.current = Date.now();
      setAnnouncements((prev) => {
        const nowMs = Date.now();
        let changed = false;
        const next = prev.map((a) => {
          if (
            a.status === 'scheduled' &&
            a.scheduledFor &&
            new Date(a.scheduledFor).getTime() <= nowMs
          ) {
            changed = true;
            return {
              ...a,
              status: 'published' as const,
              publishedAt: new Date().toISOString(),
            };
          }
          return a;
        });
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // What the employee sees: published + audience matches their org.
  const visibleToEmployee = useMemo(
    () =>
      canViewProductUpdates
        ? announcements.filter(
            (a) =>
              a.status === 'published' &&
              (a.audienceType === 'all' || a.audienceOrgs.includes(EMPLOYEE_ORG_ID)),
          )
        : [],
    [announcements, canViewProductUpdates],
  );

  const employeeReadIds = useMemo(
    () =>
      new Set(
        reads.filter((r) => r.orgId === EMPLOYEE_ORG_ID).map((r) => r.announcementId),
      ),
    [reads],
  );

  const unreadCount = useMemo(
    () => visibleToEmployee.filter((a) => !employeeReadIds.has(a.id)).length,
    [visibleToEmployee, employeeReadIds],
  );

  const isRead = useCallback(
    (announcementId: string) => employeeReadIds.has(announcementId),
    [employeeReadIds],
  );

  const getAnnouncement = useCallback(
    (id: string) => announcements.find((a) => a.id === id),
    [announcements],
  );

  const value: AnnouncementContextValue = {
    announcements,
    reads,
    role,
    setRole,
    employeeAccessRole,
    setEmployeeAccessRole,
    permissions,
    hasPermission,
    canViewProductUpdates,
    canAcknowledgeProductUpdates,
    canManageAnnouncements,
    employeeOrgId: EMPLOYEE_ORG_ID,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    markAllRead,
    isRead,
    unreadCount,
    visibleToEmployee,
    getAnnouncement,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return ctx;
}

export { ANNOUNCEMENTS_KEY, READS_KEY };