import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function StatCard({
  icon,
  label,
  value,
  subValue,
  gradient,
}: {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: [string, string];
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={s.inner}>
        <LinearGradient colors={gradient} style={s.iconWrap}>
          <Text style={s.icon}>{icon}</Text>
        </LinearGradient>
        <Text style={s.value}>{value}</Text>
        <Text style={s.label}>{label}</Text>
        {subValue ? <Text style={s.sub}>{subValue}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: { width: "48%" },
  inner: {
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  iconWrap: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  icon: { fontSize: 22 },
  value: { color: "#fff", fontSize: 22, fontWeight: "900" },
  label: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: "700", marginTop: 2 },
});
