import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  onMyRoutes: () => void;
  onLeaderboard: () => void;
};

type RowProps = {
  title: string;
  subtitle: string;
  rightLabel?: string;
  onPress: () => void;
};

function QuickRow({ title, subtitle, rightLabel, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={s.rowRight}>
        {rightLabel ? <Text style={s.rightLabel}>{rightLabel}</Text> : null}
        <Text style={s.chev}>›</Text>
      </View>
    </Pressable>
  );
}

export function HomeShortcutChips({ onMyRoutes, onLeaderboard }: Props) {
  return (
    <View style={s.section}>
      <View style={s.header}>
        <Text style={s.title}>Quick Jump</Text>
        <Text style={s.hint}>Your routes & the community</Text>
      </View>

      <View style={s.card}>
        <QuickRow
          title="My Routes"
          subtitle="Your created + downloaded routes"
          rightLabel="Manage"
          onPress={onMyRoutes}
        />

        <View style={s.divider} />

        <QuickRow
          title="Leader board"
          subtitle="Top scores and popular routes"
          rightLabel="Explore"
          onPress={onLeaderboard}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 18 },

  header: { marginBottom: 10 },
  title: { color: "#fff", fontWeight: "900", fontSize: 16 },
  hint: { marginTop: 4, color: "rgba(255,255,255,0.55)", fontWeight: "800" },

  card: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },

  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowPressed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  rowTitle: { color: "#fff", fontWeight: "900", fontSize: 15 },
  rowSub: { marginTop: 4, color: "rgba(255,255,255,0.62)", fontWeight: "800" },

  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  rightLabel: { color: "rgba(207,224,255,0.85)", fontWeight: "900" },
  chev: { color: "rgba(255,255,255,0.75)", fontWeight: "900", fontSize: 18 },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginLeft: 14,
    marginRight: 14,
  },
});
