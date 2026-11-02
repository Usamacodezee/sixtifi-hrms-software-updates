import type { Announcement, Organization, PermissionKey } from './types';

export const ORGANIZATIONS: Organization[] = [
  { id: 'org-1', name: 'Northwind Logistics', industry: 'Logistics', employeeCount: 1240, plan: 'Enterprise' },
  { id: 'org-2', name: 'Acme Health Systems', industry: 'Healthcare', employeeCount: 3200, plan: 'Enterprise' },
  { id: 'org-3', name: 'Brightwave Studios', industry: 'Media & Entertainment', employeeCount: 480, plan: 'Growth' },
  { id: 'org-4', name: 'Summit Manufacturing', industry: 'Manufacturing', employeeCount: 2100, plan: 'Enterprise' },
  { id: 'org-5', name: 'Pinnacle Retail Group', industry: 'Retail', employeeCount: 5600, plan: 'Enterprise' },
  { id: 'org-6', name: 'Cobalt Financial', industry: 'Financial Services', employeeCount: 1850, plan: 'Growth' },
  { id: 'org-7', name: 'Evergreen Education', industry: 'Education', employeeCount: 720, plan: 'Starter' },
  { id: 'org-8', name: 'Vista Hospitality', industry: 'Hospitality', employeeCount: 3400, plan: 'Enterprise' },
];

// The signed-in employee's organization — used for the Employee HRMS portal.
export const EMPLOYEE_ORG_ID = 'org-2';
export const EMPLOYEE = {
  id: 'emp-1',
  name: 'Jordan Avery',
  role: 'HR Operations Lead',
  email: 'jordan.avery@acmehealth.com',
  avatarInitials: 'JA',
};

export const PROVIDER_SUPER_ADMIN_PERMISSIONS: PermissionKey[] = [
  'software_updates.view',
  'software_updates.create',
  'software_updates.edit',
  'software_updates.delete',
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  employee: [],
  manager: ['software_updates.view'],
  'hr-admin': ['software_updates.view'],
  'organization-admin': ['software_updates.view'],
  provider: PROVIDER_SUPER_ADMIN_PERMISSIONS,
};

