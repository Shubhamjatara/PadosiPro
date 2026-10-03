import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";

import { palette, ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";

type Task = { id: number; name: string; category: string; description: string };

export default function HomeScreen() {
  const { get, loading } = useApi();
  const [tasks, setTasks] = useState<Task[]>([]);

  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadServices = async () => {
        setError("");
        await get<Task[]>("/v1/tasks/selection", {
          onError: ({ message }) => {
            setError(message);
          },
          onSuccess: (response) => {
            setTasks(response?.data);
          },
        });
      };
      void loadServices();
    }, [get]),
  );

  // Put services with the same category into one group.
  const groups = tasks.reduce<Record<string, Task[]>>((result, task) => {
    if (!result[task.category]) result[task.category] = [];
    result[task.category].push(task);
    return result;
  }, {});

  return (
    <View style={ui.screen}>
      <FlatList
        data={loading || error ? [] : Object.entries(groups)}
        keyExtractor={([category]) => category}
        contentContainerStyle={ui.content}
        ListHeaderComponent={
          <View style={ui.stack}>
            <View style={styles.summary}>
              <View style={ui.grow}>
                <Text style={styles.eyebrow}>YOUR BUSINESS</Text>
                <Text style={ui.title}>A little more local.</Text>
                <Text style={ui.body}>
                  Manage the services you offer in your neighborhood.
                </Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countNumber}>
                  {loading || error ? "—" : tasks.length}
                </Text>
                <Text style={styles.countLabel}>services</Text>
              </View>
            </View>
            <View style={ui.row}>
              <Text style={[ui.sectionTitle, ui.grow]}>Your services</Text>
              <Button compact onPress={() => router.navigate("/tasks")}>
                Manage
              </Button>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[ui.card, ui.centered]}>
            {loading ? (
              <ActivityIndicator color={palette.primary} />
            ) : (
              <>
                <View style={ui.iconBox}>
                  <Ionicons
                    name={error ? "cloud-offline-outline" : "briefcase-outline"}
                    size={24}
                    color={palette.primary}
                  />
                </View>
                <Text style={ui.sectionTitle}>
                  {error
                    ? "Could not load services"
                    : "Start with your services"}
                </Text>
                <Text style={[ui.body, styles.centerText]}>
                  {error ||
                    "Choose what you do so your business profile is ready."}
                </Text>
                <Button
                  mode="contained"
                  style={ui.button}
                  contentStyle={ui.buttonContent}
                  onPress={() => router.navigate("/tasks")}
                >
                  Choose services
                </Button>
              </>
            )}
          </View>
        }
        renderItem={({ item: [category, categoryTasks] }) => (
          <View style={ui.stack}>
            <Text style={ui.label}>{category}</Text>
            {categoryTasks.map((task) => (
              <View key={task.id} style={[ui.card, ui.row]}>
                <View style={ui.iconBox}>
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={palette.primary}
                  />
                </View>
                <View style={ui.grow}>
                  <Text style={ui.label}>{task.name}</Text>
                  <Text style={ui.body}>{task.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        ListFooterComponent={
          <View style={ui.stack}>
            <Text style={ui.sectionTitle}>Quick links</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/profile")}
              style={({ pressed }) => [ui.card, ui.row, pressed && ui.pressed]}
            >
              <View style={ui.iconBox}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={palette.primary}
                />
              </View>
              <View style={ui.grow}>
                <Text style={ui.label}>My profile</Text>
                <Text style={ui.body}>Contact and business details</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/tasks")}
              style={({ pressed }) => [ui.card, ui.row, pressed && ui.pressed]}
            >
              <View style={ui.iconBox}>
                <Ionicons
                  name="briefcase-outline"
                  size={22}
                  color={palette.primary}
                />
              </View>
              <View style={ui.grow}>
                <Text style={ui.label}>Manage services</Text>
                <Text style={ui.body}>Choose the work you offer</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: "#e8f4ee",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  eyebrow: {
    color: palette.primary,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  count: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 68,
  },
  countNumber: { color: palette.primary, fontSize: 28, fontWeight: "700" },
  countLabel: { color: palette.muted, fontSize: 11 },
  centerText: { textAlign: "center" },
});
