import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export type SessionStatus =
  | "starting"
  | "preset_loaded"
  | "paused"
  | "in_game"
  | "completed"
  | "abandoned";

export type RecentSession = {
  sessionId: string;
  deviceId: string;
  status: SessionStatus;
  score?: number;
  correct?: number;
  wrong?: number;
  time?: number;
  endedAt?: string;
  createdAt?: string;
  pathName?: string;
};

function statusLabel(s: SessionStatus) {
  switch (s) {
    case "completed":
      return "COMPLETED";
    case "abandoned":
      return "ABANDONED";
    case "in_game":
      return "IN GAME";
    case "preset_loaded":
      return "READY";
    case "paused":
      return "PAUSED";
    case "starting":
    default:
      return "STARTING";
  }
}

function formatDuration(time?: number) {
  if (typeof time !== "number" || !isFinite(time) || time < 0) return "";
  const total = Math.floor(time);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function statusPillStyle(status: SessionStatus) {
  if (status === "completed") return [styles.pill, styles.pillGood];
  if (status === "abandoned") return [styles.pill, styles.pillBad];
  if (status === "in_game") return [styles.pill, styles.pillActive];
  return [styles.pill, styles.pillNeutral];
}

export function RecentRuns(props: {
  loading: boolean;
  err: string | null;
  completed: RecentSession[];
  onRetry: () => void;
  onPressItem?: (g: RecentSession) => void;
  formatTime: (iso?: string) => string;
}) {
  const { loading, err, completed, onRetry, onPressItem, formatTime } = props;
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const ui = {
    sectionTitle: isTablet ? 18 : 16,
    sectionSub: isTablet ? 13 : 12,
    cardPadding: isTablet ? 16 : isSmallPhone ? 12 : 14,
    runName: isTablet ? 16 : 15,
    meta: isTablet ? 13 : 12.5,
    score: isTablet ? 22 : 20,
    stateTitle: isTablet ? 15 : 14,
    stateHint: isTablet ? 13 : 12.5,
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleWrap}>
          <Text style={[styles.sectionTitle, { fontSize: ui.sectionTitle }]}>
            Recent runs
          </Text>
          <Text style={[styles.sectionSub, { fontSize: ui.sectionSub }]}>
            {loading ? "Loading…" : `${completed.length} shown`}
          </Text>
        </View>

        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>HISTORY</Text>
        </View>
      </View>

      {err ? (
        <View style={styles.stateCardError}>
          <Text style={[styles.stateTitle, { fontSize: ui.stateTitle }]}>
            Couldn’t load runs
          </Text>
          <Text
            style={[styles.stateHint, { fontSize: ui.stateHint }]}
            numberOfLines={2}
          >
            {err}
          </Text>

          <Pressable onPress={onRetry} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : completed.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={[styles.stateTitle, { fontSize: ui.stateTitle }]}>
            No runs yet
          </Text>
          <Text style={[styles.stateHint, { fontSize: ui.stateHint }]}>
            Play once and your history will show up here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {completed.map((g) => {
            const when = formatTime(g.endedAt || g.createdAt);
            const duration = formatDuration(g.time);
            const hasStats =
              typeof g.correct === "number" || typeof g.wrong === "number";

            return (
              <Pressable
                key={g.sessionId}
                onPress={() => onPressItem?.(g)}
                style={({ pressed }) => [
                  styles.card,
                  { padding: ui.cardPadding },
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <Text
                    style={[styles.runName, { fontSize: ui.runName }]}
                    numberOfLines={1}
                  >
                    {g.pathName || "Game"}
                  </Text>

                  <View style={statusPillStyle(g.status)}>
                    <Text style={styles.pillText}>{statusLabel(g.status)}</Text>
                  </View>
                </View>

                <Text
                  style={[styles.runMeta, { fontSize: ui.meta }]}
                  numberOfLines={2}
                >
                  {g.deviceId ? `Device ${g.deviceId}` : "Device —"} • {when}
                  {duration ? ` • ${duration}` : ""}
                </Text>

                <View style={styles.cardBottomRow}>
                  {hasStats ? (
                    <View style={styles.statsRow}>
                      {typeof g.correct === "number" && (
                        <View style={styles.statPill}>
                          <Text style={styles.statLabel}>Correct</Text>
                          <Text style={styles.statValue}>{g.correct}</Text>
                        </View>
                      )}

                      {typeof g.wrong === "number" && (
                        <View style={styles.statPill}>
                          <Text style={styles.statLabel}>Wrong</Text>
                          <Text style={styles.statValue}>{g.wrong}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyStatsSpace} />
                  )}

                  <View style={styles.scoreBox}>
                    <Text style={[styles.scoreValue, { fontSize: ui.score }]}>
                      {typeof g.score === "number" ? g.score : 0}
                    </Text>
                    <Text style={styles.scoreHint}>PTS</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    color: "#111111",
    fontWeight: "700",
  },

  sectionSub: {
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 3,
  },

  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  sectionBadgeText: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.9,
    fontSize: 11,
  },

  list: {
    gap: 10,
  },

  card: {
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  cardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: "#F0F0F0",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  runName: {
    color: "#111111",
    fontWeight: "700",
    flex: 1,
  },

  runMeta: {
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 18,
  },

  cardBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  pillText: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.6,
  },

  pillGood: {
    backgroundColor: "rgba(34,160,107,0.10)",
    borderColor: "rgba(34,160,107,0.25)",
  },

  pillBad: {
    backgroundColor: "rgba(225,85,114,0.10)",
    borderColor: "rgba(225,85,114,0.25)",
  },

  pillActive: {
    backgroundColor: "rgba(228,161,27,0.10)",
    borderColor: "rgba(228,161,27,0.25)",
  },

  pillNeutral: {
    backgroundColor: "#EFEFEF",
    borderColor: "#D9D9D9",
  },

  scoreBox: {
    alignItems: "flex-end",
    minWidth: 64,
  },

  scoreValue: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  scoreHint: {
    color: "#7A7A7A",
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.8,
    fontSize: 11,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },

  emptyStatsSpace: {
    flex: 1,
  },

  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  statLabel: {
    color: "#7A7A7A",
    fontWeight: "700",
    fontSize: 11,
  },

  statValue: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 12,
  },

  stateCard: {
    marginTop: 10,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  stateCardError: {
    marginTop: 10,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(225,85,114,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.22)",
  },

  stateTitle: {
    color: "#111111",
    fontWeight: "700",
  },

  stateHint: {
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 18,
  },

  primaryBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});