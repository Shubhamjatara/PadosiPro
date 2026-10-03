import { DefaultTheme, ThemeProvider } from "expo-router";

import AppTabs from "@/components/app-tabs";
import AppShell from "@/components/custom/AppShell";
import AuthGuard from "@/components/custom/AuthGuard";

export default function TabLayout() {
  return (
    <AuthGuard>
      <ThemeProvider value={DefaultTheme}>
        <AppShell>
          <AppTabs />
        </AppShell>
      </ThemeProvider>
    </AuthGuard>
  );
}
