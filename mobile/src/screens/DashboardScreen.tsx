import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Mic } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { listNotes } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { NoteListItem, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setNotes(await listNotes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Today</Text>
          <Text style={styles.title}>Meeting notes</Text>
        </View>
        <Pressable style={styles.recordButton} onPress={() => navigation.navigate("Recorder")}>
          <Mic size={22} color={colors.surface} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recordings yet</Text>
              <Text style={styles.emptyText}>Tap the microphone to capture the next conversation.</Text>
            </View>
          }
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          renderItem={({ item }) => (
            <Pressable style={styles.noteRow} onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}>
              <View style={styles.noteCopy}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.meta}>
                  {new Date(item.created_at).toLocaleString()} {item.duration ? `• ${Math.round(item.duration)}s` : ""}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  recordButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  noteRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  noteCopy: {
    flex: 1,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    marginTop: 8,
    textAlign: "center",
  },
  error: {
    color: colors.failed,
    marginBottom: 12,
  },
});
