import { PanelLayout } from '@/components/layout/panel-layout';
import { RoleGuard } from '@/components/layout/role-guard';

const adminNav = [
  { href: '/admin', labelKey: 'dashboard' },
  { href: '/admin/vehicles', labelKey: 'vehicles' },
  { href: '/admin/drivers', labelKey: 'drivers' },
  { href: '/admin/students', labelKey: 'students' },
  { href: '/admin/guardians', labelKey: 'guardians' },
  { href: '/admin/routes', labelKey: 'routes' },
  { href: '/admin/tracking', labelKey: 'tracking' },
  { href: '/admin/trips', labelKey: 'trips' },
  { href: '/admin/payments', labelKey: 'payments' },
  { href: '/admin/reports', labelKey: 'reports' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ADMIN">
      <PanelLayout title="Admin" nav={adminNav}>
        {children}
      </PanelLayout>
    </RoleGuard>
  );
}
