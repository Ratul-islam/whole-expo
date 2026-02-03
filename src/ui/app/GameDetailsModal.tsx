import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type GameDetails = {
  _id?: string;
  sessionId?: string;
  status?: string;
  score?: number;
  correct?: number;
  wrong?: number;
  deviceId?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;

  // sensitive
  deviceSecret?: string;
  __v?: number;
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

function k(label: string) {
  return label.toUpperCase();
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
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale]);

  const close = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.92, duration: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const score = safeNum(game?.score);
  const correct = safeNum(game?.correct);
  const wrong = safeNum(game?.wrong);

  const accuracy = useMemo(() => {
    const total = correct + wrong;
    if (!total) return "—";
    const pct = Math.round((correct / total) * 100);
    return `${pct}%`;
  }, [correct, wrong]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Pressable style={s.backdrop} onPress={close}>
        <Animated.View style={[s.modal, { opacity, transform: [{ scale }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={s.panel}>
              {/* Top */}
              <View style={s.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>GAME DETAILS</Text>
                  <Text style={s.sub} numberOfLines={1}>
                    {game?.sessionId ? `SESSION ${game.sessionId}` : "SESSION —"}
                  </Text>
                </View>

                <Pressable onPress={close} style={s.xBtn}>
                  <Text style={s.xText}>X</Text>
                </Pressable>
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                <View style={s.statCard}>
                  <Text style={s.statKey}>{k("score")}</Text>
                  <Text style={s.statVal}>{score}</Text>
                </View>

                <View style={s.statCard}>
                  <Text style={s.statKey}>{k("accuracy")}</Text>
                  <Text style={s.statVal}>{accuracy}</Text>
                </View>

                <View style={s.statCard}>
                  <Text style={s.statKey}>{k("status")}</Text>
                  <Text style={s.statValSmall}>{String(game?.status ?? "—").toUpperCase()}</Text>
                </View>
              </View>

              {/* Breakdown */}
              <View style={s.breakRow}>
                <View style={s.breakCard}>
                  <Text style={s.breakKey}>{k("correct")}</Text>
                  <Text style={s.breakVal}>{correct}</Text>
                </View>
                <View style={s.breakCard}>
                  <Text style={s.breakKey}>{k("wrong")}</Text>
                  <Text style={s.breakVal}>{wrong}</Text>
                </View>
                <View style={s.breakCard}>
                  <Text style={s.breakKey}>{k("device")}</Text>
                  <Text style={s.breakValSmall}>{String(game?.deviceId ?? "—")}</Text>
                </View>
              </View>

              {/* Info table */}
              <View style={s.table}>
                <Row label="Started" value={fmtTime(game?.startedAt)} />
                <Row label="Ended" value={fmtTime(game?.endedAt)} />
                <Row label="Created" value={fmtTime(game?.createdAt)} />
                <Row label="Updated" value={fmtTime(game?.updatedAt)} />

                {/* optional */}
                {showDeviceSecret ? (
                  <Row label="Device Secret" value={String(game?.deviceSecret ?? "—")} />
                ) : null}

                {/* keep internal ids visible or hide - your choice */}
                <Row label="Game ID" value={String(game?._id ?? "—")} mono />
              </View>

              {/* Action */}
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

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowKey}>{k(label)}</Text>
      <Text style={[s.rowVal, mono && s.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.32)",
    backgroundColor: "rgba(8,10,20,0.98)",
  },
  panel: { padding: 16 },

  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: {
    color: "#EAF0FF",
    fontWeight: "900",
    letterSpacing: 1.4,
    fontSize: 16,
  },
  sub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "800",
    letterSpacing: 0.6,
    fontSize: 12,
  },

  xBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  xText: { color: "#EAF0FF", fontWeight: "900" },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statKey: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "900",
    letterSpacing: 1.2,
    fontSize: 11,
  },
  statVal: { marginTop: 8, color: "#fff", fontWeight: "900", fontSize: 22 },
  statValSmall: { marginTop: 10, color: "#fff", fontWeight: "900", fontSize: 12 },

  breakRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  breakCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  breakKey: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "900",
    letterSpacing: 1.2,
    fontSize: 11,
  },
  breakVal: { marginTop: 8, color: "#fff", fontWeight: "900", fontSize: 18 },
  breakValSmall: { marginTop: 10, color: "#fff", fontWeight: "900", fontSize: 12 },

  table: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  rowKey: { color: "rgba(255,255,255,0.52)", fontWeight: "900", letterSpacing: 1.1, fontSize: 11 },
  rowVal: { flex: 1, textAlign: "right", color: "#EAF0FF", fontWeight: "800" },
  mono: { fontFamily: "monospace" },

  primaryBtn: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(122,162,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.35)",
  },
  primaryText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.1 },
});
