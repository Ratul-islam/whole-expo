import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export type DevicePhase =
  | "DISCONNECTED"
  | "CONNECTED"
  | "PRESET_LOADED"
  | "PAUSED"
  | "IN_GAME"
  | "COMPLETED"
  | "ABANDONED";

function primaryCtaText(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return "SCAN DEVICE";
  if (phase === "CONNECTED") return "LOAD ROUTE";
  if (phase === "PAUSED") return "RESUME";
  if (phase === "PRESET_LOADED") return "TAP TO START";
  if (phase === "IN_GAME") return "TAP TO PAUSE";
  if (phase === "COMPLETED") return "PLAY AGAIN";
  if (phase === "ABANDONED") return "RECONNECT";
  return "CONTINUE";
}

export const phaseLabel = (phase: DevicePhase) => {
  if (phase === "DISCONNECTED") return "DISCONNECTED";
  if (phase === "PAUSED") return "PAUSED";
  if (phase === "CONNECTED") return "CONNECTED";
  if (phase === "PRESET_LOADED") return "LOADED";
  if (phase === "IN_GAME") return "IN GAME";
  if (phase === "COMPLETED") return "COMPLETED";
  if (phase === "ABANDONED") return "TIMED OUT";
  return "CONNECTED";
};

function phaseHint(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return "Scan device to connect.";
  if (phase === "CONNECTED") return "Load a route to start.";
  if (phase === "PAUSED") return "Game is paused.";
  if (phase === "PRESET_LOADED") return "Hit Start on the board.";
  if (phase === "IN_GAME") return "Live score updating...";
  if (phase === "COMPLETED") return "Run ended. Pick a new route.";
  if (phase === "ABANDONED") return "Run abandoned. Reconnect and try again.";
  return "";
}

function phaseAccent(phase: DevicePhase) {
  if (phase === "DISCONNECTED") return ["#8A8A8A", "rgba(138,138,138,0.16)"] as const;
  if (phase === "CONNECTED") return ["#5B8DEF", "rgba(91,141,239,0.14)"] as const;
  if (phase === "PAUSED") return ["#7E8695", "rgba(126,134,149,0.14)"] as const;
  if (phase === "PRESET_LOADED") return ["#91B508", "rgba(145,181,8,0.14)"] as const;
  if (phase === "IN_GAME") return ["#E4A11B", "rgba(228,161,27,0.14)"] as const;
  if (phase === "COMPLETED") return ["#9B72E8", "rgba(155,114,232,0.14)"] as const;
  if (phase === "ABANDONED") return ["#E15572", "rgba(225,85,114,0.14)"] as const;
  return ["#5B8DEF", "rgba(91,141,239,0.14)"] as const;
}

