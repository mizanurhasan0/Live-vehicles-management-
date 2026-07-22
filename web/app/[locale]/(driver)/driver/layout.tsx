import { PanelLayout } from '@/components/layout/panel-layout';
import { RoleGuard } from '@/components/layout/role-guard';

const driverNav = [
  { href: '/driver', labelKey: 'trip' },
  { href: '/driver/profile', labelKey: 'profile' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="DRIVER">
      <PanelLayout title="Driver" nav={driverNav}>
        {children}
      </PanelLayout>
    </RoleGuard>
  );
}
