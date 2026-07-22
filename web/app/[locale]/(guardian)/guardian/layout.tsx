import { PanelLayout } from '@/components/layout/panel-layout';
import { RoleGuard } from '@/components/layout/role-guard';

const guardianNav = [
  { href: '/guardian', labelKey: 'children' },
  { href: '/guardian/tracking', labelKey: 'tracking' },
  { href: '/guardian/payments', labelKey: 'payments' },
];

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="GUARDIAN">
      <PanelLayout title="Guardian" nav={guardianNav}>
        {children}
      </PanelLayout>
    </RoleGuard>
  );
}