export function HudPanel(props: {
  phase: DevicePhase;
  connected: boolean;
  wsOnline: boolean;
  control?: string;
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
    control,
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

  const scaleHook = useResponsiveScale();
  const styles = useMemo(() => getHudStyles(scaleHook), [scaleHook]);

  const hudTitle = useMemo(() => phaseLabel(phase), [phase]);
  const hudHint = useMemo(() => phaseHint(phase), [phase]);
  const ctaText = useMemo(() => primaryCtaText(phase), [phase]);
  const [accent, glow] = useMemo(() => phaseAccent(phase), [phase]);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, phase]);

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.45],
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const isLive = wsOnline && connected;
  const signalText = isLive ? "LIVE" : "NO SIGNAL";
  const ctaSubText = connected
    ? control === "offline"
      ? "Load route from device manually"
      : "Tap to continue"
    : "Tap to scan QR";

  return (
    <View style={styles.hud}>
      <View style={styles.hudTop}>
        <View style={styles.titleWrap}>
          <Text style={styles.hudTitle} numberOfLines={1}>
            {hudTitle}
          </Text>
          <Text style={styles.hudHint}>{hudHint}</Text>
        </View>

        <View style={styles.liveWrap}>
          <View style={styles.livePill}>
            <View
              style={[
                styles.liveDot,
                { backgroundColor: isLive ? "#22A06B" : "#E15572" },
              ]}
            />
            <Text style={styles.livePillText}>
              {signalText}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>TOTAL</Text>
          <Text style={styles.scoreValue}>
            {totalScore}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>LIVE</Text>
          <Text style={styles.scoreValue}>
            {liveScore}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>LAST</Text>
          <Text style={styles.scoreValueSmall}>
            {lastPlayedText || "—"}
          </Text>
        </View>
      </View>

      {phase === "IN_GAME" ? (
        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatKey}>CORRECT</Text>
            <Text style={styles.miniStatVal}>{liveCorrect}</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatKey}>WRONG</Text>
            <Text style={styles.miniStatVal}>{liveWrong}</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatKey}>MODE</Text>
            <Text style={styles.miniStatVal}>LIVE</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={onPrimary}
        style={[
          styles.cta,
          {
            borderColor: accent,
            backgroundColor: "#111111",
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ctaGlow,
            {
              backgroundColor: glow,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Text style={styles.ctaText}>{ctaText}</Text>
        <Text style={styles.ctaSubText}>
          {ctaSubText}
        </Text>
      </Pressable>

      <View style={styles.quickRow}>
        <Pressable onPress={onRoutes} style={styles.quickBtn}>
          <Text style={styles.quickText}>MY ROUTES</Text>
        </Pressable>

        <Pressable onPress={onLeaderboard} style={styles.quickBtn}>
          <Text style={styles.quickText}>LEADERBOARD</Text>
        </Pressable>

        {/* Dynamic 3rd Button: Hide if disconnected, show "END GAME" if connected */}
        {connected ? (
           <Pressable onPress={onScan} style={styles.quickBtnDanger}>
             <Text style={styles.quickTextDanger}>END GAME</Text>
           </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const getHudStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    hud: {
      marginTop: s(14),
      backgroundColor: "#F7F7F7",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      borderRadius: s(20),
      padding: s(14),
      overflow: "hidden",
    },
    hudTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: s(10) },
    titleWrap: { flex: 1, paddingRight: s(8) },
    hudTitle: { color: "#111111", fontWeight: "700", letterSpacing: -0.2, fontSize: s(12) },
    hudHint: { color: "#6B6B6B", fontWeight: "500", marginTop: s(4), lineHeight: s(18), fontSize: s(10) },
    liveWrap: { justifyContent: "flex-start" },
    livePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(8),
      paddingVertical: s(8),
      paddingHorizontal: s(12),
      borderRadius: 999,
      backgroundColor: "#EFEFEF",
      borderWidth: 1,
      borderColor: "#D9D9D9",
    },
    livePillText: { color: "#111111", fontWeight: "700", letterSpacing: 0.8, fontSize: s(8) },
    liveDot: { width: s(10), height: s(10), borderRadius: 999 },
    
    scoreRow: { flexDirection: "row", marginTop: s(12), gap: s(10) },
    scoreCard: {
      flex: 1,
      minHeight: s(86),
      borderRadius: s(16),
      padding: s(12),
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E3E3E3",
      justifyContent: "space-between",
    },
    scoreLabel: { color: "#7A7A7A", fontWeight: "700", letterSpacing: 0.9, fontSize: s(10) },
    scoreValue: { color: "#111111", fontWeight: "700", marginTop: s(6), fontSize: s(14) },
    scoreValueSmall: { color: "#111111", fontWeight: "600", marginTop: s(10), fontSize: s(11) },

    miniStats: { marginTop: s(10), flexDirection: "row", gap: s(10) },
    miniStat: {
      flex: 1,
      borderRadius: s(14),
      paddingVertical: s(10),
      paddingHorizontal: s(12),
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E3E3E3",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    miniStatKey: { color: "#7A7A7A", fontWeight: "700", letterSpacing: 0.7, fontSize: s(11) },
    miniStatVal: { color: "#111111", fontWeight: "700", fontSize: s(12) },

    cta: {
      marginTop: s(12),
      borderRadius: s(18),
      paddingVertical: s(15),
      paddingHorizontal: s(14),
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    ctaGlow: { position: "absolute", width: s(420), height: s(220), borderRadius: 999, top: s(-120) },
    ctaText: { color: "#FFFFFF", fontWeight: "700", letterSpacing: 0.8, fontSize: s(12) },
    ctaSubText: { color: "rgba(255,255,255,0.72)", fontWeight: "500", marginTop: s(6), textAlign: "center", fontSize: s(10) },

    quickRow: { flexDirection: "row", marginTop: s(10), gap: s(10) },
    quickBtn: {
      flex: 1,
      minHeight: s(46),
      paddingVertical: s(12),
      paddingHorizontal: s(10),
      borderRadius: s(14),
      backgroundColor: "#EDEDED",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      alignItems: "center",
      justifyContent: "center",
    },

    // New Danger Button Styles
    quickBtnDanger: {
      flex: 1,
      minHeight: s(46),
      paddingVertical: s(12),
      paddingHorizontal: s(10),
      borderRadius: s(14),
      backgroundColor: "rgba(225,85,114,0.08)",
      borderWidth: 1,
      borderColor: "rgba(225,85,114,0.28)",
      alignItems: "center",
      justifyContent: "center",
    },
    
    quickText: { color: "#111111", fontWeight: "700", letterSpacing: 0.5, fontSize: s(10) },
    
    // Red text to match the End Game theme
    quickTextDanger: { color: "#C44760", fontWeight: "700", letterSpacing: 0.5, fontSize: s(10) },
  });