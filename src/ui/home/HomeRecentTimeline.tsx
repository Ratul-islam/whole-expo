import React from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";

export type HomeRecentItem = {
  id: string;
  title: string;
  subtitle: string;
  score: number | null;
  raw?: any;
};

type Props = {
  title: string;
  hint?: string;
  loading: boolean;
  error: string | null;
  items: HomeRecentItem[];
  onRetry: () => void;
  onPressItem: (item: HomeRecentItem) => void;
};

export function HomeRecentTimeline({
  title,
  hint,
  loading,
  error,
  items,
  onRetry,
  onPressItem,
}: Props) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        {!!hint && <Text style={s.sectionHint}>{hint}</Text>}
      </View>

      {loading ? (
        <View style={s.centerRow}>
          <ActivityIndicator />
          <Text style={s.dim}>Loading…</Text>
        </View>
      ) : error ? (
        <Pressable
          style={s.errorBox}
          onPress={() =>
            Alert.alert("Retry", "Try loading again?", [
              { text: "Cancel", style: "cancel" },
              { text: "Retry", onPress: onRetry },
            ])
          }
        >
          <Text style={s.errorTitle}>Couldn’t load sessions</Text>
          <Text style={s.errorText}>{error}</Text>
          <Text style={s.errorHint}>Tap to retry</Text>
        </Pressable>
      ) : items.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyTitle}>No completed games yet</Text>
          <Text style={s.dim}>Your history will appear here.</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {items.map((it, idx) => (
            <Pressable key={it.id} style={s.timelineRow} onPress={() => onPressItem(it)}>
              <View style={s.timelineLeft}>
                <View style={s.timelineDot} />
                {idx !== items.length - 1 && <View style={s.timelineLine} />}
              </View>

              <View style={s.timelineBody}>
                <View style={s.timelineTop}>
                  <Text style={s.timelineTitle} numberOfLines={1}>
                    {it.title}
                  </Text>
                  <View style={s.scoreBubble}>
                    <Text style={s.scoreBubbleText}>{typeof it.score === "number" ? it.score : "—"}</Text>
                  </View>
                </View>
                <Text style={s.timelineSub} numberOfLines={1}>
                  {it.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  sectionHint: { color: "rgba(255,255,255,0.55)", fontWeight: "700" },

  centerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  dim: { color: "rgba(255,255,255,0.70)", fontWeight: "700" },

  errorBox: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,80,80,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.35)",
  },
  errorTitle: { color: "#fff", fontWeight: "900" },
  errorText: { color: "rgba(255,255,255,0.80)", marginTop: 6, fontWeight: "700" },
  errorHint: { color: "rgba(255,255,255,0.65)", marginTop: 8, fontWeight: "700" },

  emptyBox: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  emptyTitle: { color: "#fff", fontWeight: "900", marginBottom: 6 },

  timelineRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  timelineLeft: { width: 16, alignItems: "center" },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(122,162,255,0.85)",
    marginTop: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginTop: 8,
  },
  timelineBody: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  timelineTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  timelineTitle: { color: "#fff", fontWeight: "900", flex: 1 },
  timelineSub: { color: "rgba(255,255,255,0.65)", marginTop: 6, fontWeight: "700" },

  scoreBubble: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(122,162,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.28)",
  },
  scoreBubbleText: { color: "#CFE0FF", fontWeight: "900" },
});
