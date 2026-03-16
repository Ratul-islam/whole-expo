import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

export default function PlayerRow({
  rank,
  title,
  subtitle,
  value,
  valueLabel,
  index = 0,
  onPress,
}: {
  rank: number;
  title: string;
  subtitle?: string;
  value: string | number;
  valueLabel?: string;
  index?: number;
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

  return (
    <Animated.View style={{ transform: [{ translateY: slide }], opacity: fade }}>
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && s.pressed]}>
        <View style={s.row}>
          <View style={s.rankCol}>
            <Text style={s.rankText}>#{rank}</Text>
            {!!medal(rank) && <Text style={s.medal}>{medal(rank)}</Text>}
          </View>

          <View style={s.mid}>
            <Text style={s.name} numberOfLines={1}>
              {title}
            </Text>
            {!!subtitle ? (
              <Text style={s.meta} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={s.scoreCol}>
            <Text style={s.score}>{value}</Text>
            <Text style={s.valueLabel}>{valueLabel || ""}</Text>
          </View>
        </View>
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
    borderColor: "#E3E3E3",
    backgroundColor: "#F7F7F7",
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },

  rankCol: {
    width: 54,
    alignItems: "flex-start",
  },

  rankText: {
    color: "#444444",
    fontWeight: "700",
  },

  medal: {
    marginTop: 2,
    fontSize: 14,
    opacity: 0.9,
  },

  mid: {
    flex: 1,
  },

  name: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 15,
  },

  meta: {
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 3,
    fontSize: 12,
  },

  scoreCol: {
    alignItems: "flex-end",
    minWidth: 70,
  },

  score: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 18,
  },

  valueLabel: {
    color: "#7A7A7A",
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 1,
    fontSize: 11,
  },
});