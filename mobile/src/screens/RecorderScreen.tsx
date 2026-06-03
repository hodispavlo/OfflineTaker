import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { Square, Upload } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { uploadRecording } from "../api/client";
import { useAIProfile } from "../context/AIProfileContext";
import { colors } from "../theme/colors";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Recorder">;

export function RecorderScreen({ navigation }: Props) {
  const { selectedProfile } = useAIProfile();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [title, setTitle] = useState("Untitled recording");
  const [seconds, setSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync();
    };
  }, []);

  async function startRecording() {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Microphone permission is required.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setRecordingUri(null);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
  }

  async function stopRecording() {
    const recording = recordingRef.current;
    if (!recording) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recordingRef.current = null;

    await recording.stopAndUnloadAsync();
    setRecordingUri(recording.getURI());
  }

  async function submitRecording() {
    if (!recordingUri) return;
    setBusy(true);
    try {
      const response = await uploadRecording({
        uri: recordingUri,
        title,
        durationSeconds: seconds,
        professionProfile: selectedProfile,
      });
      navigation.replace("NoteDetail", { noteId: response.note_id });
    } catch (err) {
      Alert.alert("Upload failed", err instanceof Error ? err.message : "Could not upload recording.");
    } finally {
      setBusy(false);
    }
  }

  const isRecording = recordingRef.current !== null;
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const displaySeconds = (seconds % 60).toString().padStart(2, "0");

  return (
    <View style={styles.screen}>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Recording title" />
      <View style={styles.timerPanel}>
        <Text style={styles.timer}>
          {minutes}:{displaySeconds}
        </Text>
        <Text style={styles.state}>{isRecording ? "Recording locally" : recordingUri ? "Ready to upload" : "Ready"}</Text>
      </View>

      {!isRecording && !recordingUri ? (
        <Pressable style={styles.primaryAction} onPress={startRecording}>
          <Text style={styles.primaryText}>Record</Text>
        </Pressable>
      ) : null}

      {isRecording ? (
        <Pressable style={styles.stopAction} onPress={stopRecording}>
          <Square size={22} color={colors.surface} fill={colors.surface} />
          <Text style={styles.stopText}>Stop</Text>
        </Pressable>
      ) : null}

      {recordingUri ? (
        <Pressable style={[styles.uploadAction, busy && styles.disabled]} onPress={submitRecording} disabled={busy}>
          <Upload size={20} color={colors.surface} />
          <Text style={styles.uploadText}>{busy ? "Uploading" : "Upload & process"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 18,
    justifyContent: "center",
    padding: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timerPanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 28,
  },
  timer: {
    color: colors.text,
    fontSize: 58,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  state: {
    color: colors.muted,
    fontWeight: "700",
    marginTop: 6,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 8,
    minHeight: 54,
    justifyContent: "center",
  },
  primaryText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
  },
  stopAction: {
    alignItems: "center",
    backgroundColor: colors.failed,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    justifyContent: "center",
  },
  stopText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
  },
  uploadAction: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    justifyContent: "center",
  },
  uploadText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.65,
  },
});
