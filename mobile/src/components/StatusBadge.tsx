import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { NoteStatus } from "../types";

type Props = {
  status: NoteStatus;
};

const labels: Record<NoteStatus, string> = {
  processing: "Processing",
  completed: "Ready",
  failed: "Failed",
};

const palette: Record<NoteStatus, string> = {
  processing: colors.warning,
  completed: colors.success,
  failed: colors.failed,
};

export function StatusBadge({ status }: Props) {
  return (
    <View style={[styles.badge, { borderColor: palette[status] }]}>
      <Text style={[styles.label, { color: palette[status] }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
