import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";

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
        <ActivityIndicator color="#111111" />
        <Text style={s.text}>{message}</Text>
      </View>
    );
  }

  if (type === "error") {
    return (
      <View style={s.err}>
        <Text style={s.errTitle}>⚠️</Text>
        <Text style={s.text}>{message}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={s.retry}>
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>🎯</Text>
      <Text style={s.text}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 24,
    alignItems: "center",
    gap: 12,
  },

  err: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.22)",
    backgroundColor: "rgba(225,85,114,0.06)",
    alignItems: "center",
    gap: 8,
  },

  errTitle: {
    fontSize: 22,
  },

  empty: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },

  emptyIcon: {
    fontSize: 28,
    opacity: 0.7,
  },

  text: {
    color: "#6B6B6B",
    fontWeight: "500",
    textAlign: "center",
  },

  retry: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});