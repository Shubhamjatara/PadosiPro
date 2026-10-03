import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button, Searchbar } from "react-native-paper";

import { palette, ui } from "@/constants/ui";
import { useApi } from "@/hooks/useApi";
import type { Task } from "@/types/task";

type Props = {
  // Search text is stored in the parent Tasks screen and passed here as a prop.
  value: string;
  // Updates the parent's search state when the user types.
  onChangeText: (value: string) => void;
  // Sends search results to the parent so it can display the tasks.
  onResultsChange: (tasks: Task[] | null) => void;
};

export default function TaskSearchBar({
  value, onChangeText, onResultsChange,
}: Props) {
  const { get } = useApi();

  // Details of the latest completed search; null before a search or retry finishes.
  const [result, setResult] = useState<{
    // The search text that produced this response.
    query: string;
    // Number of tasks returned; 0 shows the "No services match" message.
    count: number;
    // Error message if the search fails; an empty string on success.
    error: string;
  } | null>(null);

  // Increases by 1 on "Retry search" to request the same search again.
  const [retry, setRetry] = useState(0);

  // These values are calculated from props and state on each render, not stored as state.
  // Removes extra spaces from the beginning and end of the search text.
  const query = value.trim();
  // Shows a loading indicator while a non-empty query has no matching response yet.
  const searching = !!query && result?.query !== query;
  // Uses only the current query's result and ignores results for older queries.
  const currentResult = query && result?.query === query ? result : null;

  useEffect(() => {
    if (!query) return;
    let active = true;
    onResultsChange([]);

    // Debounce: wait 300 ms after typing before calling the search API.
    const timeout = setTimeout(async () => {
      let error = "";
      const response = await get<Task[]>(
        `/v1/tasks/search?search=${encodeURIComponent(query)}`,
        { onError: ({ message }) => { error = message; } },
      );
      if (!active) return;
      const tasks = response?.data ?? [];
      setResult({ query, count: tasks.length, error });
      onResultsChange(tasks);
    }, 300);

    // Prevent an old response from replacing a newer search.
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, get, onResultsChange, retry]);

  const changeSearch = (text: string) => {
    if (text.trim() !== query) {
      setResult(null);
      // null tells the screen to show the full catalog again.
      onResultsChange(text.trim() ? [] : null);
    }
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search services"
        accessibilityLabel="Search services"
        clearAccessibilityLabel="Clear search"
        value={value}
        onChangeText={changeSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />
      {searching ? (
        <ActivityIndicator accessibilityLabel="Searching services" color={palette.primary} />
      ) : currentResult?.error ? (
        <View style={ui.stack}>
          <Text accessibilityRole="alert" style={ui.error}>{currentResult.error}</Text>
          <Button onPress={() => {
            setResult(null);
            onResultsChange([]);
            setRetry((previous) => previous + 1);
          }}>Retry search</Button>
        </View>
      ) : currentResult?.count === 0 ? (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          No services match your search. Try another word.
        </Text>
      ) : null}
      {currentResult && (currentResult.error || currentResult.count === 0) ? (
        <Button onPress={() => changeSearch("")}>Clear search</Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  search: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
  },
});
