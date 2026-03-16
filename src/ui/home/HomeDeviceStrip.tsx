import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import type { DevicePhase } from "./HomePlayTile";

type Props = {
  loading: boolean;
  connected: boolean;
  deviceId: string;
  phase?: DevicePhase;
  onActionPress: () => void;
};

export function HomeDeviceStrip({ loading, connected, deviceId, phase = "DISCONNECTED", onActionPress }: Props) {
  const label = useMemo(() => {
    if (!connected) return "Not connected";
    if (phase === "CONNECTED") return `Connected • ${deviceId}`;
    if (phase === "PRESET_LOADED") return `Preset loaded • ${deviceId}`;
    if (phase === "IN_GAME") return `In game • ${deviceId}`;
    if (phase === "COMPLETED") return `Completed • ${deviceId}`;
    if (phase === "ABANDONED") return `Timed out • ${deviceId}`;
    return `Connected • ${deviceId}`;
  }, [connected, phase, deviceId]);

  const btnText = useMemo(() => {
    if (!connected) return "Scan";
    if (phase === "IN_GAME") return "In game";
    if (phase === "PRESET_LOADED") return "Start";
    return "Load";
  }, [connected, phase]);

  const dotStyle = useMemo(() => {
    if (!connected) return s.dotDim;
    if (phase === "IN_GAME") return s.dotWarn;
    if (phase === "PRESET_LOADED") return s.dotReady;
    return s.dotGood;
  }, [connected, phase]);

  const btnStyle = useMemo(() => {
    if (!connected) return s.deviceBtnGhost;
    if (phase === "IN_GAME") return s.deviceBtnGhost;
    return s.deviceBtnPrimary;
  }, [connected, phase]);

  const btnTextStyle = useMemo(() => {
    if (!connected) return { color: "#fff" };
    if (phase === "IN_GAME") return { color: "#fff" };
    return { color: "#081022" };
  }, [connected, phase]);

  return (
    <View style={s.deviceStrip}>
      <View style={{ flex: 1 }}>
        <Text style={s.deviceLabel}>Device</Text>

        {loading ? (
          <View style={s.deviceRow}>
            <ActivityIndicator />
            <Text style={s.deviceText}>Checking…</Text>
          </View>
        ) : (
          <View style={s.deviceRow}>
            <View style={dotStyle} />
            <Text style={s.deviceText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </View>

      <Pressable style={[s.deviceBtn, btnStyle]} onPress={onActionPress}>
        <Text style={[s.deviceBtnText, btnTextStyle]}>{btnText}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  deviceStrip: {
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceLabel: { color: "rgba(255,255,255,0.60)", fontWeight: "800" },
  deviceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  deviceText: { color: "#fff", fontWeight: "900", flex: 1 },

  dotGood: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#41D79A" },
  dotReady: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#7AA2FF" }, // preset loaded
  dotWarn: { width: 10, height: 10, borderRadius: 999, backgroundColor: "#FFB020" }, // in game
  dotDim: { width: 10, height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)" },

  deviceBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
  deviceBtnPrimary: { backgroundColor: "#7AA2FF", borderColor: "rgba(122,162,255,0.50)" },
  deviceBtnGhost: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" },
  deviceBtnText: { fontWeight: "900" },
});
