import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Route } from "../../routes/types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function fmtMs(ms?: number | null) {
  if (!ms && ms !== 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RouteCard({
  route,
  onPress,
  rightActionLabel,
  onRightAction,
}: {
  route: Route;
  onPress?: () => void;
  rightActionLabel?: string;
  onRightAction?: () => void;
}) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{route.fileName}</Text>

        <View style={s.row}>
          <Text style={s.meta}>By: {route.createdBy}</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.meta}>Difficulty: {route.difficulty}</Text>
        </View>

        <View style={s.row}>
          <Text style={s.meta}>Moves: {route.numberOfMoves}</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.meta}>Created: {fmtDate(route.createdAtISO)}</Text>
        </View>

        {typeof route.bestTimeMs !== "undefined" ? (
          <View style={s.row}>
            <Text style={s.meta}>Best Time: {fmtMs(route.bestTimeMs)}</Text>
            <Text style={s.dot}>•</Text>
            <Text style={s.meta}>Best Score: {route.bestScore ?? "—"}</Text>
          </View>
        ) : null}

        {route.top3?.length ? (
          <Text style={s.metaTop}>
            Top:{" "}
            {route.top3
              .slice(0, 3)
              .map((t) => `#${t.rank} ${fmtMs(t.timeMs)} / ${t.score}`)
              .join("  |  ")}
          </Text>
        ) : null}
      </View>

      {rightActionLabel ? (
        <Pressable
          style={s.action}
          onPress={(e) => {
            e.stopPropagation();
            onRightAction?.();
          }}
        >
          <Text style={s.actionText}>{rightActionLabel}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  title: { color: "white", fontSize: 16, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6, flexWrap: "wrap" },
  meta: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600" },
  dot: { marginHorizontal: 8, color: "rgba(255,255,255,0.35)" },
  metaTop: { marginTop: 8, color: "rgba(255,255,255,0.7)", fontSize: 12 },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  actionText: { color: "white", fontWeight: "800", fontSize: 12 },
});
