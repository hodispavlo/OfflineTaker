import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles } from "lucide-react-native";
import { ReactNode, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

export function AnimatedContentCard({ children, animationKey }: { children: ReactNode; animationKey: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationKey, opacity, translateY]);

  return <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function ProcessingCard({ label }: { label: string }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <AnimatedContentCard animationKey="processing">
      <View style={styles.statusRow}>
        <View style={styles.processingIcon}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={16} color={colors.primary} />
          </Animated.View>
        </View>
        <Text style={styles.processingLabel}>{label}</Text>
      </View>

      <View style={styles.skeletonGroup}>
        <SkeletonLine width="68%" height={24} />
        <SkeletonLine width="94%" />
        <SkeletonLine width="88%" />
        <SkeletonLine width="74%" />
        <View style={styles.skeletonSpacer} />
        <SkeletonLine width="52%" height={22} />
        <SkeletonLine width="90%" />
        <SkeletonLine width="66%" />
      </View>
    </AnimatedContentCard>
  );
}

export function FailureCard({ message, onRetry, retrying }: { message?: string | null; onRetry: () => void; retrying: boolean }) {
  return (
    <AnimatedContentCard animationKey="failed">
      <View style={styles.failureIcon}>
        <AlertTriangle size={28} color={colors.failed} />
      </View>
      <Text style={styles.failureTitle}>Processing needs attention</Text>
      <Text style={styles.failureText}>
        {message || "The AI pipeline could not finish this recording. You can retry the process without recording again."}
      </Text>
      <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.pressedButton]} onPress={onRetry} disabled={retrying}>
        <RefreshCw size={18} color={colors.surface} />
        <Text style={styles.retryText}>{retrying ? "Retrying..." : "Retry Process"}</Text>
      </Pressable>
    </AnimatedContentCard>
  );
}

export function SuccessToast({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    translateY.setValue(-8);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 16, stiffness: 180, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <CheckCircle2 size={16} color={colors.success} />
      <Text style={styles.toastText}>Successfully compiled</Text>
    </Animated.View>
  );
}

export function InteractiveBullet({ children }: { children: ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      damping: 16,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={() => animate(0.985)}
        onPressOut={() => animate(1)}
        style={({ pressed }) => [styles.bulletRow, pressed && styles.bulletPressed]}
      >
        <View style={styles.bulletDot}>
          <Sparkles size={12} color={colors.primary} />
        </View>
        <Text style={styles.bulletText}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

function SkeletonLine({ width, height = 14 }: { width: `${number}%`; height?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 260],
  });

  return (
    <View style={[styles.skeletonLine, { width, height }]}>
      <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  processingIcon: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  processingLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 20,
  },
  skeletonGroup: {
    gap: 12,
  },
  skeletonSpacer: {
    height: 8,
  },
  skeletonLine: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    overflow: "hidden",
  },
  skeletonShimmer: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    height: "100%",
    width: 120,
  },
  failureIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginBottom: 14,
    width: 44,
  },
  failureTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 26,
    marginBottom: 8,
  },
  failureText: {
    color: colors.muted,
    fontSize: 15,
    includeFontPadding: false,
    lineHeight: 22,
    marginBottom: 18,
  },
  retryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.failed,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  retryText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 20,
  },
  pressedButton: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  toast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.successSoft,
    borderColor: "rgba(5, 150, 105, 0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  toastText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 16,
  },
  bulletRow: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  bulletPressed: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  bulletDot: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    marginTop: 1,
    width: 24,
  },
  bulletText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    includeFontPadding: false,
    lineHeight: 22,
  },
});
