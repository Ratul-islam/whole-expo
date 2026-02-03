import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function StatusCard({
  type,
  message,
  onRetry,
}: {
  type: "loading" | "error" | "empty";
  message: string;
  onRetry?: () => void;
}) {
  if (type === "loading") {
    return (
      <View style={s.wrap}>
        <ActivityIndicator color="#6366f1" />
        <Text style={s.text}>{message}</Text>
      </View>
    );
  }

  if (type === "error") {
    return (
      <LinearGradient colors={["rgba(239,68,68,0.16)", "rgba(239,68,68,0.05)"]} style={s.err}>
        <Text style={s.errTitle}>⚠️</Text>
        <Text style={s.text}>{message}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={s.retry}>
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    );
  }

  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>🎮</Text>
      <Text style={s.text}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24, alignItems: "center", gap: 12 },
  err: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.30)",
    alignItems: "center",
    gap: 8,
  },
  errTitle: { fontSize: 22 },
  empty: { marginTop: 24, alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 28, opacity: 0.7 },
  text: { color: "rgba(255,255,255,0.72)", fontWeight: "700", textAlign: "center" },
  retry: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  retryText: { color: "#fff", fontWeight: "900" },
});
