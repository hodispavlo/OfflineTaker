import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Clock3 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getNote, retryNote } from "../api/client";
import { AudioBar } from "../components/AudioBar";
import {
  AnimatedContentCard,
  FailureCard,
  InteractiveBullet,
  ProcessingCard,
  SuccessToast,
} from "../components/InsightFeedback";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { StatusBadge } from "../components/StatusBadge";
import { useAIProfile } from "../context/AIProfileContext";
import { colors } from "../theme/colors";
import { Note, RootStackParamList, TranscriptSegment } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "NoteDetail">;
type Tab = "Summary" | "Transcript";

export function NoteDetailScreen({ route }: Props) {
  const { selectedProfile } = useAIProfile();
  const [note, setNote] = useState<Note | null>(null);
  const [tab, setTab] = useState<Tab>("Summary");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [seekRequest, setSeekRequest] = useState<{ seconds: number; nonce: number } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const nextNote = await getNote(route.params.noteId);
      setNote(nextNote);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load this note.");
    } finally {
      setLoading(false);
    }
  }, [route.params.noteId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (note?.status !== "processing") return;
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, [load, note?.status]);

  async function handleRetry() {
    setRetrying(true);
    try {
      if (note) {
        await retryNote(note.id, selectedProfile);
      }
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not retry processing.");
    } finally {
      setRetrying(false);
    }
  }

  const showSuccessToast = note?.status === "completed";
  const processingLabel = tab === "Summary" ? "Generating summary..." : "Processing audio with AI...";

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header note={note} loading={loading} error={loadError} />
          <SuccessToast visible={showSuccessToast} />
          <SegmentedTabs tabs={["Summary", "Transcript"]} value={tab} onChange={setTab} />

          {renderContent({
            tab,
            note,
            loading,
            loadError,
            processingLabel,
            retrying,
            onRetry: handleRetry,
            onSeek: (seconds) => setSeekRequest({ seconds, nonce: Date.now() }),
          })}
        </ScrollView>

        {note ? (
          <AudioBar uri={note.audio_url} seekToSeconds={seekRequest?.seconds} seekRequestId={seekRequest?.nonce} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function renderContent({
  tab,
  note,
  loading,
  loadError,
  processingLabel,
  retrying,
  onRetry,
  onSeek,
}: {
  tab: Tab;
  note: Note | null;
  loading: boolean;
  loadError: string | null;
  processingLabel: string;
  retrying: boolean;
  onRetry: () => void;
  onSeek: (seconds: number) => void;
}) {
  if (loading) {
    return <ProcessingCard label="Loading meeting insights..." />;
  }

  if (loadError && !note) {
    return <FailureCard message={loadError} onRetry={onRetry} retrying={retrying} />;
  }

  if (!note) {
    return <ProcessingCard label="Preparing meeting insights..." />;
  }

  if (note.status === "failed") {
    return <FailureCard message={note.error_message} onRetry={onRetry} retrying={retrying} />;
  }

  if (note.status === "processing") {
    return <ProcessingCard label={processingLabel} />;
  }

  if (tab === "Summary") {
    return (
      <AnimatedContentCard animationKey={`summary-${note.id}-${note.status}`}>
        {note.summary?.summary_markdown ? (
          <SummaryContent markdown={note.summary.summary_markdown} />
        ) : (
          <EmptyContent title="Summary is being prepared" body="The transcript is ready, and the final summary will appear here shortly." />
        )}
      </AnimatedContentCard>
    );
  }

  return (
    <AnimatedContentCard animationKey={`transcript-${note.id}-${note.status}`}>
      {note.transcript_segments.length ? (
        <TranscriptContent segments={note.transcript_segments} onSeek={onSeek} />
      ) : (
        <EmptyContent title="Transcript is being prepared" body="Speaker-labeled segments and timestamps will appear here." />
      )}
    </AnimatedContentCard>
  );
}

function Header({ note, loading, error }: { note: Note | null; loading: boolean; error: string | null }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>Meeting insights</Text>
        <Text style={styles.title} numberOfLines={2}>
          {note?.title || (loading ? "Loading recording" : "Meeting note")}
        </Text>
        <View style={styles.metaRow}>
          <Clock3 size={14} color={colors.muted} />
          <Text style={styles.metaText}>
            {note?.created_at ? new Date(note.created_at).toLocaleString() : "AI transcript workspace"}
          </Text>
        </View>
      </View>
      {note ? <StatusBadge status={note.status} /> : null}
      {error && note ? <Text style={styles.inlineError}>{error}</Text> : null}
    </View>
  );
}

function SummaryContent({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => parseSummaryMarkdown(markdown), [markdown]);

  return (
    <View style={styles.summaryStack}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <Text key={`${block.text}-${index}`} style={styles.sectionHeading}>
              {block.text}
            </Text>
          );
        }

        if (block.type === "bullet") {
          return <InteractiveBullet key={`${block.text}-${index}`}>{block.text}</InteractiveBullet>;
        }

        return (
          <Text key={`${block.text}-${index}`} style={styles.paragraph}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

function TranscriptContent({ segments, onSeek }: { segments: TranscriptSegment[]; onSeek: (seconds: number) => void }) {
  return (
    <View style={styles.transcriptStack}>
      {segments.map((segment) => (
        <Pressable
          key={segment.id}
          onPress={() => onSeek(segment.start_time)}
          style={({ pressed }) => [styles.segment, pressed && styles.segmentPressed]}
        >
          <View style={styles.segmentHeader}>
            <Text style={styles.speaker}>{segment.speaker_label}</Text>
            <Text style={styles.timestamp}>{formatTime(segment.start_time)}</Text>
          </View>
          <Text style={styles.segmentText}>{segment.text}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function EmptyContent({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function parseSummaryMarkdown(markdown: string): Array<{ type: "heading" | "bullet" | "paragraph"; text: string }> {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("#")) {
        return { type: "heading", text: cleanMarkdownText(line.replace(/^#+\s*/, "")) };
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return { type: "bullet", text: cleanMarkdownText(line.slice(2).trim()) };
      }
      return { type: "paragraph", text: cleanMarkdownText(line) };
    });
}

function cleanMarkdownText(value: string): string {
  return value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1").replace(/\*(.*?)\*/g, "$1");
}

function formatTime(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    gap: 12,
  },
  headerCopy: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    includeFontPadding: false,
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 34,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  metaText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    lineHeight: 18,
  },
  inlineError: {
    color: colors.failed,
    fontSize: 14,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 20,
  },
  summaryStack: {
    gap: 12,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 30,
    paddingTop: 2,
  },
  paragraph: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
  },
  transcriptStack: {
    gap: 12,
  },
  segment: {
    backgroundColor: "#F8FAFC",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  segmentPressed: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    transform: [{ scale: 0.99 }],
  },
  segmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  speaker: {
    color: colors.primary,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  timestamp: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 16,
  },
  segmentText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
  },
  emptyBox: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 24,
    marginBottom: 6,
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22,
  },
});
