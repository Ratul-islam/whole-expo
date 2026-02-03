import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";

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

function phaseHint(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return "Scan device to connect.";
  if (phase === "CONNECTED") return "Load a route to start.";
  if (phase === "PRESET_LOADED") return "Hit Start on the board.";
  if (phase === "IN_GAME") return "Live score updating...";
  if (phase === "COMPLETED") return "Run ended. Pick a new route.";
  if (phase === "ABANDONED") return "Run abandoned. Reconnect & try again.";
  return "";
}

function primaryCtaText(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return "SCAN DEVICE";
  if (phase === "CONNECTED") return "LOAD ROUTE";
  if (phase === "PRESET_LOADED") return "LOAD ROUTE";
  if (phase === "IN_GAME") return "VIEW ROUTES";
  if (phase === "COMPLETED") return "PLAY AGAIN";
  if (phase === "ABANDONED") return "RECONNECT";
  return "CONTINUE";
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

export function HudPanel(props: {
  phase: DevicePhase;
  connected: boolean;
  wsOnline: boolean;

  totalScore: number;
  liveScore: number | "—";
  lastPlayedText: string;

  liveCorrect: number;
  liveWrong: number;

  onPrimary: () => void;
  onRoutes: () => void;
  onLeaderboard: () => void;
  onScan: () => void;
}) {
  const {
    phase,
    connected,
    wsOnline,
    totalScore,
    liveScore,
    lastPlayedText,
    liveCorrect,
    liveWrong,
    onPrimary,
    onRoutes,
    onLeaderboard,
    onScan,
  } = props;

  // ✅ always derived from latest props (no caching)
  const hudTitle = useMemo(() => phaseLabel(phase), [phase]);
  const hudHint = useMemo(() => phaseHint(phase), [phase]);
  const ctaText = useMemo(() => primaryCtaText(phase), [phase]);

  const [accent, glow] = useMemo(() => phaseAccent(phase), [phase]);

  // ✅ tiny pulsing glow just for game vibe; re-renders safe
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

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  // ✅ Debug render proof (remove anytime)
  useEffect(() => {
    console.log("[HudPanel] props update", { phase, wsOnline, connected, liveScore, liveCorrect, liveWrong });
  }, [phase, wsOnline, connected, liveScore, liveCorrect, liveWrong]);

  return (
    <View style={ui.hud}>
      <View style={ui.hudTop}>
        <View>
          <Text style={ui.hudTitle}>{hudTitle}</Text>
          <Text style={ui.hudHint}>{hudHint}</Text>
        </View>

        <View style={ui.livePill}>
          <View style={[ui.dot, { backgroundColor: wsOnline && connected ? "#41D79A" : "#FF5C7A" }]} />
          <Text style={ui.livePillText}>{wsOnline && connected ? "LIVE" : "NO SIGNAL"}</Text>
        </View>
      </View>

      <View style={ui.scoreRow}>
        <View style={ui.scoreCard}>
          <Text style={ui.scoreLabel}>TOTAL</Text>
          <Text style={ui.scoreValue}>{totalScore}</Text>
        </View>

        <View style={ui.scoreCard}>
          <Text style={ui.scoreLabel}>LIVE</Text>
          <Text style={ui.scoreValue}>{liveScore}</Text>
        </View>

        <View style={ui.scoreCard}>
          <Text style={ui.scoreLabel}>LAST</Text>
          <Text style={ui.scoreValueSmall}>{lastPlayedText || "—"}</Text>
        </View>
      </View>

      {phase === "IN_GAME" ? (
        <View style={ui.miniStats}>
          <View style={ui.miniStat}>
            <Text style={ui.miniStatKey}>CORRECT</Text>
            <Text style={ui.miniStatVal}>{liveCorrect}</Text>
          </View>
          <View style={ui.miniStat}>
            <Text style={ui.miniStatKey}>WRONG</Text>
            <Text style={ui.miniStatVal}>{liveWrong}</Text>
          </View>
          <View style={ui.miniStat}>
            <Text style={ui.miniStatKey}>MODE</Text>
            <Text style={ui.miniStatVal}>LIVE</Text>
          </View>
        </View>
      ) : null}

      <Pressable onPress={onPrimary} style={[ui.cta, { borderColor: `${accent}88` }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            ui.ctaGlow,
            {
              backgroundColor: glow,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Text style={ui.ctaText}>{ctaText}</Text>
        <Text style={ui.ctaSubText}>{connected ? "Tap to continue" : "Tap to scan QR"}</Text>
      </Pressable>

      <View style={ui.quickRow}>
        <Pressable onPress={onRoutes} style={ui.quickBtn}>
          <Text style={ui.quickText}>MY ROUTES</Text>
        </Pressable>
        <Pressable onPress={onLeaderboard} style={ui.quickBtn}>
          <Text style={ui.quickText}>LEADERBOARD</Text>
        </Pressable>
        <Pressable onPress={onScan} style={ui.quickBtnAlt}>
          <Text style={ui.quickText}>SCAN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ui = StyleSheet.create({
  hud: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
  },
  hudTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hudTitle: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 0.8 },
  hudHint: { color: "rgba(255,255,255,0.70)", fontWeight: "800", marginTop: 4 },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  livePillText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.2, fontSize: 12 },
  dot: { width: 10, height: 10, borderRadius: 999 },

  scoreRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  scoreCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  scoreLabel: { color: "rgba(255,255,255,0.60)", fontWeight: "900", letterSpacing: 1.1, fontSize: 12 },
  scoreValue: { color: "#fff", fontWeight: "900", fontSize: 22, marginTop: 6 },
  scoreValueSmall: { color: "#fff", fontWeight: "900", fontSize: 13, marginTop: 10 },

  miniStats: { marginTop: 10, flexDirection: "row", gap: 10 },
  miniStat: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  miniStatKey: { color: "rgba(255,255,255,0.65)", fontWeight: "900", letterSpacing: 0.9, fontSize: 11 },
  miniStatVal: { color: "#fff", fontWeight: "900", fontSize: 16 },

  cta: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    backgroundColor: "#070B18",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    width: 520,
    height: 260,
    borderRadius: 999,
    top: -140,
  },
  ctaText: { color: "#EAF0FF", fontWeight: "900", fontSize: 16, letterSpacing: 1.1 },
  ctaSubText: { color: "rgba(255,255,255,0.65)", fontWeight: "800", marginTop: 6 },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  quickBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  quickBtnAlt: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(122,162,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.35)",
    alignItems: "center",
  },
  quickText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.9, fontSize: 12 },
});
