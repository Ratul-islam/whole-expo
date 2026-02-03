import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ConnectedDevice } from "./types";

export function DevicePill({ device }: { device: ConnectedDevice }) {
  const connected = !!(device?.deviceId && device?.deviceSecret);

  return (
    <View style={[s.pill, connected ? s.pillOn : s.pillOff]}>
      <Text style={s.pillText}>{connected ? "DEVICE ✓" : "NO DEVICE"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pillOn: {
    backgroundColor: "rgba(16,185,129,0.14)",
    borderColor: "rgba(16,185,129,0.35)",
  },
  pillOff: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  pillText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "900",
    letterSpacing: 0.6,
    fontSize: 11,
  },
});
