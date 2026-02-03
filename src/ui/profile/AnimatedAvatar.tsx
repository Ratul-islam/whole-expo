import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

function initials(first?: string, last?: string) {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "??";
}

export function AnimatedAvatar({
  firstName,
  lastName,
  verified,
  size = 120,
}: {
  firstName?: string;
  lastName?: string;
  verified?: boolean;
  size?: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const ringSize = size;
  const glowSize = Math.round(size * 1.16);
  const innerSize = Math.round(size * 0.84);

  const inits = useMemo(() => initials(firstName, lastName), [firstName, lastName]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 10000, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, [pulse, rotate]);

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          s.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={["#8B5CF6", "#6366F1", "#3B82F6", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.ringGrad, { borderRadius: ringSize / 2 }]}
        />
      </Animated.View>

      <Animated.View
        style={[
          s.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
          },
        ]}
      />

      <LinearGradient colors={["#1a1a2e", "#0f0f1a"]} style={[s.circle, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        <Text style={[s.inits, { fontSize: Math.max(22, Math.round(innerSize * 0.34)) }]}>{inits}</Text>
      </LinearGradient>

      {verified ? (
        <LinearGradient colors={["#10B981", "#059669"]} style={[s.badge, { borderRadius: 999 }]}>
          <Text style={s.badgeText}>✓</Text>
        </LinearGradient>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", padding: 3 },
  ringGrad: { flex: 1, opacity: 0.6 },
  glow: { position: "absolute", backgroundColor: "rgba(139, 92, 246, 0.28)" },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  inits: { color: "#fff", fontWeight: "900", letterSpacing: 2 },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0f0f1a",
  },
  badgeText: { color: "#fff", fontWeight: "900" },
});
