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
  ACKS_KEY,
  ANNOUNCEMENTS_KEY,
  AUTOMATION_LOGS_KEY,
  AUTOMATION_SETTINGS_KEY,
  PULL_REQUESTS_KEY,
  READS_KEY,
  RELEASES_KEY,
  storeAcknowledgements,
  storeAnnouncements,
  storeAutomationLogs,
  storeAutomationSettings,
  storePullRequests,
  storeReads,
  storeReleases,
} from './store-persistence';
import type {
  AcknowledgementRecord,
  Announcement,
  AppRole,
  AutomationLog,
  AutomationSettings,
  EmployeeAccessRole,
  NotificationPrefs,
  PermissionKey,
  PullRequest,
  ReadRecord,
  Release,
} from './types';
import {
  DEFAULT_AUTOMATION_SETTINGS,
  DEFAULT_ROLE_PERMISSIONS,
  EMPLOYEE_ORG_ID,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUTOMATION_LOGS,
  INITIAL_PULL_REQUESTS,
  INITIAL_READS,
  INITIAL_RELEASES,
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
  acknowledgements: AcknowledgementRecord[];
  pullRequests: PullRequest[];
  automationLogs: AutomationLog[];
  releases: Release[];
  automationSettings: AutomationSettings;
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
  acknowledgeAnnouncement: (announcementId: string) => void;
  isRead: (announcementId: string) => boolean;
  isAcknowledged: (announcementId: string) => boolean;
  unreadCount: number;
  visibleToEmployee: Announcement[];
  getAnnouncement: (id: string) => Announcement | undefined;
  simulateNewPR: (pullRequestId?: string) => Promise<Announcement | null>;
  simulateProductionDeployment: (pullRequestId: string) => void;
  updateAutomationSettings: (patch: Partial<AutomationSettings>) => void;
  approveDraft: (announcementId: string, reviewer?: string) => void;
  rejectDraft: (announcementId: string, reason: string) => void;
  automationMetrics: {
    totalAnnouncements: number;
    publishedAnnouncements: number;
    aiGeneratedDrafts: number;
    pendingReviews: number;
    scheduledReleases: number;
    totalPRsDetected: number;
    successfullyAnalyzedChanges: number;
    draftsGenerated: number;
    changesIgnored: number;
    failedProcessingJobs: number;
    draftApprovalRate: number;
  };
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

function buildAnnouncementFromPR(pr: PullRequest): Announcement {
  const titleMap: Record<string, string> = {
    'Add Bulk Employee Import': 'Introducing Bulk Employee Import',
    'Fix Attendance Regularization Calculation': 'Attendance Regularization Fix',
    'Improve Payroll Dashboard Performance': 'Payroll Dashboard Performance Upgrade',
  };

  const summaryMap: Record<string, string> = {
    'Add Bulk Employee Import': 'HR administrators can now import multiple employee records simultaneously using a structured Excel file.',
    'Fix Attendance Regularization Calculation': 'We corrected attendance calculations during regularization to ensure payroll and roster accuracy.',
    'Improve Payroll Dashboard Performance': 'Payroll dashboards now load faster and make fewer unnecessary API requests.',
  };

  const contentMap: Record<string, string> = {
    'Add Bulk Employee Import': '<p>HR administrators can now import several employee records in one file, reducing repetitive data entry during onboarding.</p><h3>What’s new</h3><ul><li>Upload a spreadsheet with multiple employee records</li><li>Validate each row before import</li><li>Display invalid records before final submission</li></ul><h3>Benefits</h3><ul><li>Reduces time spent on manual onboarding tasks</li><li>Improves data quality and consistency</li><li>Helps teams process large employee batches efficiently</li></ul>',
    'Fix Attendance Regularization Calculation': '<p>We corrected the regularization logic that could miscalculate attendance on certain schedules.</p><h3>What’s fixed</h3><ul><li>Improved calculation accuracy for regularized time entries</li><li>Reduced inconsistent monthly totals</li><li>Improved payroll alignment for adjusters</li></ul><h3>Benefits</h3><ul><li>Ensures fair attendance totals</li><li>Reduces follow-up corrections</li><li>Improves trust in reported time data</li></ul>',
    'Improve Payroll Dashboard Performance': '<p>We improved the performance of the payroll dashboard to make reports and summary views load more quickly.</p><h3>What’s improved</h3><ul><li>Fewer redundant API calls</li><li>Faster dashboard refreshes</li><li>Smoother drill-down for larger payroll groups</li></ul><h3>Benefits</h3><ul><li>Shorter wait times for payroll administrators</li><li>Better responsiveness during high-traffic periods</li><li>Improved day-to-day operational efficiency</li></ul>',
  };

  const benefitsMap: Record<string, string[]> = {
    'Add Bulk Employee Import': ['Saves time during onboarding', 'Improves employee data accuracy', 'Makes large import batches manageable'],
    'Fix Attendance Regularization Calculation': ['Improves time accuracy', 'Reduces correction work', 'Supports payroll confidence'],
    'Improve Payroll Dashboard Performance': ['Faster dashboard load times', 'Less unnecessary server traffic', 'Better day-to-day productivity'],
  };

  const now = new Date().toISOString();
  const title = titleMap[pr.title] ?? pr.title;
  return {
    id: `a-ai-${pr.number}`,
    title,
    summary: summaryMap[pr.title] ?? pr.description,
    contentHtml: contentMap[pr.title] ?? `<p>${pr.description}</p>`,
    category:
      pr.changeCategory === 'New Feature'
        ? 'New Feature'
        : pr.changeCategory === 'Bug Fix'
          ? 'Bug Fix'
          : 'Enhancement',
    module: pr.module,
    author: 'AI Workflow',
    audienceType: 'selected',
    audienceOrgs: ['org-1', 'org-2', 'org-4'],
    notifications: { productUpdates: true, notificationBell: true, email: true, dashboardBanner: false },
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    sourcePullRequests: [`PR #${pr.number}`],
    jiraTicketIds: pr.jiraTicketIds,
    aiGenerated: true,
    aiConfidence: pr.number === 284 ? 94 : pr.number === 285 ? 92 : 90,
    reviewStatus: 'pending',
    deploymentStatus: 'Not Deployed',
    publicationEligible: false,
    organizationVisibility: 'Employee Management access',
    notificationPreference: 'Both',
    benefits: benefitsMap[pr.title] ?? ['Improves operations'],
    changes: [pr.title],
    audience: ['HR Admin', 'Organization Admin'],
    description: pr.description,
    generatedDate: now,
    changeCategory: pr.changeCategory,
    sourceRepository: pr.repository,
  };
}

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
  const [acknowledgements, setAcknowledgements] = useState<AcknowledgementRecord[]>(
    () => storeAcknowledgements.load() ?? [],
  );
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(
    () => storePullRequests.load() ?? INITIAL_PULL_REQUESTS,
  );
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(
    () => storeAutomationLogs.load() ?? INITIAL_AUTOMATION_LOGS,
  );
  const [releases, setReleases] = useState<Release[]>(
    () => storeReleases.load() ?? INITIAL_RELEASES,
  );
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(
    () => storeAutomationSettings.load() ?? DEFAULT_AUTOMATION_SETTINGS,
  );
  const [role, setPortalRole] = useState<AppRole>('provider');
  const [employeeAccessRole, setEmployeeAccessRoleState] =
    useState<EmployeeAccessRole>('employee');
  const [permissions, setPermissions] = useState<PermissionKey[]>(
    DEFAULT_ROLE_PERMISSIONS.provider,
  );

  const addLog = useCallback(
    (
      eventType: string,
      source: string,
      status: AutomationLog['status'],
      message: string,
      pullRequestId?: string,
      announcementId?: string,
    ) => {
      const entry: AutomationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        eventType,
        source,
        status,
        message,
        pullRequestId,
        announcementId,
        createdAt: new Date().toISOString(),
      };
      setAutomationLogs((prev) => [entry, ...prev].slice(0, 80));
    },
    [],
  );

  const setRole = useCallback(
    (nextRole: AppRole) => {
      setPortalRole(nextRole);
      if (nextRole === 'provider') {
        setPermissions(DEFAULT_ROLE_PERMISSIONS.provider);
        return;
      }
      setPermissions(DEFAULT_ROLE_PERMISSIONS[employeeAccessRole]);
    },
    [employeeAccessRole],
  );

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
    () =>
      role === 'provider' && (
        hasPermission('software_updates.create') ||
        hasPermission('software_updates.edit') ||
        hasPermission('software_updates.delete') ||
        hasPermission('software_updates.view')
      ),
    [role, hasPermission],
  );

  useEffect(() => {
    storeAnnouncements.save(announcements);
  }, [announcements]);
  useEffect(() => {
    storeReads.save(reads);
  }, [reads]);
  useEffect(() => {
    storeAcknowledgements.save(acknowledgements);
  }, [acknowledgements]);
  useEffect(() => {
    storePullRequests.save(pullRequests);
  }, [pullRequests]);
  useEffect(() => {
    storeAutomationLogs.save(automationLogs);
  }, [automationLogs]);
  useEffect(() => {
    storeReleases.save(releases);
  }, [releases]);
  useEffect(() => {
    storeAutomationSettings.save(automationSettings);
  }, [automationSettings]);

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

  const markAsRead = useCallback(
    (announcementId: string) => {
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
    },
    [canViewProductUpdates],
  );

  const acknowledgeAnnouncement = useCallback(
    (announcementId: string) => {
      if (!canAcknowledgeProductUpdates) {
        return;
      }
      setAcknowledgements((prev) => {
        if (prev.some((r) => r.announcementId === announcementId && r.userId === 'user-1')) {
          return prev;
        }
        return [
          ...prev,
          { announcementId, orgId: EMPLOYEE_ORG_ID, userId: 'user-1', acknowledgedAt: new Date().toISOString() },
        ];
      });
    },
    [canAcknowledgeProductUpdates],
  );

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

  const approveDraft = useCallback(
    (announcementId: string, reviewer = 'Super Admin') => {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? {
                ...a,
                reviewStatus: 'approved',
                reviewer,
                rejectionReason: undefined,
                updatedAt: new Date().toISOString(),
                publicationEligible:
                  automationSettings.requireProductionDeploymentBeforePublishing
                    ? a.deploymentStatus === 'Production'
                    : true,
              }
            : a,
        ),
      );
      addLog(
        'Draft approved',
        'Admin review',
        'success',
        `Announcement approved by ${reviewer}.`,
        undefined,
        announcementId,
      );
    },
    [addLog, automationSettings.requireProductionDeploymentBeforePublishing],
  );

  const rejectDraft = useCallback(
    (announcementId: string, reason: string) => {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId
            ? {
                ...a,
                reviewStatus: 'rejected',
                rejectionReason: reason,
                updatedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
      addLog('Draft rejected', 'Admin review', 'warning', `Announcement rejected: ${reason}`, undefined, announcementId);
    },
    [addLog],
  );

  const updateAutomationSettings = useCallback((patch: Partial<AutomationSettings>) => {
    setAutomationSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const simulateProductionDeployment = useCallback(
    (pullRequestId: string) => {
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === pullRequestId
            ? { ...pr, deploymentStatus: { ...pr.deploymentStatus, Production: 'Successful' } }
            : pr,
        ),
      );
      setAnnouncements((prev) =>
        prev.map((a) => {
          const matches = a.sourcePullRequests?.includes(`PR #${pullRequestId.replace('pr-', '')}`);
          if (!matches) return a;
          return {
            ...a,
            deploymentStatus: 'Production',
            publicationEligible: true,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      addLog(
        'Deployment detected',
        'GitHub Actions',
        'success',
        `Production deployment succeeded for PR #${pullRequestId.replace('pr-', '')}.`,
        pullRequestId,
      );
    },
    [addLog],
  );

  const simulateNewPR = useCallback(
    async (pullRequestId?: string) => {
      const candidate = pullRequestId
        ? pullRequests.find((pr) => pr.id === pullRequestId)
        : pullRequests.find((pr) => pr.processingStatus === 'ready');

      if (!candidate) {
        addLog('Processing failed', 'Automation workflow', 'error', 'No mock PR was available to simulate.');
        return null;
      }

      if (candidate.processingStatus === 'analyzing' || candidate.processingStatus === 'failed') {
        addLog(
          'Duplicate PR detected',
          'Automation workflow',
          'warning',
          `PR #${candidate.number} is already in progress or already processed.`,
          candidate.id,
        );
        return null;
      }

      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === candidate.id ? { ...pr, processingStatus: 'analyzing' } : pr,
        ),
      );
      addLog('PR detected', 'GitHub webhook', 'info', `PR #${candidate.number} merged and queued for analysis.`, candidate.id);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (candidate.number === 287) {
        setPullRequests((prev) =>
          prev.map((pr) =>
            pr.id === candidate.id
              ? { ...pr, processingStatus: 'ignored', customerFacing: false, changeCategory: 'Internal Refactoring' }
              : pr,
          ),
        );
        addLog('PR ignored', 'Rules engine', 'warning', 'Internal refactor excluded from customer-facing announcements.', candidate.id);
        return null;
      }

      if (!candidate.jiraTicketIds.length) {
        setPullRequests((prev) =>
          prev.map((pr) =>
            pr.id === candidate.id ? { ...pr, processingStatus: 'failed' } : pr,
          ),
        );
        addLog('Jira information unavailable', 'Jira sync', 'error', `PR #${candidate.number} does not include a linked Jira ticket.`, candidate.id);
        return null;
      }

      const generated = buildAnnouncementFromPR(candidate);
      setAnnouncements((prev) => [generated, ...prev]);
      setPullRequests((prev) =>
        prev.map((pr) =>
          pr.id === candidate.id ? { ...pr, processingStatus: 'ready' } : pr,
        ),
      );
      addLog('AI analysis completed', 'AI engine', 'success', `AI analysis completed for PR #${candidate.number}.`, candidate.id, generated.id);
      addLog('Draft generated', 'Automation workflow', 'success', `Draft generated for ${generated.title}.`, candidate.id, generated.id);

      const releaseIndex = releases.findIndex((r) => r.name === 'November 2026 Product Release');
      if (releaseIndex >= 0) {
        setReleases((prev) =>
          prev.map((rel, index) =>
            index === releaseIndex
              ? {
                  ...rel,
                  announcementIds: [generated.id, ...rel.announcementIds],
                  status: 'Awaiting Approval',
                  deploymentStatus: 'Not Deployed',
                }
              : rel,
          ),
        );
      }

      return generated;
    },
    [addLog, pullRequests, releases],
  );

  const automationMetrics = useMemo(() => {
    const totalAnnouncements = announcements.length;
    const publishedAnnouncements = announcements.filter((a) => a.status === 'published').length;
    const aiGeneratedDrafts = announcements.filter((a) => a.aiGenerated).length;
    const pendingReviews = announcements.filter((a) => a.aiGenerated && a.reviewStatus === 'pending').length;
    const scheduledReleases = releases.filter((r) => r.status === 'Scheduled' || r.status === 'Ready to Publish').length;
    const totalPRsDetected = pullRequests.length;
    const successfullyAnalyzedChanges = pullRequests.filter((p) => p.processingStatus === 'ready').length;
    const draftsGenerated = announcements.filter((a) => a.aiGenerated && a.reviewStatus !== 'rejected').length;
    const changesIgnored = pullRequests.filter((p) => p.processingStatus === 'ignored').length;
    const failedProcessingJobs = pullRequests.filter((p) => p.processingStatus === 'failed').length;
    const approvedDrafts = announcements.filter((a) => a.aiGenerated && a.reviewStatus === 'approved').length;
    const draftApprovalRate = aiGeneratedDrafts > 0 ? Math.round((approvedDrafts / aiGeneratedDrafts) * 100) : 0;

    return {
      totalAnnouncements,
      publishedAnnouncements,
      aiGeneratedDrafts,
      pendingReviews,
      scheduledReleases,
      totalPRsDetected,
      successfullyAnalyzedChanges,
      draftsGenerated,
      changesIgnored,
      failedProcessingJobs,
      draftApprovalRate,
    };
  }, [announcements, pullRequests, releases]);

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

  const visibleToEmployee = useMemo(
    () =>
      canViewProductUpdates
        ? announcements.filter((a) => {
            if (a.status !== 'published' || a.archivedAt) return false;
            if (a.notifications?.productUpdates === false) return false;
            const orgScope = a.audienceType === 'all' || a.audienceOrgs.includes(EMPLOYEE_ORG_ID);
            const planAllowed =
              !a.applicablePlans ||
              a.applicablePlans.includes('Enterprise') ||
              a.applicablePlans.includes('Growth') ||
              a.applicablePlans.includes('Starter');
            return orgScope && planAllowed;
          })
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

  const isAcknowledged = useCallback(
    (announcementId: string) =>
      acknowledgements.some(
        (r) => r.announcementId === announcementId && r.userId === 'user-1',
      ),
    [acknowledgements],
  );

  const getAnnouncement = useCallback(
    (id: string) => announcements.find((a) => a.id === id),
    [announcements],
  );

  const value: AnnouncementContextValue = {
    announcements,
    reads,
    acknowledgements,
    pullRequests,
    automationLogs,
    releases,
    automationSettings,
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
    acknowledgeAnnouncement,
    isRead,
    isAcknowledged,
    unreadCount,
    visibleToEmployee,
    getAnnouncement,
    simulateNewPR,
    simulateProductionDeployment,
    updateAutomationSettings,
    approveDraft,
    rejectDraft,
    automationMetrics,
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

export { ACKS_KEY, ANNOUNCEMENTS_KEY, AUTOMATION_LOGS_KEY, AUTOMATION_SETTINGS_KEY, PULL_REQUESTS_KEY, READS_KEY, RELEASES_KEY };
