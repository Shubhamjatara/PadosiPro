import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { removeAuthToken } from "@/services/auth";

type SidebarProps = {
  onClose: () => void;
};

// Each item points to the same route as its bottom tab.
const menuItems = [
  { label: "Home", href: "/", icon: "home-outline" },
  { label: "Services", href: "/tasks", icon: "briefcase-outline" },
  { label: "Profile", href: "/profile", icon: "person-outline" },
] as const;

export default function Sidebar({ onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoutInProgress = useRef(false);
  const closing = useRef(false);
  // Keep one animation value per mounted sidebar; supported on native and web.
  const [progress] = useState(() => new Animated.Value(0));
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.82, 320);

  useEffect(() => () => progress.stopAnimation(), [progress]);

  const openSidebar = () => {
    if (closing.current) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const animateClose = (afterClose?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      // Keep the sidebar mounted until its exit animation finishes.
      if (finished) {
        onClose();
        afterClose?.();
      }
    });
  };

  const closeSidebar = () => {
    if (!logoutInProgress.current) animateClose();
  };

  const navigateToTab = (href: (typeof menuItems)[number]["href"]) => {
    if (logoutInProgress.current) return;
    animateClose(() => {
      if (pathname !== href) router.navigate(href);
    });
  };

  const handleLogout = async () => {
    if (logoutInProgress.current || closing.current) return;
    logoutInProgress.current = true;
    setIsLoggingOut(true);
    setError(null);

    try {
      // Wait until the saved session is removed before leaving the app screen.
      await removeAuthToken();
    } catch {
      setError("Could not log out. Please try again.");
      logoutInProgress.current = false;
      setIsLoggingOut(false);
      return;
    }

    animateClose(() => router.replace("/login"));
  };

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onShow={openSidebar}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={closeSidebar}
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, { opacity: progress }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeSidebar}
          accessibilityRole="button"
          accessibilityLabel="Close sidebar"
          disabled={isLoggingOut}
        />
        <Animated.View
          accessibilityViewIsModal
          onAccessibilityEscape={closeSidebar}
          style={[
            styles.panel,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [panelWidth, 0],
                  }),
                },
              ],
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 20,
              paddingRight: insets.right + 20,
            },
          ]}
        >
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              PadosiPro
            </Text>
            <Pressable
              onPress={closeSidebar}
              disabled={isLoggingOut}
              accessibilityRole="button"
              accessibilityLabel="Close sidebar"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#0f172a" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.menu}>
              {menuItems.map((item) => {
                const selected = pathname === item.href;

                return (
                  <Pressable
                    key={item.href}
                    onPress={() => navigateToTab(item.href)}
                    disabled={isLoggingOut}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: isLoggingOut }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      selected && styles.selectedItem,
                      (pressed || isLoggingOut) && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={selected ? "#047857" : "#475569"}
                    />
                    <Text
                      style={[styles.menuText, selected && styles.selectedText]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.footer}>
              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}
              <Pressable
                onPress={handleLogout}
                disabled={isLoggingOut}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoggingOut,
                  busy: isLoggingOut,
                }}
                style={({ pressed }) => [
                  styles.logoutButton,
                  (pressed || isLoggingOut) && styles.pressed,
                ]}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#b91c1c" />
                ) : (
                  <Ionicons name="log-out-outline" size={24} color="#b91c1c" />
                )}
                <Text style={styles.logoutText}>
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "82%",
    maxWidth: 320,
    backgroundColor: "#fff",
    paddingLeft: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { flexShrink: 1, fontSize: 24, fontWeight: "800", color: "#047857" },
  closeButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: 24,
    gap: 24,
  },
  menu: { gap: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    padding: 14,
    borderRadius: 12,
  },
  selectedItem: { backgroundColor: "#ecfdf5" },
  menuText: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  selectedText: { color: "#047857" },
  footer: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 20 },
  error: { color: "#b91c1c", marginBottom: 12, fontSize: 14 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  pressed: { opacity: 0.6 },
  logoutText: {
    flexShrink: 1,
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "600",
  },
});
