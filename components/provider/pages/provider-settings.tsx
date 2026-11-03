'use client';

import { useAnnouncements } from '@/lib/announcement-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProviderSettings({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const { automationSettings, updateAutomationSettings } = useAnnouncements();

  const renderToggle = (label: string, checked: boolean, onChange: (value: boolean) => void) => (
    <label className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted-foreground/40',
        ].join(' ')}
      >
        <span
          className={[
            'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Automation Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control how AI-generated announcements, approvals, and release grouping behave.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">General</h2>
          <div className="space-y-3">
            {renderToggle('Enable automatic draft generation', automationSettings.enableAutomaticDraftGeneration, (value) => updateAutomationSettings({ enableAutomaticDraftGeneration: value }))}
            {renderToggle('Enable AI analysis', automationSettings.enableAIAnalysis, (value) => updateAutomationSettings({ enableAIAnalysis: value }))}
            {renderToggle('Require Jira ticket reference', automationSettings.requireJiraTicketReference, (value) => updateAutomationSettings({ requireJiraTicketReference: value }))}
            {renderToggle('Auto-detect customer-facing changes', automationSettings.automaticallyDetectCustomerFacingChanges, (value) => updateAutomationSettings({ automaticallyDetectCustomerFacingChanges: value }))}
            {renderToggle('Automatically ignore internal changes', automationSettings.automaticallyIgnoreInternalChanges, (value) => updateAutomationSettings({ automaticallyIgnoreInternalChanges: value }))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Content Generation</h2>
          <div className="space-y-3">
            {renderToggle('Generate summaries automatically', automationSettings.generateSummariesAutomatically, (value) => updateAutomationSettings({ generateSummariesAutomatically: value }))}
            {renderToggle('Generate benefits automatically', automationSettings.generateBenefitsAutomatically, (value) => updateAutomationSettings({ generateBenefitsAutomatically: value }))}
            {renderToggle('Suggest audience automatically', automationSettings.suggestAudienceAutomatically, (value) => updateAutomationSettings({ suggestAudienceAutomatically: value }))}
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-sm font-medium text-foreground">Default announcement language</div>
              <div className="mt-2 text-sm text-muted-foreground">{automationSettings.defaultAnnouncementLanguage}</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Approval</h2>
          <div className="space-y-3">
            {renderToggle('Require manual approval', automationSettings.requireManualApproval, (value) => updateAutomationSettings({ requireManualApproval: value }))}
            {renderToggle('Require production deployment before publishing', automationSettings.requireProductionDeploymentBeforePublishing, (value) => updateAutomationSettings({ requireProductionDeploymentBeforePublishing: value }))}
            {renderToggle('Allow bulk approval', automationSettings.allowBulkApproval, (value) => updateAutomationSettings({ allowBulkApproval: value }))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Release Grouping</h2>
          <div className="space-y-3">
            {renderToggle('Auto-group minor fixes', automationSettings.automaticallyGroupMinorFixes, (value) => updateAutomationSettings({ automaticallyGroupMinorFixes: value }))}
            {renderToggle('Group by release version', automationSettings.groupChangesByReleaseVersion, (value) => updateAutomationSettings({ groupChangesByReleaseVersion: value }))}
            {renderToggle('Group by module', automationSettings.groupChangesByModule, (value) => updateAutomationSettings({ groupChangesByModule: value }))}
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="text-sm font-medium text-foreground">Minimum changes for grouped release</div>
              <div className="mt-2 text-sm text-muted-foreground">{automationSettings.minimumChangesRequiredForGroupedRelease}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
