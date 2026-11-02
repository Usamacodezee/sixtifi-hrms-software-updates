'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Save,
  CalendarClock,
  Send,
  Type,
  AlignLeft,
  Users,
  Bell,
  ClipboardCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import {
  CATEGORIES,
  HRMS_MODULES,
  type AnnouncementCategory,
  type HRMSModule,
  type NotificationPrefs,
} from '@/lib/types';
import { ORGANIZATIONS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryBadge, StatusBadge } from '@/components/shared/badges';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RichEditor } from '@/components/shared/rich-editor';
import { AnnouncementPreview } from '@/components/shared/announcement-preview';

type StepKey = 'details' | 'content' | 'audience' | 'review';

const STEPS: { key: StepKey; label: string; icon: typeof Type }[] = [
  { key: 'details', label: 'Details', icon: Type },
  { key: 'content', label: 'Content', icon: AlignLeft },
  { key: 'audience', label: 'Audience & Notifications', icon: Users },
  { key: 'review', label: 'Review & Publish', icon: ClipboardCheck },
];

interface FormState {
  title: string;
  summary: string;
  category: AnnouncementCategory;
  module: HRMSModule;
  contentHtml: string;
  heroImage: string;
  audienceType: 'all' | 'selected';
  audienceOrgs: string[];
  notifications: NotificationPrefs;
  scheduleMode: 'now' | 'schedule' | 'draft';
  scheduledDate: string;
}

const DEFAULT_FORM: FormState = {
  title: '',
  summary: '',
  category: 'New Feature',
  module: 'Core HR',
  contentHtml: '',
  heroImage: '',
  audienceType: 'all',
  audienceOrgs: [],
  notifications: {
    productUpdates: true,
    notificationBell: true,
    email: false,
    dashboardBanner: false,
  },
  scheduleMode: 'now',
  scheduledDate: '',
};

