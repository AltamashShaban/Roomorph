import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { PillTabBar } from '@/components/pill-tab-bar';
import { useAppStore } from '@/store/app-store';

export default function TabsLayout() {
  const { onboarded } = useAppStore();
  if (!onboarded) return <Redirect href="/onboarding" />;

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
