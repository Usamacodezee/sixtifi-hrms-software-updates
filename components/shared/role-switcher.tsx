'use client';

import { useState } from 'react';
import { ChevronDown, Building2, User, Check } from 'lucide-react';
import { useAnnouncements } from '@/lib/announcement-store';
import { cn } from '@/lib/utils';

export function RoleSwitcher() {
  const { role, setRole, employeeAccessRole, setEmployeeAccessRole } = useAnnouncements();
  const [open, setOpen] = useState(false);

  const portalOptions = [
    {
      value: 'provider' as const,
      label: 'Software Provider',
      description: 'Super Admin / Publisher',
      icon: Building2,
    },
    {
      value: 'employee' as const,
      label: 'Employee HRMS',
      description: 'Acme Health Systems',
      icon: User,
    },
  ];

  const employeeRoleOptions = [
    { value: 'employee' as const, label: 'Employee', description: 'Basic access', icon: User },
    { value: 'manager' as const, label: 'Manager', description: 'Team visibility', icon: User },
    { value: 'hr-admin' as const, label: 'HR Admin', description: 'Policy controls', icon: Building2 },
    { value: 'organization-admin' as const, label: 'Org Admin', description: 'Full access', icon: Building2 },
  ];

  const current =
    role === 'employee'
      ? employeeRoleOptions.find((o) => o.value === employeeAccessRole) ?? employeeRoleOptions[0]
      : portalOptions.find((o) => o.value === role) ?? portalOptions[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm transition-colors hover:bg-muted"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CurrentIcon className="h-3.5 w-3.5" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-semibold text-foreground">{current.label}</span>
          <span className="block text-[11px] text-muted-foreground">
            {role === 'employee' ? 'Access role' : 'Demo portal'}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {role === 'employee' ? 'Switch employee access' : 'Switch demo portal'}
            </p>
          </div>
          <div className="p-1.5">
            {role === 'employee'
              ? employeeRoleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = employeeAccessRole === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEmployeeAccessRole(opt.value);
                        setOpen(false);
                        if (typeof window !== 'undefined') {
                          window.location.hash = '/employee/whats-new';
                        }
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                        active ? 'bg-primary-soft' : 'hover:bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 leading-tight">
                        <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.description}</span>
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })
              : portalOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setRole(opt.value);
                        setOpen(false);
                        if (typeof window !== 'undefined') {
                          window.location.hash = opt.value === 'provider' ? '/provider/dashboard' : '/employee/whats-new';
                        }
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                        active ? 'bg-primary-soft' : 'hover:bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 leading-tight">
                        <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.description}</span>
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}