export function ProviderCreate({ onPublished }: { onPublished?: () => void }) {
  const { createAnnouncement } = useAnnouncements();
  const [step, setStep] = useState<StepKey>('details');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [showPreview, setShowPreview] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validation = useMemo(() => {
    return {
      details: form.title.trim().length > 0,
      content: form.summary.trim().length > 0 && form.contentHtml.trim().length > 0,
      audience:
        form.audienceType === 'all' || form.audienceOrgs.length > 0,
      review: true,
    };
  }, [form]);

  const canAdvance = validation[step];

  const handlePrimary = () => {
    if (form.scheduleMode === 'draft') {
      createAnnouncement({
        title: form.title,
        summary: form.summary,
        contentHtml: form.contentHtml,
        category: form.category,
        module: form.module,
        audienceType: form.audienceType,
        audienceOrgs: form.audienceOrgs,
        notifications: form.notifications,
        status: 'draft',
        heroImage: form.heroImage || undefined,
      });
      toast.success('Saved as draft');
      onPublished?.();
      return;
    }
    if (form.scheduleMode === 'schedule') {
      if (!form.scheduledDate) {
        toast.error('Please pick a scheduled date and time');
        return;
      }
      createAnnouncement({
        title: form.title,
        summary: form.summary,
        contentHtml: form.contentHtml,
        category: form.category,
        module: form.module,
        audienceType: form.audienceType,
        audienceOrgs: form.audienceOrgs,
        notifications: form.notifications,
        status: 'scheduled',
        scheduledFor: new Date(form.scheduledDate).toISOString(),
        heroImage: form.heroImage || undefined,
      });
      toast.success('Announcement scheduled');
      onPublished?.();
      return;
    }
    createAnnouncement({
      title: form.title,
      summary: form.summary,
      contentHtml: form.contentHtml,
      category: form.category,
      module: form.module,
      audienceType: form.audienceType,
      audienceOrgs: form.audienceOrgs,
      notifications: form.notifications,
      status: 'published',
      heroImage: form.heroImage || undefined,
    });
    toast.success('Announcement published — employees notified');
    onPublished?.();
  };

  const nextStatus = form.scheduleMode === 'draft' ? 'draft' : form.scheduleMode === 'schedule' ? 'scheduled' : 'published';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create Announcement</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build, preview, and publish an update to customer organizations.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowPreview((v) => !v)}>
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? 'Hide preview' : 'Preview'}
        </Button>
      </div>

      {/* Stepper */}
      <nav className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.key === step;
          const done = i < stepIndex;
          return (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => i < stepIndex && setStep(s.key)}
                disabled={i > stepIndex}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary-soft text-primary'
                    : done
                      ? 'border-border bg-card text-foreground'
                      : 'border-border bg-card text-muted-foreground',
                  i > stepIndex && 'cursor-not-allowed opacity-60',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    active ? 'bg-primary text-primary-foreground' : done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="font-medium">{s.label}</span>
                <Icon className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-2 hidden h-px w-8 sm:block', i < stepIndex ? 'bg-success' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className={cn('lg:col-span-3', showPreview && 'lg:col-span-3')}>
          <Card className="p-5 sm:p-6">
            {step === 'details' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-foreground">Announcement details</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. AI-Powered Payroll Anomaly Detection"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="summary">Summary <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="summary"
                    value={form.summary}
                    onChange={(e) => set('summary', e.target.value)}
                    placeholder="A one-line summary shown in cards and notifications."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => set('category', v as AnnouncementCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>HRMS Module</Label>
                    <Select value={form.module} onValueChange={(v) => set('module', v as HRMSModule)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HRMS_MODULES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hero">Hero image URL (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero"
                      value={form.heroImage}
                      onChange={(e) => set('heroImage', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" /> Leave blank for a clean, text-led announcement.
                  </p>
                </div>
              </div>
            )}

            {step === 'content' && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-foreground">Rich content</h2>
                <RichEditor value={form.contentHtml} onChange={(html) => set('contentHtml', html)} />
                <p className="text-xs text-muted-foreground">
                  Use headings, lists, and quotes to structure the announcement. The preview renders this exactly as employees will see it.
                </p>
              </div>
            )}

            {step === 'audience' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-foreground">Audience &amp; notifications</h2>
                <div className="space-y-3">
                  <Label>Audience</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AudienceOption
                      active={form.audienceType === 'all'}
                      onClick={() => set('audienceType', 'all')}
                      title="All Organizations"
                      description="Every customer on your platform."
                    />
                    <AudienceOption
                      active={form.audienceType === 'selected'}
                      onClick={() => set('audienceType', 'selected')}
                      title="Selected Organizations"
                      description="Choose specific customers."
                    />
                  </div>
                </div>

                {form.audienceType === 'selected' && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Select organizations ({form.audienceOrgs.length} selected)
                    </p>
                    <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto scrollbar-thin sm:grid-cols-2">
                      {ORGANIZATIONS.map((org) => {
                        const checked = form.audienceOrgs.includes(org.id);
                        return (
                          <label
                            key={org.id}
                            className={cn(
                              'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors',
                              checked ? 'border-primary bg-primary-soft' : 'border-border hover:bg-muted',
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                set(
                                  'audienceOrgs',
                                  c
                                    ? [...form.audienceOrgs, org.id]
                                    : form.audienceOrgs.filter((id) => id !== org.id),
                                );
                              }}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-foreground">{org.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {org.industry} · {org.employeeCount.toLocaleString()} employees
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" /> Notification preferences
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <NotifToggle
                      label="Product Updates"
                      description="Show in the What's New page"
                      checked={form.notifications.productUpdates}
                      onChange={(v) => set('notifications', { ...form.notifications, productUpdates: v })}
                    />
                    <NotifToggle
                      label="Notification Bell"
                      description="Add to the bell dropdown"
                      checked={form.notifications.notificationBell}
                      onChange={(v) => set('notifications', { ...form.notifications, notificationBell: v })}
                    />
                    <NotifToggle
                      label="Email"
                      description="Send an email digest"
                      checked={form.notifications.email}
                      onChange={(v) => set('notifications', { ...form.notifications, email: v })}
                    />
                    <NotifToggle
                      label="Dashboard Banner"
                      description="Banner at the top of the dashboard"
                      checked={form.notifications.dashboardBanner}
                      onChange={(v) => set('notifications', { ...form.notifications, dashboardBanner: v })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-foreground">Review &amp; publish</h2>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={form.category} />
                    <StatusBadge status={nextStatus} />
                    <span className="text-xs text-muted-foreground">{form.module}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{form.title || 'Untitled announcement'}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{form.summary || 'No summary yet.'}</p>
                </div>
 
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ReviewRow label="Audience" value={form.audienceType === 'all' ? 'All organizations' : `${form.audienceOrgs.length} selected`} />
                  <ReviewRow label="Module" value={form.module} />
                  <ReviewRow label="Category" value={form.category} />
                </div>

                <div className="space-y-3">
                  <Label>Publish options</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <PublishOption
                      active={form.scheduleMode === 'now'}
                      onClick={() => set('scheduleMode', 'now')}
                      icon={Send}
                      title="Publish Now"
                      description="Go live immediately."
                    />
                    <PublishOption
                      active={form.scheduleMode === 'schedule'}
                      onClick={() => set('scheduleMode', 'schedule')}
                      icon={CalendarClock}
                      title="Schedule"
                      description="Publish at a set time."
                    />
                    <PublishOption
                      active={form.scheduleMode === 'draft'}
                      onClick={() => set('scheduleMode', 'draft')}
                      icon={Save}
                      title="Save Draft"
                      description="Come back later."
                    />
                  </div>
                  {form.scheduleMode === 'schedule' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="sched">Date &amp; time</Label>
                      <Input
                        id="sched"
                        type="datetime-local"
                        value={form.scheduledDate}
                        onChange={(e) => set('scheduledDate', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: pick a time 1–2 minutes from now to watch the demo scheduler promote it live.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer nav */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)].key)}
                disabled={isFirst}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {isLast ? (
                <Button onClick={handlePrimary} disabled={!canAdvance}>
                  {form.scheduleMode === 'draft' ? (
                    <><Save className="mr-2 h-4 w-4" />Save Draft</>
                  ) : form.scheduleMode === 'schedule' ? (
                    <><CalendarClock className="mr-2 h-4 w-4" />Schedule</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Publish Now</>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].key)}
                  disabled={!canAdvance}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className={cn('lg:col-span-2', !showPreview && 'hidden lg:block')}>
          <div className="sticky top-24">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Eye className="h-3.5 w-3.5" /> Live preview
            </p>
            <AnnouncementPreview
              title={form.title}
              summary={form.summary}
              contentHtml={form.contentHtml}
              category={form.category}
              module={form.module}
              heroImage={form.heroImage || undefined}
              status={nextStatus}
              notifications={form.notifications}
              audienceType={form.audienceType}
              audienceCount={form.audienceType === 'all' ? ORGANIZATIONS.length : form.audienceOrgs.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AudienceOption({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors',
        active ? 'border-primary bg-primary-soft' : 'border-border hover:bg-muted',
      )}
    >
      <span className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

function NotifToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PublishOption({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Send;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
        active ? 'border-primary bg-primary-soft' : 'border-border hover:bg-muted',
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}