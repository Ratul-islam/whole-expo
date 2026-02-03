import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export type SessionStatus = "starting" | "preset_loaded" | "in_game" | "completed" | "abandoned";

export type RecentSession = {
  sessionId: string;
  deviceId: string;
  status: SessionStatus;
  score?: number;
  correct?: number;
  wrong?: number;
  endedAt?: string;
  createdAt?: string;
  pathName?: string;
};

export function RecentRuns(props: {
  loading: boolean;
  err: string | null;
  completed: RecentSession[];
  onRetry: () => void;
  onPressItem?: (g: RecentSession) => void;
  formatTime: (iso?: string) => string;
}) {
  const { loading, err, completed, onRetry, onPressItem, formatTime } = props;

  return (
    <View style={ui.section}>
      <View style={ui.sectionHead}>
        <Text style={ui.sectionTitle}>RECENT RUNS</Text>
        <Text style={ui.sectionHint}>{loading ? "Loading…" : `${completed.length} shown`}</Text>
      </View>

      {err ? (
        <View style={ui.errBox}>
          <Text style={ui.errText}>{err}</Text>
          <Pressable onPress={onRetry} style={ui.errBtn}>
            <Text style={ui.errBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : completed.length === 0 ? (
        <View style={ui.emptyBox}>
          <Text style={ui.emptyTitle}>No runs yet</Text>
          <Text style={ui.emptyHint}>Play once and your history will appear here.</Text>
        </View>
      ) : (
        completed.map((g) => (
          <Pressable
            key={g.sessionId}
            onPress={() => onPressItem?.(g)}
            style={ui.runRow}
          >
            <View style={ui.runLeft}>
              <Text style={ui.runName} numberOfLines={1}>
                {g.pathName || "Game"}
              </Text>
              <Text style={ui.runMeta} numberOfLines={1}>
                {g.deviceId ? `Device ${g.deviceId}` : "Device —"} • {formatTime(g.endedAt || g.createdAt)}
              </Text>
            </View>

            <View style={ui.runRight}>
              <Text style={ui.runScore}>{typeof g.score === "number" ? g.score : 0}</Text>
              <Text style={ui.runScoreHint}>PTS</Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const ui = StyleSheet.create({
  section: { marginTop: 14 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  sectionTitle: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.3 },
  sectionHint: { color: "rgba(255,255,255,0.55)", fontWeight: "800" },

  runRow: {
    marginTop: 10,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  runLeft: { flex: 1 },
  runName: { color: "#fff", fontWeight: "900" },
  runMeta: { color: "rgba(255,255,255,0.60)", fontWeight: "800", marginTop: 4 },
  runRight: { alignItems: "flex-end" },
  runScore: { color: "#fff", fontWeight: "900", fontSize: 18 },
  runScoreHint: { color: "rgba(255,255,255,0.55)", fontWeight: "900", marginTop: 2, letterSpacing: 1.2 },

  emptyBox: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  emptyTitle: { color: "#fff", fontWeight: "900" },
  emptyHint: { color: "rgba(255,255,255,0.65)", fontWeight: "800", marginTop: 6 },

  errBox: {
    marginTop: 10,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,80,80,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.25)",
  },
  errText: { color: "#FFD6DE", fontWeight: "900" },
  errBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  errBtnText: { color: "#fff", fontWeight: "900" },
});
