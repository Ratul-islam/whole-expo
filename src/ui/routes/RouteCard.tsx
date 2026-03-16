import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
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
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const canUpload = !!(device?.deviceId && device?.deviceSecret);

  const ui = {
    radius: isTablet ? 20 : 18,
    padding: isTablet ? 14 : isSmallPhone ? 11 : 12,
    titleSize: isTablet ? 16 : 15,
    labelSize: isTablet ? 10.5 : 10,
    valueSize: isTablet ? 12.5 : 12,
    actionTitle: isTablet ? 13 : 12,
    actionSub: isTablet ? 11.5 : 11,
  };

  return (
    <Pressable onPress={onPress} style={styles.press}>
      <View style={[styles.frameOuter, { borderRadius: ui.radius }]}>
        <LinearGradient
          colors={["rgba(17,17,17,0.04)", "rgba(17,17,17,0.02)", "rgba(255,255,255,0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frameGradient}
        />

        <View
          style={[
            styles.frameInner,
            {
              borderRadius: ui.radius,
              padding: ui.padding,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.grid} />
          <View pointerEvents="none" style={styles.scan} />

          <View style={styles.topRow}>
            <View style={styles.titleWrap}>
              <Text
                style={[styles.title, { fontSize: ui.titleSize }]}
                numberOfLines={1}
              >
                {String(item.title || "UNTITLED")}
              </Text>

              <View style={styles.metaRow}>
                <Pill
                  label="Steps"
                  value={String(item.steps)}
                  labelSize={ui.labelSize}
                  valueSize={ui.valueSize}
                />

                {!!item.createdAt && (
                  <PillSoft
                    text={timeTiny(item.createdAt)}
                    labelSize={ui.labelSize}
                  />
                )}

                <StatusPill on={canUpload} labelSize={ui.labelSize} />
              </View>
            </View>

            <Pressable onPress={onDelete} style={styles.dangerBtn} hitSlop={8}>
              <Text style={styles.dangerBtnText}>
                {tab === "CREATED" ? "DELETE" : "REMOVE"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <LinearGradient
            colors={
              canUpload
                ? ["rgba(17,17,17,0.06)", "rgba(17,17,17,0.03)"]
                : ["rgba(0,0,0,0.02)", "rgba(0,0,0,0.01)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionStrip}
          >
            <View style={styles.actionLeft}>
              <Text style={[styles.actionTitle, { fontSize: ui.actionTitle }]}>
                OPEN
              </Text>
              <Text style={[styles.actionSub, { fontSize: ui.actionSub }]} numberOfLines={1}>
                {canUpload ? "Preview • Upload available" : "Preview"}
              </Text>
            </View>

            <View style={styles.actionRight}>
              <View style={styles.chevBox}>
                <Text style={styles.chev}>›</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Pressable>
  );
}

function Pill({
  label,
  value,
  labelSize,
  valueSize,
}: {
  label: string;
  value: string;
  labelSize: number;
  valueSize: number;
}) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillLabel, { fontSize: labelSize }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.pillValue, { fontSize: valueSize }]}>{value}</Text>
    </View>
  );
}

function PillSoft({
  text,
  labelSize,
}: {
  text: string;
  labelSize: number;
}) {
  return (
    <View style={styles.pillSoft}>
      <Text style={[styles.pillSoftText, { fontSize: labelSize }]}>
        {String(text).toUpperCase()}
      </Text>
    </View>
  );
}

function StatusPill({
  on,
  labelSize,
}: {
  on: boolean;
  labelSize: number;
}) {
  return (
    <View style={[styles.status, on ? styles.statusOn : styles.statusOff]}>
      <View style={[styles.dot, on ? styles.dotOn : styles.dotOff]} />
      <Text style={[styles.statusText, { fontSize: labelSize }]}>
        {on ? "DEVICE" : "OFFLINE"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  press: {
    marginTop: 12,
  },

  frameOuter: {
    overflow: "hidden",
  },

  frameGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  frameInner: {
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    backgroundColor: "transparent",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(17,17,17,0.04)",
  },

  scan: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(17,17,17,0.05)",
    transform: [{ rotate: "-10deg" }],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  titleWrap: {
    flex: 1,
  },

  title: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.2,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  pillLabel: {
    color: "#7A7A7A",
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  pillValue: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  pillSoft: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  pillSoftText: {
    color: "#6B6B6B",
    fontWeight: "700",
    letterSpacing: 0.7,
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
    backgroundColor: "rgba(34,160,107,0.10)",
    borderColor: "rgba(34,160,107,0.25)",
  },

  statusOff: {
    backgroundColor: "#EFEFEF",
    borderColor: "#D9D9D9",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dotOn: {
    backgroundColor: "#22A06B",
  },

  dotOff: {
    backgroundColor: "#A0A0A0",
  },

  statusText: {
    color: "#444444",
    fontWeight: "700",
    letterSpacing: 0.7,
  },

  dangerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(225,85,114,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.25)",
  },

  dangerBtnText: {
    color: "#C44760",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  divider: {
    marginTop: 12,
    height: 1,
    backgroundColor: "#E3E3E3",
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
    backgroundColor: "#FFFFFF",
  },

  actionTitle: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 1,
  },

  actionSub: {
    marginTop: 4,
    color: "#6B6B6B",
    fontWeight: "500",
    letterSpacing: 0.2,
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
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  chev: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "700",
    marginTop: -2,
  },
});