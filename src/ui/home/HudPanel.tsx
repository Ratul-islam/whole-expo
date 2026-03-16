import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { DevicePhase, phaseLabel } from "./StatusOrb";

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

  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTabletLike = width >= 768;

  const sizes = useMemo(
    () => ({
      panelRadius: isTabletLike ? 24 : 20,
      panelPadding: isTabletLike ? 18 : isSmallPhone ? 12 : 14,
      titleSize: isTabletLike ? 20 : 18,
      hintSize: isTabletLike ? 14 : 13,
      scoreValueSize: isTabletLike ? 26 : isSmallPhone ? 20 : 22,
      scoreSmallSize: isTabletLike ? 14 : 12.5,
      ctaTextSize: isTabletLike ? 17 : 15.5,
      ctaSubTextSize: isTabletLike ? 13 : 12.5,
      quickTextSize: isTabletLike ? 13 : 12,
      pillTextSize: isTabletLike ? 12.5 : 11.5,
      gap: isTabletLike ? 12 : 10,
    }),
    [isSmallPhone, isTabletLike]
  );

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
    <View
      style={[
        styles.hud,
        {
          borderRadius: sizes.panelRadius,
          padding: sizes.panelPadding,
        },
      ]}
    >
      <View style={styles.hudTop}>
        <View style={styles.titleWrap}>
          <Text style={[styles.hudTitle, { fontSize: sizes.titleSize }]} numberOfLines={1}>
            {hudTitle}
          </Text>
          <Text style={[styles.hudHint, { fontSize: sizes.hintSize }]}>{hudHint}</Text>
        </View>

        <View style={styles.liveWrap}>
          <View style={styles.livePill}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isLive ? "#22A06B" : "#E15572" },
              ]}
            />
            <Text style={[styles.livePillText, { fontSize: sizes.pillTextSize }]}>
              {signalText}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.scoreRow, { gap: sizes.gap }]}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>TOTAL</Text>
          <Text style={[styles.scoreValue, { fontSize: sizes.scoreValueSize }]}>
            {totalScore}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>LIVE</Text>
          <Text style={[styles.scoreValue, { fontSize: sizes.scoreValueSize }]}>
            {liveScore}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>LAST</Text>
          <Text style={[styles.scoreValueSmall, { fontSize: sizes.scoreSmallSize }]}>
            {lastPlayedText || "—"}
          </Text>
        </View>
      </View>

      {phase === "IN_GAME" ? (
        <View style={[styles.miniStats, { gap: sizes.gap }]}>
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
        <Text style={[styles.ctaText, { fontSize: sizes.ctaTextSize }]}>{ctaText}</Text>
        <Text style={[styles.ctaSubText, { fontSize: sizes.ctaSubTextSize }]}>
          {ctaSubText}
        </Text>
      </Pressable>

      <View style={[styles.quickRow, { gap: sizes.gap }]}>
        <Pressable onPress={onRoutes} style={styles.quickBtn}>
          <Text style={[styles.quickText, { fontSize: sizes.quickTextSize }]}>MY ROUTES</Text>
        </Pressable>

        <Pressable onPress={onLeaderboard} style={styles.quickBtn}>
          <Text style={[styles.quickText, { fontSize: sizes.quickTextSize }]}>
            LEADERBOARD
          </Text>
        </Pressable>

        <Pressable onPress={onScan} style={styles.quickBtnAlt}>
          <Text style={[styles.quickTextDark, { fontSize: sizes.quickTextSize }]}>SCAN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    marginTop: 14,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    overflow: "hidden",
  },

  hudTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  titleWrap: {
    flex: 1,
    paddingRight: 8,
  },

  hudTitle: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  hudHint: {
    color: "#6B6B6B",
    fontWeight: "500",
    marginTop: 4,
    lineHeight: 18,
  },

  liveWrap: {
    justifyContent: "flex-start",
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  livePillText: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  scoreRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  scoreCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    justifyContent: "space-between",
  },

  scoreLabel: {
    color: "#7A7A7A",
    fontWeight: "700",
    letterSpacing: 0.9,
    fontSize: 11,
  },

  scoreValue: {
    color: "#111111",
    fontWeight: "700",
    marginTop: 6,
  },

  scoreValueSmall: {
    color: "#111111",
    fontWeight: "600",
    marginTop: 10,
  },

  miniStats: {
    marginTop: 10,
    flexDirection: "row",
  },

  miniStat: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  miniStatKey: {
    color: "#7A7A7A",
    fontWeight: "700",
    letterSpacing: 0.7,
    fontSize: 11,
  },

  miniStatVal: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 16,
  },

  cta: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  ctaGlow: {
    position: "absolute",
    width: 420,
    height: 220,
    borderRadius: 999,
    top: -120,
  },

  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  ctaSubText: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },

  quickRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  quickBtn: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  quickBtnAlt: {
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  quickText: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  quickTextDark: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});