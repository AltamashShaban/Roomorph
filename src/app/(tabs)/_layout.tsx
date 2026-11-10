import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { PillTabBar } from '@/components/pill-tab-bar';
import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/store/auth';

export default function TabsLayout() {
  const { onboarded } = useAppStore();
  const auth = useAuth();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (auth.enabled && !auth.session) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen
        name="history"
        options={{ title: 'History' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}
