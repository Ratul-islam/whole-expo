import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GlowHeader({
  title = "LEADERBOARD",
  subtitle = "Climb the ranks. Stay on top.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={["rgba(99,102,241,0.18)", "rgba(139,92,246,0.06)", "rgba(0,0,0,0)"]}
        style={s.card}
      >
        <Animated.View
          style={[
            s.glow,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
            },
          ]}
        />
        <View style={s.row}>
          <Text style={s.icon}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 8 },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    right: -80,
    top: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(99,102,241,0.55)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { fontSize: 34 },
  title: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1.6 },
  subtitle: { color: "rgba(255,255,255,0.65)", fontWeight: "700", marginTop: 3 },
});
