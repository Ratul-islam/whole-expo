import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GlowHeader({
  title = "Leaderboard",
  subtitle = "Top routes and players",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <View style={s.wrap}>
      <View style={s.glowOne} />
      <View style={s.glowTwo} />

      <Text style={s.kicker}>Arena</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 22,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    marginTop: 4,
  },

  glowOne: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(17,17,17,0.06)",
  },

  glowTwo: {
    position: "absolute",
    left: -10,
    bottom: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(17,17,17,0.04)",
  },

  kicker: {
    color: "#6B6B6B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  title: {
    marginTop: 8,
    color: "#111111",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 8,
    color: "#6B6B6B",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});