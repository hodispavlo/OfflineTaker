import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props<T extends string> = {
  tabs: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  const [width, setWidth] = useState(0);
  const activeIndex = Math.max(0, tabs.indexOf(value));
  const animatedIndex = useRef(new Animated.Value(activeIndex)).current;
  const tabWidth = width > 0 ? (width - 8) / tabs.length : 0;

  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: activeIndex,
      damping: 18,
      mass: 0.8,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, animatedIndex]);

  const translateX = useMemo(() => Animated.multiply(animatedIndex, tabWidth), [animatedIndex, tabWidth]);

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activePill,
            {
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}

      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab)}
            style={styles.tab}
          >
            <Text style={[styles.tabText, active && styles.activeText]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EEF2F7",
    borderColor: "rgba(148, 163, 184, 0.28)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    padding: 4,
    position: "relative",
  },
  activePill: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    bottom: 4,
    left: 4,
    position: "absolute",
    top: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    zIndex: 1,
  },
  tabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    includeFontPadding: false,
    lineHeight: 18,
  },
  activeText: {
    color: colors.text,
  },
});
