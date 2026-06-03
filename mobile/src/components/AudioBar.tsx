import { Audio } from "expo-av";
import { Pause, Play, RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  uri: string;
  seekToSeconds?: number | null;
  seekRequestId?: number;
};

export function AudioBar({ uri, seekToSeconds, seekRequestId }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    let mounted = true;
    let currentSound: Audio.Sound | null = null;
    setLoading(true);
    setPlaying(false);
    setPositionMillis(0);
    setDurationMillis(0);

    Audio.Sound.createAsync({ uri }, { shouldPlay: false }, (status) => {
      if (!status.isLoaded) return;

      setPositionMillis(status.positionMillis ?? 0);
      setDurationMillis(status.durationMillis ?? 0);
      setPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setPlaying(false);
        setPositionMillis(status.durationMillis ?? 0);
      }
    })
      .then(({ sound: loadedSound }) => {
        currentSound = loadedSound;
        if (mounted) {
          setSound(loadedSound);
          setLoading(false);
        } else {
          loadedSound.unloadAsync();
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      currentSound?.unloadAsync();
    };
  }, [uri]);

  useEffect(() => {
    if (sound && seekToSeconds !== null && seekToSeconds !== undefined) {
      sound.setPositionAsync(Math.max(0, seekToSeconds * 1000));
    }
  }, [seekRequestId, seekToSeconds, sound]);

  async function togglePlayback() {
    if (!sound) return;
    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis - 250) {
        await sound.setPositionAsync(0);
      }
      await sound.playAsync();
      setPlaying(true);
    }
  }

  async function restart() {
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
    setPlaying(true);
  }

  const progressPercent = durationMillis > 0 ? Math.min(100, (positionMillis / durationMillis) * 100) : 0;

  return (
    <View style={styles.bar}>
      <Pressable style={[styles.iconButton, loading && styles.disabled]} onPress={togglePlayback} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.surface} />
        ) : playing ? (
          <Pause size={20} color={colors.surface} />
        ) : (
          <Play size={20} color={colors.surface} />
        )}
      </Pressable>
      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.timeText}>
          {formatTime(positionMillis)} / {formatTime(durationMillis)}
        </Text>
      </View>
      <Pressable style={styles.secondaryButton} onPress={restart} disabled={loading}>
        <RotateCcw size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

function formatTime(value: number): string {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 24,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  progressBlock: {
    flex: 1,
    gap: 6,
  },
  progressTrack: {
    backgroundColor: "#E5E9E1",
    borderRadius: 3,
    height: 6,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    height: 6,
  },
  timeText: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  disabled: {
    opacity: 0.65,
  },
});
