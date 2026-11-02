export type AppRole = 'provider' | 'employee';

export type EmployeeAccessRole =
  | 'employee'
  | 'manager'
  | 'hr-admin'
  | 'organization-admin';

export type PermissionKey =
  | 'software_updates.view'
  | 'software_updates.create'
  | 'software_updates.edit'
  | 'software_updates.delete';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type AvailabilityStatus = 'coming_soon' | 'available' | 'rolling_out' | 'deprecated' | 'retired';
export type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'critical';
export type AnnouncementCategory =
  | 'New Feature'
  | 'Enhancement'
  | 'Bug Fix'
  | 'Maintenance'
  | 'Security'
  | 'Deprecation';

export type HRMSModule =
  | 'Core HR'
  | 'Payroll'
  | 'Time & Attendance'
  | 'Leave Management'
  | 'Attendance'
  | 'Recruitment'
  | 'Performance'
  | 'Performance Management'
  | 'Learning'
  | 'Onboarding'
  | 'Offboarding'
  | 'Benefits'
  | 'Analytics'
  | 'Mobile App'
  | 'Integrations'
  | 'Platform'
  | 'Help Desk'
  | 'Expense Management'
  | 'Employee Self Service';

export interface NotificationPrefs {
  productUpdates: boolean;
  notificationBell: boolean;
  email: boolean;
  dashboardBanner: boolean;
}

export interface AudienceConfig {
  roles: string[];
  departments: string[];
  designations: string[];
}

export interface AnnouncementRevision {
  version: number;
  updatedAt: string;
  updatedBy: string;
  summary: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug?: string;
  summary: string;
  contentHtml: string;
  category: AnnouncementCategory;
  priority?: AnnouncementPriority;
  releaseVersion?: string;
  module: HRMSModule;
  subModule?: string;
  author: string;
  audienceType: 'all' | 'selected';
  audienceOrgs: string[];
  notifications: NotificationPrefs;
  status: AnnouncementStatus;
  availabilityStatus?: AvailabilityStatus;
  releaseStatus?: ReleaseStatus;
  createdAt: string;
  updatedAt?: string;
  scheduledFor?: string;
  publishedAt?: string;
  effectiveAt?: string;
  expiresAt?: string;
  archivedAt?: string;
  heroImage?: string;
  documentationUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  requiresCustomerAction?: boolean;
  breakingChange?: boolean;
  isUniversal?: boolean;
  requiresAcknowledgement?: boolean;
  revision?: number;
  revisionHistory?: AnnouncementRevision[];
  targetRoles?: string[];
  targetDepartments?: string[];
  targetDesignations?: string[];
  applicablePlans?: Array<'Starter' | 'Growth' | 'Enterprise'>;
  requiredModules?: HRMSModule[];
  requiredFeatures?: string[];
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  employeeCount: number;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  status?: 'active' | 'paused' | 'inactive';
  modules?: HRMSModule[];
  features?: string[];
  releaseChannel?: 'General Availability' | 'Early Access' | 'Beta';
}

export interface DemoUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: EmployeeAccessRole | 'provider-admin';
  department: string;
  designation: string;
  permissions: PermissionKey[];
}

export interface ReadRecord {
  announcementId: string;
  orgId: string;
  userId?: string;
  readAt: string;
}

export interface AcknowledgementRecord {
  announcementId: string;
  orgId: string;
  userId: string;
  acknowledgedAt: string;
}

export const CATEGORIES: { value: AnnouncementCategory; label: string }[] = [
  { value: 'New Feature', label: 'New Feature' },
  { value: 'Enhancement', label: 'Enhancement' },
  { value: 'Bug Fix', label: 'Bug Fix' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Security', label: 'Security' },
  { value: 'Deprecation', label: 'Deprecation' },
];

export const HRMS_MODULES: { value: HRMSModule; label: string }[] = [
  { value: 'Core HR', label: 'Core HR' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Time & Attendance', label: 'Time & Attendance' },
  { value: 'Leave Management', label: 'Leave Management' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Recruitment', label: 'Recruitment' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Performance Management', label: 'Performance Management' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Onboarding', label: 'Onboarding' },
  { value: 'Offboarding', label: 'Offboarding' },
  { value: 'Benefits', label: 'Benefits' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Integrations', label: 'Integrations' },
  { value: 'Platform', label: 'Platform' },
  { value: 'Help Desk', label: 'Help Desk' },
  { value: 'Expense Management', label: 'Expense Management' },
  { value: 'Employee Self Service', label: 'Employee Self Service' },
];

export const CATEGORY_META: Record<
  AnnouncementCategory,
  { tone: string; label: string }
> = {
  'New Feature': { tone: 'primary', label: 'New Feature' },
  Enhancement: { tone: 'info', label: 'Enhancement' },
  'Bug Fix': { tone: 'warning', label: 'Bug Fix' },
  Maintenance: { tone: 'secondary', label: 'Maintenance' },
  Security: { tone: 'destructive', label: 'Security' },
  Deprecation: { tone: 'secondary', label: 'Deprecation' },
};
