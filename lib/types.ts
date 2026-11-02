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

export type AnnouncementStatus = 'published' | 'scheduled' | 'draft';

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
  | 'Recruitment'
  | 'Performance'
  | 'Learning'
  | 'Onboarding'
  | 'Offboarding'
  | 'Benefits'
  | 'Analytics'
  | 'Mobile App'
  | 'Integrations'
  | 'Platform';

export interface NotificationPrefs {
  productUpdates: boolean;
  notificationBell: boolean;
  email: boolean;
  dashboardBanner: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  contentHtml: string;
  category: AnnouncementCategory;
  module: HRMSModule;
  author: string;
  audienceType: 'all' | 'selected';
  audienceOrgs: string[];
  notifications: NotificationPrefs;
  status: AnnouncementStatus;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  heroImage?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  employeeCount: number;
  plan: 'Starter' | 'Growth' | 'Enterprise';
}

export interface ReadRecord {
  announcementId: string;
  orgId: string;
  readAt: string;
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
  { value: 'Recruitment', label: 'Recruitment' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Learning', label: 'Learning' },
  { value: 'Onboarding', label: 'Onboarding' },
  { value: 'Offboarding', label: 'Offboarding' },
  { value: 'Benefits', label: 'Benefits' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Integrations', label: 'Integrations' },
  { value: 'Platform', label: 'Platform' },
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
