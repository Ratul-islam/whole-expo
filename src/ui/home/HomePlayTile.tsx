import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export type DevicePhase =
  | "DISCONNECTED"
  | "CONNECTED"
  | "PRESET_LOADED"
  | "IN_GAME"
  | "COMPLETED"
  | "ABANDONED";

type Props = {
  connected: boolean;
  phase?: DevicePhase; // ✅ NEW
  totalScore: number;
  onPrimaryPress: () => void;
};

export function HomePlayTile({ connected, phase = "DISCONNECTED", totalScore, onPrimaryPress }: Props) {
  const title = useMemo(() => {
    if (!connected) return "Scan & connect";
    if (phase === "CONNECTED") return "Load a route";
    if (phase === "PRESET_LOADED") return "Ready to play";
    if (phase === "IN_GAME") return "Game in progress";
    if (phase === "COMPLETED") return "Play again";
    if (phase === "ABANDONED") return "Reconnect & play";
    return "Load a route";
  }, [connected, phase]);

  const subtitle = useMemo(() => {
    if (!connected) return "Scan the QR on the device to connect securely.";
    if (phase === "CONNECTED") return "Pick a route and send it to the board.";
    if (phase === "PRESET_LOADED") return "Preset is loaded. Start when you're ready.";
    if (phase === "IN_GAME") return "The board is running a session right now.";
    if (phase === "COMPLETED") return "Last session completed. Load a route to start again.";
    if (phase === "ABANDONED") return "Last session timed out. Load a route to start again.";
    return "Pick a route and start the session on the board.";
  }, [connected, phase]);

  return (
    <Pressable style={s.playTile} onPress={onPrimaryPress}>
      <View style={s.playGlow} />
      <Text style={s.playTitle}>{title}</Text>
      <Text style={s.playSub}>{subtitle}</Text>

      <View style={s.playFooter}>
        <View style={s.playPill}>
          <Text style={s.playPillLabel}>Total score</Text>
          <Text style={s.playPillValue}>{totalScore}</Text>
        </View>
        <Text style={s.playArrow}>→</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  playTile: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#070B18",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  playGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 999,
    top: -260,
    right: -220,
    backgroundColor: "rgba(122,162,255,0.22)",
  },
  playTitle: { color: "#fff", fontWeight: "900", fontSize: 20 },
  playSub: { color: "rgba(255,255,255,0.70)", fontWeight: "700", marginTop: 8, lineHeight: 19 },
  playFooter: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  playPillLabel: { color: "rgba(255,255,255,0.55)", fontWeight: "800", fontSize: 12 },
  playPillValue: { color: "#fff", fontWeight: "900", fontSize: 16, marginTop: 4 },
  playArrow: { color: "#fff", fontWeight: "900", fontSize: 22 },
});
