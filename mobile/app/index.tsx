import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { roleHomePath } from '@/lib/role-path';
import { Loading } from '@/components/ui';

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!hydrated) return <Loading />;
  if (!accessToken || !user) return <Redirect href="/(auth)/login" />;
  const home = roleHomePath(user.role);
  if (!home) return <Redirect href="/(auth)/login" />;
  return <Redirect href={home as never} />;
}
