'use client';

import { useAnnouncements } from '@/lib/announcement-store';
import { ProviderPortal } from '@/components/portals/provider-portal';
import { EmployeePortal } from '@/components/portals/employee-portal';

export default function Home() {
  const { role } = useAnnouncements();
  return role === 'provider' ? <ProviderPortal /> : <EmployeePortal />;
}