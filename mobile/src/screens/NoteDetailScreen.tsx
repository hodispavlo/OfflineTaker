import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { getNote } from "../api/client";
import { AudioBar } from "../components/AudioBar";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { StatusBadge } from "../components/StatusBadge";
import { colors } from "../theme/colors";
import { Note, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "NoteDetail">;
type Tab = "Summary" | "Transcript";

export function NoteDetailScreen({ route }: Props) {
  const [note, setNote] = useState<Note | null>(null);
  const [tab, setTab] = useState<Tab>("Summary");
  const [loading, setLoading] = useState(true);
  const [seekRequest, setSeekRequest] = useState<{ seconds: number; nonce: number } | null>(null);

  const load = useCallback(async () => {
    setNote(await getNote(route.params.noteId));
    setLoading(false);
  }, [route.params.noteId]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (note?.status !== "completed") {
        load();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [load, note?.status]);

  if (loading || !note) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{note.title}</Text>
          <StatusBadge status={note.status} />
          {note.error_message ? <Text style={styles.error}>{note.error_message}</Text> : null}
        </View>

        <SegmentedTabs tabs={["Summary", "Transcript"]} value={tab} onChange={setTab} />

        {tab === "Summary" ? (
          <View style={styles.section}>
            {note.summary ? (
              <Markdown style={markdownStyles}>{note.summary.summary_markdown}</Markdown>
            ) : (
              <Text style={styles.muted}>Summary will appear when processing finishes.</Text>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {note.transcript_segments.length ? (
              note.transcript_segments.map((segment) => (
                <Pressable
                  key={segment.id}
                  style={styles.segment}
                  onPress={() => setSeekRequest({ seconds: segment.start_time, nonce: Date.now() })}
                >
                  <Text style={styles.segmentMeta}>
                    {segment.speaker_label} • {formatTime(segment.start_time)}
                  </Text>
                  <Text style={styles.segmentText}>{segment.text}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.muted}>Transcript will appear here with speaker labels and timestamps.</Text>
            )}
          </View>
        )}
      </ScrollView>
      <AudioBar uri={note.audio_url} seekToSeconds={seekRequest?.seconds} seekRequestId={seekRequest?.nonce} />
    </View>
  );
}

function formatTime(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 28,
  },
  header: {
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  muted: {
    color: colors.muted,
  },
  error: {
    color: colors.failed,
  },
  segment: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  segmentMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  segmentText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
});

const markdownStyles = {
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  heading2: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800" as const,
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 12,
  },
};
