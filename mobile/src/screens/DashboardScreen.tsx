import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Mic, Settings, Trash2 } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  UIManager,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { deleteNote, listNotes } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { useAIProfile } from "../context/AIProfileContext";
import { colors } from "../theme/colors";
import { NoteListItem, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function DashboardScreen({ navigation }: Props) {
  const { selectedProfile } = useAIProfile();
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

  function removeNote(noteId: number) {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Today</Text>
          <Text style={styles.title}>Meeting notes</Text>
          <Text style={styles.profileText}>AI profile: {selectedProfile}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Settings")}>
            <Settings size={21} color={colors.text} />
          </Pressable>
          <Pressable style={styles.recordButton} onPress={() => navigation.navigate("Recorder")}>
            <Mic size={22} color={colors.surface} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recordings yet</Text>
              <Text style={styles.emptyText}>Tap the microphone to capture the next conversation.</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
        renderItem={({ item }) => (
          <DashboardNoteRow
            item={item}
            onOpen={() => navigation.navigate("NoteDetail", { noteId: item.id })}
            onRemoved={() => removeNote(item.id)}
          />
        )}
      />
    </View>
  );
}

function DashboardNoteRow({ item, onOpen, onRemoved }: { item: NoteListItem; onOpen: () => void; onRemoved: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const swipeableRef = useRef<Swipeable | null>(null);
  const [deleting, setDeleting] = useState(false);

  function confirmDelete() {
    swipeableRef.current?.close();
    Alert.alert(
      "Delete Recording?",
      "Are you sure you want to permanently delete this file and its transcript? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete },
      ]
    );
  }

  async function performDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await Promise.all([deleteNote(item.id), fadeOut(opacity)]);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onRemoved();
    } catch (err) {
      setDeleting(false);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      Alert.alert("Could not delete recording", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <Animated.View style={[styles.animatedRow, { opacity }]}>
      <Swipeable ref={swipeableRef} overshootRight={false} renderRightActions={() => <DeleteAction onPress={confirmDelete} />}>
        <Pressable
          onPress={onOpen}
          onLongPress={confirmDelete}
          delayLongPress={420}
          style={({ pressed }) => [styles.noteRow, pressed && styles.noteRowPressed]}
        >
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {new Date(item.created_at).toLocaleString()} {item.duration ? `• ${Math.round(item.duration)}s` : ""}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

function fadeOut(opacity: Animated.Value) {
  return new Promise<void>((resolve) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => resolve());
  });
}

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.deleteAction} onPress={onPress}>
      <Trash2 size={21} color={colors.surface} />
      <Text style={styles.deleteText}>Delete</Text>
    </Pressable>
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
    gap: 14,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 17,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 36,
  },
  profileText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 18,
    marginTop: 6,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
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
  animatedRow: {
    borderRadius: 14,
    overflow: "hidden",
  },
  noteRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 14,
  },
  noteRowPressed: {
    backgroundColor: "#F8FAFC",
  },
  noteCopy: {
    flex: 1,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 22,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    lineHeight: 18,
    marginTop: 5,
  },
  deleteAction: {
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 14,
    gap: 4,
    justifyContent: "center",
    marginLeft: 10,
    width: 92,
  },
  deleteText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 28,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  error: {
    color: colors.failed,
    marginBottom: 12,
  },
});
