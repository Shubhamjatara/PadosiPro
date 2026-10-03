import { NativeTabs } from "expo-router/unstable-native-tabs";
import { palette } from "@/constants/ui";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={palette.surface}
      indicatorColor={palette.primarySoft}
      labelStyle={{ selected: { color: palette.primary } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tasks">
        <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
