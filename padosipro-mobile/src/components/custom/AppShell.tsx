import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Sidebar from "@/components/custom/Sidebar";
import { palette } from "@/constants/ui";

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isHome = pathname === "/";
  const title = isHome
    ? "PadosiPro"
    : pathname === "/tasks"
      ? "Services"
      : "Profile";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}
      >
        <View style={styles.heading}>
          {isHome ? <Text style={styles.subtitle}>Welcome back </Text> : null}
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {pathname === "/tasks" ? (
            <Text style={styles.subtitle}>Select the services you provide</Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => setSidebarOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open sidebar"
          accessibilityState={{ expanded: sidebarOpen }}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="menu" size={26} color={palette.primary} />
        </Pressable>
      </View>

      <View style={styles.container}>{children}</View>

      {/* The shared layout keeps this menu available on every tab. */}
      {sidebarOpen ? <Sidebar onClose={() => setSidebarOpen(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 20,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  heading: { flex: 1, gap: 4 },
  title: { fontSize: 24, fontWeight: "700", color: palette.text },
  subtitle: { fontSize: 13, color: palette.muted },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
});
