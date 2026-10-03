import { StyleSheet } from "react-native";
import { MD3LightTheme } from "react-native-paper";

// Change these colors once to update the main screens together.
export const palette = {
  primary: "#047857",
  primarySoft: "#ecfdf5",
  background: "#f5f7f9",
  surface: "#ffffff",
  text: "#172b25",
  muted: "#64748b",
  border: "#e2e8f0",
  danger: "#b91c1c",
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    onSurfaceVariant: palette.muted,
    outline: "#cbd5e1",
    error: palette.danger,
  },
};

// Reuse these everyday styles. Keep screen-specific styles inside the screen.
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: palette.text },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: palette.text },
  body: { fontSize: 14, lineHeight: 22, color: palette.muted },
  label: { fontSize: 15, fontWeight: "600", color: palette.text },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  grow: { flex: 1 },
  stack: { gap: 12 },
  input: { backgroundColor: palette.surface },
  button: { borderRadius: 12 },
  buttonContent: { minHeight: 50 },
  buttonLabel: { fontSize: 15, fontWeight: "700" },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  error: { color: palette.danger, fontSize: 13, lineHeight: 20 },
  success: { color: palette.primary, fontSize: 14, lineHeight: 22 },
  pressed: { opacity: 0.65 },
});
