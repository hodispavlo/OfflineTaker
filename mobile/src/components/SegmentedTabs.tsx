import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props<T extends string> = {
  tabs: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedTabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="button"
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.activeTab]}
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
    backgroundColor: "#E8ECE4",
    borderRadius: 8,
    flexDirection: "row",
    padding: 3,
  },
  tab: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  tabText: {
    color: colors.muted,
    fontWeight: "700",
  },
  activeText: {
    color: colors.text,
  },
});
