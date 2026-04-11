import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

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
  const scaleHook = useResponsiveScale();
  const s = useMemo(() => getResponsiveStyles(scaleHook), [scaleHook]);

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
      <View style={[s.card, isCompleted ? s.cardOk : s.cardNeutral]}>
        <View style={s.head}>
          <View style={s.statusRow}>
            <View style={[s.dot, isCompleted ? s.dotOk : s.dotWarn]} />
            <Text style={s.statusText}>{isCompleted ? "COMPLETED" : game.status.toUpperCase()}</Text>
          </View>
          <Text style={s.date}>{formatTinyTime(game.updatedAt || game.createdAt)}</Text>
        </View>

        <View style={s.row}>
          <Stat value={game.score} label="Score" s={s} />
          <View style={s.div} />
          <Stat value={game.correct} label="Correct" tint="#059669" s={s} />
          <View style={s.div} />
          <Stat value={game.wrong} label="Wrong" tint="#DC2626" s={s} />
          <View style={s.div} />
          <Stat value={`${accuracy}%`} label="Acc" s={s} />
        </View>
      </View>
    </Animated.View>
  );
}

function Stat({ value, label, tint, s }: { value: string | number; label: string; tint?: string; s: any }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const getResponsiveStyles = (scale: (val: number) => number) =>
  StyleSheet.create({
    card: { 
      padding: scale(16), 
      borderRadius: scale(18), 
      borderWidth: 1, 
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    cardOk: { borderColor: "rgba(16, 185, 129, 0.3)" },
    cardNeutral: { borderColor: "#E3E3E3" },
    
    head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: scale(12) },
    statusRow: { flexDirection: "row", alignItems: "center", gap: scale(8) },
    dot: { width: scale(8), height: scale(8), borderRadius: scale(4) },
    dotOk: { backgroundColor: "#10B981" },
    dotWarn: { backgroundColor: "#F59E0B" },
    statusText: { color: "#111111", fontSize: scale(11), fontWeight: "800", letterSpacing: 0.8 },
    date: { color: "#8A8A8A", fontSize: scale(11), fontWeight: "600" },
    
    row: { flexDirection: "row", alignItems: "center" },
    stat: { flex: 1, alignItems: "center" },
    statVal: { color: "#111111", fontSize: scale(16), fontWeight: "800", letterSpacing: -0.5 },
    statLbl: { color: "#6B6B6B", fontSize: scale(10), fontWeight: "700", marginTop: scale(2) },
    div: { width: 1, height: scale(28), backgroundColor: "#E3E3E3" },
  });