export const PROVIDER_ADMIN = {
  id: 'prov-1',
  name: 'Sam Whitfield',
  role: 'Product Communications',
  company: 'Helix HRMS',
  avatarInitials: 'SW',
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number, hour = 9) => {
  const d = new Date(now + offsetDays * day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a-1001',
    title: 'AI-Powered Payroll Anomaly Detection',
    summary:
      'Surface payroll irregularities automatically before they reach approval, with explainable AI suggestions.',
    contentHtml:
      '<p>We are rolling out <strong>Anomaly Detection</strong> across the Payroll module. The engine reviews every payroll run and flags unusual patterns for review before approval.</p><h3>What is new</h3><ul><li>Automatic detection of duplicate, off-cycle, and out-of-band payments</li><li>Explainable AI suggestions with a confidence score</li><li>One-click hold or approve directly from the review tray</li></ul><h3>How to enable</h3><p>Admins can toggle Anomaly Detection under <em>Payroll &rarr; Settings &rarr; Risk Controls</em>. No additional setup is required for the default sensitivity profile.</p><blockquote>Customers on the Enterprise plan receive this automatically. Growth customers can enable it from the Payroll settings screen.</blockquote>',
    category: 'New Feature',
    module: 'Payroll',
    author: 'Sam Whitfield',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: true, dashboardBanner: true },
    status: 'published',
    createdAt: iso(-18),
    publishedAt: iso(-14),
    heroImage: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 'a-1002',
    title: 'Performance Reviews: Enhanced Calibration Workspace',
    summary:
      'A new calibration workspace makes it easier to compare ratings across teams and adjust before finalization.',
    contentHtml:
      '<p>The Performance module now includes a dedicated <strong>Calibration Workspace</strong> for managers and HR partners.</p><h3>Highlights</h3><ul><li>Side-by-side rating comparison with filters by team, level, and cycle</li><li>Bulk adjustment actions with full audit history</li><li>Inline comments threaded per employee</li></ul><p>Calibration sessions can be saved as drafts and finalized when leadership signs off.</p>',
    category: 'Enhancement',
    module: 'Performance',
    author: 'Priya Nair',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: false, dashboardBanner: false },
    status: 'published',
    createdAt: iso(-26),
    publishedAt: iso(-22),
    heroImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 'a-1003',
    title: 'Fix: Timesheet auto-submit ignoring half-day leave',
    summary:
      'Resolves an issue where auto-submit skipped timesheets containing approved half-day leave entries.',
    contentHtml:
      '<p>A subset of customers reported that <strong>auto-submit</strong> skipped timesheets which contained approved half-day leave. This has been resolved.</p><h3>Resolved in</h3><ul><li>Time &amp; Attendance v4.7.1</li><li>Mobile App v2.9.4</li></ul><p>No action is required from admins. Affected timesheets from the last cycle can be re-submitted manually if needed.</p>',
    category: 'Bug Fix',
    module: 'Time & Attendance',
    author: 'Marcus Lee',
    audienceType: 'selected',
    audienceOrgs: ['org-1', 'org-2', 'org-4'],
    notifications: { productUpdates: true, notificationBell: true, email: false, dashboardBanner: false },
    status: 'published',
    createdAt: iso(-32),
    publishedAt: iso(-30),
  },
  {
    id: 'a-1004',
    title: 'Scheduled Maintenance: Reporting Database',
    summary:
      'A read-only maintenance window for the analytics reporting database. Dashboards will show stale data briefly.',
    contentHtml:
      '<p>We will perform scheduled maintenance on the reporting database to improve query performance.</p><h3>Schedule</h3><ul><li>Window: Saturday 02:00–04:00 UTC</li><li>Impact: Analytics dashboards read-only, data up to 10 min stale</li><li>No impact on core HR, payroll, or attendance</li></ul><p>We will post a follow-up once maintenance completes.</p>',
    category: 'Maintenance',
    module: 'Analytics',
    author: 'Sam Whitfield',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: true, dashboardBanner: false },
    status: 'scheduled',
    createdAt: iso(-2),
    scheduledFor: iso(3, 2),
  },
  {
    id: 'a-1005',
    title: 'Security Update: Session Hardening',
    summary:
      'Strengthens session token handling and adds optional device-binding for admin accounts.',
    contentHtml:
      '<p>This security release strengthens session handling and adds optional device-binding for admin accounts.</p><ul><li>Shorter refresh token lifetimes with silent rotation</li><li>Optional device-binding for admin roles</li><li>Improved audit logging for session events</li></ul><p>Security settings can be configured under <em>Administration &rarr; Security</em>.</p>',
    category: 'Security',
    module: 'Platform',
    author: 'Elena Costa',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: true, dashboardBanner: true },
    status: 'published',
    createdAt: iso(-40),
    publishedAt: iso(-38),
  },
  {
    id: 'a-1006',
    title: 'Deprecation: Legacy CSV Import API (v1)',
    summary:
      'The v1 CSV import API will be retired in March. Migrate to the v2 batch import endpoint.',
    contentHtml:
      '<p>The legacy CSV import API (v1) will be retired on <strong>March 31</strong>. Please migrate to the v2 batch import endpoint, which supports streaming, validation, and rollback.</p><ul><li>v1 endpoints continue to respond until March 31</li><li>v2 documentation is available in the developer portal</li><li>A migration assistant is available under <em>Integrations &rarr; Data Import</em></li></ul>',
    category: 'Deprecation',
    module: 'Integrations',
    author: 'Sam Whitfield',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: true, dashboardBanner: false },
    status: 'published',
    createdAt: iso(-50),
    publishedAt: iso(-48),
  },
  {
    id: 'a-1007',
    title: 'Draft: Mobile Check-in Geofencing',
    summary:
      'Draft announcement for the upcoming mobile check-in geofencing feature. Pending review.',
    contentHtml:
      '<p>Geofencing for mobile check-in lets admins define allowed check-in locations. This draft outlines the rollout plan.</p><ul><li>Admin-defined geofence polygons</li><li>Soft or hard enforcement modes</li><li>Out-of-range override with manager approval</li></ul>',
    category: 'New Feature',
    module: 'Mobile App',
    author: 'Sam Whitfield',
    audienceType: 'selected',
    audienceOrgs: ['org-2', 'org-5'],
    notifications: { productUpdates: true, notificationBell: true, email: false, dashboardBanner: false },
    status: 'draft',
    createdAt: iso(-1),
  },
  {
    id: 'a-1008',
    title: 'Onboarding Templates: Conditional Steps',
    summary:
      'Onboarding templates now support conditional steps that adapt based on role and location.',
    contentHtml:
      '<p>Onboarding templates can now branch based on role, location, or department. This lets HR teams build a single template that adapts for different hire types.</p><h3>What changed</h3><ul><li>Conditional step visibility rules</li><li>Variable due dates per branch</li><li>Preview mode before publishing a template</li></ul>',
    category: 'Enhancement',
    module: 'Onboarding',
    author: 'Priya Nair',
    audienceType: 'all',
    audienceOrgs: [],
    notifications: { productUpdates: true, notificationBell: true, email: false, dashboardBanner: false },
    status: 'published',
    createdAt: iso(-44),
    publishedAt: iso(-42),
    heroImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

export const INITIAL_READS: { announcementId: string; orgId: string; readAt: string }[] = [
  { announcementId: 'a-1001', orgId: 'org-2', readAt: iso(-13) },
  { announcementId: 'a-1001', orgId: 'org-1', readAt: iso(-12) },
  { announcementId: 'a-1001', orgId: 'org-4', readAt: iso(-11) },
  { announcementId: 'a-1001', orgId: 'org-5', readAt: iso(-10) },
  { announcementId: 'a-1002', orgId: 'org-2', readAt: iso(-20) },
  { announcementId: 'a-1002', orgId: 'org-3', readAt: iso(-19) },
  { announcementId: 'a-1003', orgId: 'org-2', readAt: iso(-29) },
  { announcementId: 'a-1005', orgId: 'org-2', readAt: iso(-37) },
  { announcementId: 'a-1005', orgId: 'org-6', readAt: iso(-36) },
  { announcementId: 'a-1006', orgId: 'org-1', readAt: iso(-47) },
  { announcementId: 'a-1008', orgId: 'org-2', readAt: iso(-41) },
  { announcementId: 'a-1008', orgId: 'org-8', readAt: iso(-40) },
];
