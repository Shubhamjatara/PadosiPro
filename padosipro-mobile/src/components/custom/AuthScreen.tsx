import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette, ui } from "@/constants/ui";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// The wrapper handles spacing and the keyboard; each screen supplies its form.
export default function AuthScreen({
  title,
  subtitle,
  children,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={ui.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 32,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
          },
        ]}
      >
        <View style={styles.wrapper}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="home-outline" size={26} color="white" />
            </View>
            <Text style={ui.sectionTitle}>PadosiPro</Text>
            <Text style={ui.body}>Your skills. Your neighborhood.</Text>
          </View>
          <View style={ui.card}>
            <View style={ui.stack}>
              <Text accessibilityRole="header" style={ui.title}>
                {title}
              </Text>
              <Text style={ui.body}>{subtitle}</Text>
            </View>
            {children}
          </View>
          <Text style={styles.footer}>
            Local services, meaningful connections.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center" },
  wrapper: { width: "100%", maxWidth: 440, alignSelf: "center", gap: 24 },
  brand: { alignItems: "center", gap: 8 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  footer: { color: palette.muted, textAlign: "center", fontSize: 12 },
});
