import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2, CircleDot } from "lucide-react-native";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAIProfile } from "../context/AIProfileContext";
import { AIProfile, PROFILE_CATEGORIES, ProfileCategory, UNIVERSAL_PROFILE } from "../profiles/aiProfiles";
import { colors } from "../theme/colors";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen(_props: Props) {
  const { profiles, selectedProfile, setSelectedProfile } = useAIProfile();
  const groupedProfiles = useMemo(
    () =>
      PROFILE_CATEGORIES.map((category) => ({
        category,
        data: profiles.filter((profile) => profile.category === category),
      })),
    [profiles]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>AI Profile Optimizer</Text>
          <Text style={styles.title}>Tune summaries for your profession</Text>
          <Text style={styles.subtitle}>
            The selected profile becomes the global default for future recordings and retries.
          </Text>
        </View>

        <UniversalCard selected={selectedProfile === UNIVERSAL_PROFILE} onPress={() => setSelectedProfile(UNIVERSAL_PROFILE)} />

        {groupedProfiles.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupTitle}>{group.category}</Text>
            <View style={styles.cardStack}>
              {group.data.map((profile) => (
                <ProfileCard
                  key={profile.title}
                  profile={profile}
                  selected={selectedProfile === profile.title}
                  onPress={() => setSelectedProfile(profile.title)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function UniversalCard({ selected, onPress }: { selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.universalCard, selected && styles.selectedCard, pressed && styles.pressedCard]}
    >
      <View style={styles.iconBox}>
        <CircleDot size={20} color={colors.primary} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>Universal</Text>
        <Text style={styles.cardSubtitle}>Balanced meeting summaries for general conversations.</Text>
      </View>
      <AnimatedCheck visible={selected} />
    </Pressable>
  );
}

function ProfileCard({ profile, selected, onPress }: { profile: AIProfile; selected: boolean; onPress: () => void }) {
  const Icon = profile.icon;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selectedCard, pressed && styles.pressedCard]}
    >
      <View style={styles.iconBox}>
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{profile.title}</Text>
        <Text style={styles.cardSubtitle}>{profile.subtitle}</Text>
      </View>
      <AnimatedCheck visible={selected} />
    </Pressable>
  );
}

function AnimatedCheck({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: visible ? 1 : 0.82,
        damping: 14,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <CheckCircle2 size={22} color={colors.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 32,
  },
  hero: {
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
    fontSize: 30,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
    includeFontPadding: false,
    lineHeight: 22,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 24,
  },
  cardStack: {
    gap: 10,
  },
  card: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
  },
  universalCard: {
    borderColor: "#BFDBFE",
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressedCard: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    marginTop: 2,
    width: 44,
  },
  cardCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 5,
    minWidth: 0,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    includeFontPadding: false,
    lineHeight: 21,
    flexShrink: 1,
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
    lineHeight: 18,
    flexShrink: 1,
  },
});
