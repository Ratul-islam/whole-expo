import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export type GameDetails = {
  _id?: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sessionId?: string;
  status?: string;
  score?: number;
  correct?: number;
  wrong?: number;
  time?: number;
  deviceId?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  deviceSecret?: string;
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeNum(n: any) {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export function GameDetailsModal({
  visible,
  game,
  onClose,
  onScanAgainLabel = "CLOSE",
  showDeviceSecret = false,
}: {
  visible: boolean;
  game: GameDetails | null;
  onClose: () => void;
  onScanAgainLabel?: string;
  showDeviceSecret?: boolean;
}) {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const sizes = useMemo(
    () => ({
      panelPadding: isTablet ? 20 : 16,
      statSize: isTablet ? 24 : 20,
      statSmall: isTablet ? 14 : 12,
      title: isTablet ? 18 : 16,
    }),
    [isSmallPhone, isTablet]
  );


  console.log(game)
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0.92);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const score = safeNum(game?.score);
  const correct = safeNum(game?.correct);
  const wrong = safeNum(game?.wrong);
  const time = safeNum(game?.time);

  const accuracy = useMemo(() => {
    const total = correct + wrong;
    if (!total) return "—";
    return `${Math.round((correct / total) * 100)}%`;
  }, [correct, wrong]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={s.backdrop} onPress={close}>
        <Animated.View
          style={[
            s.modal,
            { opacity, transform: [{ scale }] },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[s.panel, { padding: sizes.panelPadding }]}>
              {/* Header */}
              <View style={s.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { fontSize: sizes.title }]}>
                    Game Details
                  </Text>

                  <Text style={s.sub} numberOfLines={1}>
                    {game?.userId?.firstName
                      ? `${game.userId.firstName + " " + game.userId.lastName }`
                      : ""}
                  </Text>
                </View>

                <Pressable onPress={close} style={s.xBtn}>
                  <Text style={s.xText}>×</Text>
                </Pressable>
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                <Stat label="TIME" value={time} size={sizes.statSize} />
                <Stat label="SCORE" value={score} size={sizes.statSize} />
                <Stat label="ACCURACY" value={accuracy} size={sizes.statSize} />
                <Stat
                  label="STATUS"
                  value={String(game?.status ?? "—").toUpperCase()}
                  size={sizes.statSmall}
                  small
                />
              </View>

              {/* Breakdown */}
              <View style={s.breakRow}>
                <Stat label="CORRECT" value={correct} />
                <Stat label="WRONG" value={wrong} />
                <Stat label="DEVICE" value={game?.deviceId ?? "—"} small />
              </View>

              {/* Table */}
              <View style={s.table}>
                <Row label="Started" value={fmtTime(game?.startedAt)} />
                <Row label="Ended" value={fmtTime(game?.endedAt)} />
                <Row label="Created" value={fmtTime(game?.createdAt)} />
                <Row label="Updated" value={fmtTime(game?.updatedAt)} />

                {showDeviceSecret && (
                  <Row label="Device Secret" value={game?.deviceSecret ?? "—"} />
                )}

                <Row label="Game ID" value={game?._id ?? "—"} mono />
              </View>

              <Pressable onPress={close} style={s.primaryBtn}>
                <Text style={s.primaryText}>{onScanAgainLabel}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Stat({
  label,
  value,
  size = 18,
  small = false,
}: any) {
  return (
    <View style={s.statCard}>
      <Text style={s.statKey}>{label}</Text>
      <Text
        style={[
          s.statVal,
          { fontSize: size },
          small && s.statSmall,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Row({ label, value, mono }: any) {
  return (
    <View style={s.row}>
      <Text style={s.rowKey}>{label}</Text>
      <Text style={[s.rowVal, mono && s.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },

  modal: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  panel: {},

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  title: {
    color: "#111",
    fontWeight: "700",
  },

  sub: {
    marginTop: 6,
    color: "#6B6B6B",
    fontWeight: "500",
    fontSize: 12,
  },

  xBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFEFEF",
  },

  xText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  statKey: {
    color: "#7A7A7A",
    fontWeight: "700",
    fontSize: 11,
  },

  statVal: {
    marginTop: 6,
    color: "#111",
    fontWeight: "700",
  },

  statSmall: {
    fontSize: 12,
  },

  breakRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  table: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    gap: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowKey: {
    color: "#7A7A7A",
    fontWeight: "700",
    fontSize: 12,
  },

  rowVal: {
    color: "#111",
    fontWeight: "600",
  },

  mono: {
    fontFamily: "monospace",
  },

  primaryBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#111",
  },

  primaryText: {
    color: "#FFF",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});