import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type SessionStatus = "starting" | "preset_loaded" | "in_game" | "completed" | "abandoned";

export type ProfileSession = {
  _id: string;
  status: SessionStatus;
  score: number;
  correct: number;
  wrong: number;
  createdAt?: string;
  updatedAt?: string;
};

function formatTinyTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function GameCard({ game, index }: { game: ProfileSession; index: number }) {
  const slideIn = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 360,
        delay: index * 90,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.4)),
      }),
      Animated.timing(fadeIn, { toValue: 1, duration: 260, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, [slideIn, fadeIn, index]);

  const isCompleted = game.status === "completed";

  const accuracy = useMemo(() => {
    const total = (game.correct || 0) + (game.wrong || 0);
    if (total <= 0) return 0;
    return Math.round(((game.correct || 0) / total) * 100);
  }, [game.correct, game.wrong]);

  return (
    <Animated.View style={{ transform: [{ translateX: slideIn }], opacity: fadeIn }}>
      <LinearGradient
        colors={
          isCompleted
            ? ["rgba(16, 185, 129, 0.10)", "rgba(16, 185, 129, 0.02)"]
            : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
        }
        style={s.card}
      >
        <View style={s.head}>
          <View style={s.statusRow}>
            <View style={[s.dot, isCompleted ? s.dotOk : s.dotWarn]} />
            <Text style={s.statusText}>{isCompleted ? "COMPLETED" : game.status.toUpperCase()}</Text>
          </View>
          <Text style={s.date}>{formatTinyTime(game.updatedAt || game.createdAt)}</Text>
        </View>

        <View style={s.row}>
          <Stat value={game.score} label="Score" />
          <Divider />
          <Stat value={game.correct} label="Correct" tint="#10B981" />
          <Divider />
          <Stat value={game.wrong} label="Wrong" tint="#EF4444" />
          <Divider />
          <Stat value={`${accuracy}%`} label="Acc" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function Stat({ value, label, tint }: { value: string | number; label: string; tint?: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={s.div} />;
}

const s = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOk: { backgroundColor: "#10B981" },
  dotWarn: { backgroundColor: "#F59E0B" },
  statusText: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  date: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: 18, fontWeight: "900" },
  statLbl: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "800", marginTop: 2 },
  div: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.10)" },
});
