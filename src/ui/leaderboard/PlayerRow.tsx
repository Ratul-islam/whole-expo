import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type LeaderboardItem = {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt: string | null;
  rank: number;
};

function accuracy(p: LeaderboardItem) {
  const t = (p.totalCorrect ?? 0) + (p.totalWrong ?? 0);
  if (t <= 0) return 0;
  return Math.round(((p.totalCorrect ?? 0) / t) * 100);
}

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

export default function PlayerRow({
  player,
  index,
  onPress,
}: {
  player: LeaderboardItem;
  index: number;
  onPress: () => void;
}) {
  const slide = useRef(new Animated.Value(18)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 240,
        delay: Math.min(index * 22, 220),
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        delay: Math.min(index * 22, 220),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, slide, fade]);

  const a = accuracy(player);

  return (
    <Animated.View style={{ transform: [{ translateY: slide }], opacity: fade }}>
      <Pressable onPress={onPress}>
        <LinearGradient colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.02)"]} style={s.row}>
          <View style={s.rankCol}>
            <Text style={s.rankText}>#{player.rank}</Text>
            {!!medal(player.rank) && <Text style={s.medal}>{medal(player.rank)}</Text>}
          </View>

          <View style={s.mid}>
            <Text style={s.name} numberOfLines={1}>
              {player.username || "Player"}
            </Text>
            <Text style={s.meta}>
              {player.gamesPlayed} games • {a}% acc
            </Text>
          </View>

          <View style={s.scoreCol}>
            <Text style={s.score}>{(player.totalScore ?? 0).toLocaleString()}</Text>
            <View style={s.scoreBar} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rankCol: { width: 54, alignItems: "flex-start" },
  rankText: { color: "rgba(255,255,255,0.80)", fontWeight: "900" },
  medal: { marginTop: 2, fontSize: 14, opacity: 0.9 },
  mid: { flex: 1 },
  name: { color: "#fff", fontWeight: "900", fontSize: 15 },
  meta: { color: "rgba(255,255,255,0.55)", fontWeight: "700", marginTop: 3, fontSize: 12 },
  scoreCol: { alignItems: "flex-end" },
  score: { color: "#fff", fontWeight: "900", fontSize: 18 },
  scoreBar: { width: 40, height: 3, borderRadius: 3, backgroundColor: "rgba(99,102,241,0.9)", marginTop: 6 },
});
