import { useResponsiveScale } from "@/hooks/useResponsiveScale";
import { DevicePhase, phaseLabel } from "./HudPanel";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet,Text,View ,Animated,Easing} from "react-native";

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

export function StatusOrb(props: {
  phase: DevicePhase;
  deviceId?: string;
  wsOnline: boolean;
  session: any;
}) {
  const { phase, deviceId, wsOnline, session } = props;

  const scaleHook = useResponsiveScale();
  const styles = useMemo(() => getOrbStyles(scaleHook), [scaleHook]);

  const sizes = useMemo(
    () => ({
      outer: scaleHook(210),
      core: scaleHook(172),
      glow: scaleHook(260),
    }),
    [scaleHook]
  );

  const [main, glow] = useMemo(() => phaseAccent(phase), [phase]);

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

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, phase === "IN_GAME" ? 1.08 : 1.04],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.45],
  });

  return (
    <View style={styles.orbWrap}>
      <View
        style={[
          styles.orbOuter,
          {
            width: sizes.outer,
            height: sizes.outer,
            borderColor: main,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.orbGlow,
            {
              width: sizes.glow,
              height: sizes.glow,
              backgroundColor: glow,
              transform: [{ scale }],
              opacity,
            },
          ]}
        />

        <View
          style={[
            styles.orbCore,
            {
              width: sizes.core,
              height: sizes.core,
              borderColor: main,
            },
          ]}
        >
          <Text style={styles.orbTitle}>
            {phaseLabel(phase)}
          </Text>

          <Text style={styles.orbSub} numberOfLines={1}>
            {phase === "DISCONNECTED"
              ? "No device"
              : `Device ${deviceId || "—"}`}
          </Text>

          <View style={styles.orbMetaRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: wsOnline ? "#22A06B" : "#E15572" },
              ]}
            />
            <Text style={styles.orbMeta}>
              {wsOnline ? "LIVE" : "OFFLINE"}
            </Text>
          </View>

          {session?.control && (
            <View style={styles.orbMetaRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: session?.control === "online" ? "#22A06B" : "#E15572",
                  },
                ]}
              />
              <Text style={styles.orbMeta}>
                {session?.control === "online" ? "App Mode" : "Manual Mode"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}




// --- ORB STYLES ---
const getOrbStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    orbWrap: { marginTop: s(16), alignItems: "center" },
    orbOuter: {
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    orbGlow: { position: "absolute", borderRadius: 999 },
    orbCore: {
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: "#F7F7F7",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: s(14),
    },
    orbTitle: { color: "#111111", fontWeight: "700", letterSpacing: 1, fontSize: s(13) },
    orbSub: { color: "#6B6B6B", fontWeight: "500", marginTop: s(8), fontSize: s(11) },
    orbMetaRow: { flexDirection: "row", alignItems: "center", gap: s(8), marginTop: s(10) },
    orbMeta: { color: "#444444", fontWeight: "600", letterSpacing: 0.8, fontSize: s(10) },
    dot: { width: s(10), height: s(10), borderRadius: 999 },
  });
