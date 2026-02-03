import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

export type DevicePhase =
  | "DISCONNECTED"
  | "CONNECTED"
  | "PRESET_LOADED"
  | "IN_GAME"
  | "COMPLETED"
  | "ABANDONED";

function phaseLabel(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return "DISCONNECTED";
  if (phase === "CONNECTED") return "CONNECTED";
  if (phase === "PRESET_LOADED") return "READY";
  if (phase === "IN_GAME") return "IN GAME";
  if (phase === "COMPLETED") return "COMPLETED";
  if (phase === "ABANDONED") return "TIMED OUT";
  return "CONNECTED";
}

function phaseAccent(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return ["#8A8FA3", "rgba(138,143,163,0.25)"] as const;
  if (phase === "CONNECTED") return ["#7AA2FF", "rgba(122,162,255,0.28)"] as const;
  if (phase === "PRESET_LOADED") return ["#41D79A", "rgba(65,215,154,0.25)"] as const;
  if (phase === "IN_GAME") return ["#FFB020", "rgba(255,176,32,0.25)"] as const;
  if (phase === "COMPLETED") return ["#B98CFF", "rgba(185,140,255,0.25)"] as const;
  if (phase === "ABANDONED") return ["#FF5C7A", "rgba(255,92,122,0.25)"] as const;
  return ["#7AA2FF", "rgba(122,162,255,0.28)"] as const;
}

export function StatusOrb(props: {
  phase: DevicePhase;
  deviceId?: string;
  wsOnline: boolean;
}) {
  const { phase, deviceId, wsOnline } = props;
  const [main, glow] = useMemo(() => phaseAccent(phase), [phase]);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, phase]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, phase === "IN_GAME" ? 1.08 : 1.04] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  useEffect(() => {
    console.log("[StatusOrb] render", { phase, wsOnline, deviceId });
  }, [phase, wsOnline, deviceId]);

  return (
    <View style={ui.orbWrap}>
      <View style={[ui.orbOuter, { borderColor: `${main}66` }]}>
        <Animated.View style={[ui.orbGlow, { backgroundColor: glow, transform: [{ scale }], opacity }]} />
        <View style={[ui.orbCore, { borderColor: `${main}66` }]}>
          <Text style={ui.orbTitle}>{phaseLabel(phase)}</Text>
          <Text style={ui.orbSub} numberOfLines={1}>
            {phase === "DISCONNECTED" ? "No device" : `Device ${deviceId || "—"}`}
          </Text>

          <View style={ui.orbMetaRow}>
            <View style={[ui.dot, { backgroundColor: wsOnline ? "#41D79A" : "#FF5C7A" }]} />
            <Text style={ui.orbMeta}>{wsOnline ? "LIVE" : "OFFLINE"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const ui = StyleSheet.create({
  orbWrap: { marginTop: 14, alignItems: "center" },
  orbOuter: {
    width: 210,
    height: 210,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(10,14,28,0.85)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orbGlow: { position: "absolute", width: 260, height: 260, borderRadius: 999 },
  orbCore: {
    width: 172,
    height: 172,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  orbTitle: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1.2 },
  orbSub: { color: "rgba(255,255,255,0.70)", fontWeight: "800", marginTop: 8 },
  orbMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  orbMeta: { color: "rgba(255,255,255,0.75)", fontWeight: "900", letterSpacing: 1.2, fontSize: 12 },
  dot: { width: 10, height: 10, borderRadius: 999 },
});
