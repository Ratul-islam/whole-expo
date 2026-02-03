import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ConnectedDevice, RouteCardModel, Tab } from "./types";
import { timeTiny } from "./helpers";

export function RouteCard(props: {
  item: RouteCardModel;
  tab: Tab;
  device: ConnectedDevice;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { item, tab, device, onPress, onDelete } = props;
  const canUpload = !!(device?.deviceId && device?.deviceSecret);

  return (
    <Pressable onPress={onPress} style={s.press}>
      {/* frame */}
      <View style={s.frameOuter}>
        <LinearGradient
          colors={["rgba(0,255,209,0.22)", "rgba(139,92,246,0.18)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.frameGradient}
        />
        <View style={s.frameInner}>
          {/* subtle HUD overlays */}
          <View pointerEvents="none" style={s.grid} />
          <View pointerEvents="none" style={s.scan} />

          {/* top row */}
          <View style={s.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.title} numberOfLines={1}>
                {String(item.title || "UNTITLED").toUpperCase()}
              </Text>

              <View style={s.metaRow}>
                <Pill label="STEPS" value={String(item.steps)} />
                {!!item.createdAt && <PillSoft text={timeTiny(item.createdAt)} />}
                <StatusPill on={canUpload} />
              </View>
            </View>

            <Pressable onPress={onDelete} style={s.dangerBtn} hitSlop={8}>
              <Text style={s.dangerBtnText}>{tab === "CREATED" ? "DELETE" : "REMOVE"}</Text>
            </Pressable>
          </View>

          {/* divider */}
          <View style={s.divider} />

          {/* action strip */}
          <LinearGradient
            colors={
              canUpload
                ? ["rgba(0,255,209,0.30)", "rgba(139,92,246,0.24)"]
                : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.04)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.actionStrip}
          >
            <View style={s.actionLeft}>
              <Text style={s.actionTitle}>OPEN</Text>
              <Text style={s.actionSub} numberOfLines={1}>
                {canUpload ? "Preview • Upload available" : "Preview"}
              </Text>
            </View>

            <View style={s.actionRight}>
              <View style={s.chevBox}>
                <Text style={s.chev}>&gt;</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillLabel}>{label}</Text>
      <Text style={s.pillValue}>{value}</Text>
    </View>
  );
}

function PillSoft({ text }: { text: string }) {
  return (
    <View style={s.pillSoft}>
      <Text style={s.pillSoftText}>{String(text).toUpperCase()}</Text>
    </View>
  );
}

function StatusPill({ on }: { on: boolean }) {
  return (
    <View style={[s.status, on ? s.statusOn : s.statusOff]}>
      <View style={[s.dot, on ? s.dotOn : s.dotOff]} />
      <Text style={s.statusText}>{on ? "DEVICE" : "OFFLINE"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  press: {
    marginTop: 12,
  },

  frameOuter: {
    borderRadius: 18,
    overflow: "hidden",
  },
  frameGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  frameInner: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(8, 10, 16, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  // overlays
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    backgroundColor: "transparent",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.10)",
  },
  scan: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "-10deg" }],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  title: {
    color: "#EAF0FF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  pillValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  pillSoft: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  pillSoftText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusOn: {
    backgroundColor: "rgba(0,255,209,0.10)",
    borderColor: "rgba(0,255,209,0.28)",
  },
  statusOff: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOn: { backgroundColor: "rgba(0,255,209,0.95)" },
  dotOff: { backgroundColor: "rgba(255,255,255,0.35)" },
  statusText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  dangerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.30)",
  },
  dangerBtnText: {
    color: "rgba(255,225,225,0.95)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  divider: {
    marginTop: 12,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  actionStrip: {
    marginTop: 12,
    borderRadius: 16,
    padding: 1,
  },
  actionLeft: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  actionTitle: {
    color: "#EAF0FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  actionSub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  actionRight: {
    position: "absolute",
    right: 10,
    top: 10,
    bottom: 10,
    justifyContent: "center",
  },
  chevBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chev: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: -1,
  },
});
