import { Ionicons } from "@expo/vector-icons";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "@/constants/ui";

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.tabSlot} />

      <TabList style={[styles.tabList, { paddingBottom: insets.bottom + 8 }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton
            label="Home"
            focusedIcon="home"
            unfocusedIcon="home-outline"
          />
        </TabTrigger>

        <TabTrigger name="tasks" href="/tasks" asChild>
          <TabButton
            label="Services"
            focusedIcon="briefcase"
            unfocusedIcon="briefcase-outline"
          />
        </TabTrigger>

        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton
            label="Profile"
            focusedIcon="person"
            unfocusedIcon="person-outline"
          />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  label,
  focusedIcon,
  unfocusedIcon,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  label: string;
  focusedIcon: keyof typeof Ionicons.glyphMap;
  unfocusedIcon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable {...props} accessibilityLabel={label} style={styles.tabButton}>
      <Ionicons
        name={isFocused ? focusedIcon : unfocusedIcon}
        size={25}
        color={isFocused ? palette.primary : palette.muted}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: isFocused ? palette.primary : palette.muted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  tabSlot: {
    flex: 1,
  },

  tabList: {
    minHeight: 68,
    paddingTop: 8,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 48,
  },
  tabLabel: { fontSize: 12, fontWeight: "600" },
});
