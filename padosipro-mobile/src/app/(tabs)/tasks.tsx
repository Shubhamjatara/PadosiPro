import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";

import TaskSearchBar from "@/components/custom/TaskSearchBar";
import { palette, ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";
import type { Task } from "@/types/task";

export default function TasksScreen() {
  // loading comes from useApi and is true while this hook runs a GET or PUT request.
  const { get, put, loading } = useApi();

  // The full services list from the API, shown when the search box is empty.
  const [tasks, setTasks] = useState<Task[]>([]);

  // Remembers task details from the catalog, saved selection, and search results.
  // This keeps selected task names available for review after the search changes.
  const [knownTasks, setKnownTasks] = useState<Task[]>([]);

  // IDs of checked tasks, such as [18, 17]. These IDs are sent to the save API.
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  // Text typed into the search box, kept when returning from the review step.
  const [search, setSearch] = useState("");

  // Tasks returned by the search API. null = results reset; [] = no results yet.
  // When the search text is empty, the screen shows the full tasks list instead.
  const [searchResults, setSearchResults] = useState<Task[] | null>(null);

  // true shows the review step; false shows the task selection screen.
  const [reviewing, setReviewing] = useState(false);

  // Error message shown on the review screen if saving the selection fails.
  const [saveError, setSaveError] = useState("");

  // This ref prevents a quick double-tap from sending duplicate save requests.
  // Unlike state, changing saving.current does not trigger a new render.
  const saving = useRef(false);

  // Error message if loading the catalog or previously saved selection fails.
  const [error, setError] = useState("");

  // Increases by 1 on "Reload services" to run the loading effect again.
  const [retry, setRetry] = useState(0);

  // loading = fetching lists; ready = both lists loaded; error = a request failed.
  // Editing and saving are blocked until both lists are ready.
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  // Calculated from the states above; tells us whether editing is allowed.
  const canEdit = loadStatus === "ready" && !loading;

  // Tabs can stay mounted, so reload saved choices whenever this screen opens.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadTasks = async () => {
        setLoadStatus("loading");
        setError("");
        setReviewing(false);
        setSearchResults(null);
        const catalog = await get<Task[]>("/v1/tasks", {
          onError: ({ message }) => {
            if (active) setError(message);
          },
        });
        if (!active) return;
        if (!catalog) {
          setLoadStatus("error");
          return;
        }

        const selection = await get<Task[]>("/v1/tasks/selection", {
          onError: ({ message }) => {
            if (active) setError(`Could not load saved services. ${message}`);
          },
        });
        if (!active) return;
        if (!selection) {
          setLoadStatus("error");
          return;
        }

        // Store IDs from the API so existing checkboxes start checked.
        setTasks(catalog.data);

        setKnownTasks(
          Array.from(
            new Map(
              [...catalog.data, ...selection.data].map((task) => [
                task.id,
                task,
              ]),
            ).values(),
          ),
        );
        setSelectedTaskIds(selection.data.map((task) => task.id));
        setLoadStatus("ready");
      };
      void loadTasks();
      return () => {
        active = false;
      };
      // Changing retry intentionally restarts this effect while the tab is focused.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [get, retry]),
  );

  const handleSearchResults = useCallback((results: Task[] | null) => {
    setSearchResults(results);
    if (!results?.length) return;
    // Remember results for the review step, even after another search.
    setKnownTasks((previous) => {
      const combinedTasks = [...previous, ...results];
      const tasksById = new Map(combinedTasks.map((task) => [task.id, task]));
      return Array.from(tasksById.values());
    });
  }, []);

  const filteredTasks = search.trim() ? (searchResults ?? []) : tasks;
  const selectedTasks = knownTasks.filter((task) =>
    selectedTaskIds.includes(task.id),
  );

  const groupedTasks = filteredTasks.reduce<Record<string, Task[]>>(
    (groups, task) => {
      if (!groups[task.category]) groups[task.category] = [];
      groups[task.category].push(task);
      return groups;
    },
    {},
  );

  const toggleTask = (taskId: number) => {
    if (!canEdit) return;
    setSelectedTaskIds((previous) =>
      previous.includes(taskId)
        ? previous.filter((id) => id !== taskId)
        : [...previous, taskId],
    );
  };

  const handleSave = async () => {
    if (!reviewing || !selectedTaskIds.length || !canEdit || saving.current)
      return;
    saving.current = true;
    setSaveError("");
    try {
      await put(
        "/v1/tasks/selection",
        { taskIds: selectedTaskIds },
        {
          onSuccess: () => router.replace("/(tabs)"),
          onError: ({ message }) => setSaveError(message),
        },
      );
    } finally {
      saving.current = false;
    }
  };

  // Review is a separate step. Opening it does not send a save request.
  if (reviewing) {
    return (
      <View style={ui.screen}>
        <FlatList
          data={selectedTasks}
          keyExtractor={(task) => String(task.id)}
          contentContainerStyle={ui.content}
          ListHeaderComponent={
            <View style={ui.stack}>
              <Text accessibilityRole="header" style={ui.sectionTitle}>
                Review your services
              </Text>
              <Text style={ui.body}>
                You selected {selectedTasks.length} services. Check the list
                below before saving.
              </Text>
            </View>
          }
          renderItem={({ item: task }) => (
            <View style={[ui.card, ui.row]}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={palette.primary}
              />
              <View style={ui.grow}>
                <Text style={ui.label}>{task.name}</Text>
                <Text style={ui.body}>{task.category}</Text>
              </View>
            </View>
          )}
        />
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            {saveError ? (
              <Text accessibilityRole="alert" style={ui.error}>
                {saveError}
              </Text>
            ) : null}
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={!canEdit || !selectedTaskIds.length}
              style={ui.button}
              contentStyle={ui.buttonContent}
              labelStyle={ui.buttonLabel}
            >
              {loading ? "Saving..." : "Confirm & save"}
            </Button>
            <Button disabled={loading} onPress={() => setReviewing(false)}>
              Edit selection
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={ui.screen}>
      {loadStatus === "ready" ? (
        <TaskSearchBar
          value={search}
          onChangeText={setSearch}
          onResultsChange={handleSearchResults}
        />
      ) : null}
      <FlatList
        data={
          loadStatus !== "ready" || error ? [] : Object.entries(groupedTasks)
        }
        keyboardShouldPersistTaps="handled"
        keyExtractor={([category]) => category}
        contentContainerStyle={ui.content}
        ListHeaderComponent={
          <View style={ui.stack}>
            <Text style={ui.sectionTitle}>What do you do?</Text>
            <Text style={ui.body}>
              Tap a service to select it. You can choose more than one.
            </Text>
            {error ? (
              <Text accessibilityRole="alert" style={ui.error}>
                {error}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          search.trim() && loadStatus === "ready" ? null : (
            <View style={[ui.card, ui.centered]}>
              {loadStatus === "loading" ? (
                <ActivityIndicator
                  accessibilityLabel="Loading services"
                  color={palette.primary}
                />
              ) : (
                <>
                  <Ionicons
                    name="briefcase-outline"
                    size={32}
                    color={palette.primary}
                  />
                  <Text style={ui.body}>
                    {error
                      ? "Try loading the list again."
                      : "No services are available yet."}
                  </Text>
                  <Button
                    onPress={() => {
                      setLoadStatus("loading");
                      setRetry((value) => value + 1);
                    }}
                  >
                    Reload services
                  </Button>
                </>
              )}
            </View>
          )
        }
        renderItem={({ item: [category, categoryTasks] }) => (
          <View style={ui.stack}>
            <Text style={ui.label}>{category}</Text>
            {categoryTasks.map((task) => {
              const selected = selectedTaskIds.includes(task.id);
              return (
                <Pressable
                  key={task.id}
                  onPress={() => toggleTask(task.id)}
                  disabled={!canEdit}
                  accessibilityRole="checkbox"
                  accessibilityLabel={task.name}
                  accessibilityState={{ checked: selected, disabled: !canEdit }}
                  style={({ pressed }) => [
                    ui.card,
                    ui.row,
                    selected && styles.selectedCard,
                    pressed && ui.pressed,
                  ]}
                >
                  <View style={ui.grow}>
                    <Text style={ui.label}>{task.name}</Text>
                    <Text style={ui.body}>{task.description}</Text>
                  </View>
                  <View style={[styles.checkbox, selected && styles.checked]}>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color="white" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {/* This footer sits below the list, so it never covers the last service. */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={ui.row}>
            <Text style={[ui.body, ui.grow]}>Selected services</Text>
            <Text style={ui.label}>
              {loadStatus === "ready" ? selectedTaskIds.length : "—"}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => {
              if (!canEdit) return;
              setSaveError("");
              setReviewing(true);
            }}
            disabled={!selectedTaskIds.length || !canEdit}
            style={ui.button}
            contentStyle={ui.buttonContent}
            labelStyle={ui.buttonLabel}
          >
            Review selection
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedCard: {
    backgroundColor: palette.primarySoft,
    borderColor: palette.primary,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: palette.primary, borderColor: palette.primary },
  footer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  footerContent: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 20,
    gap: 12,
  },
});
