import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

export function PathBoardViewer({
  visible,
  path,
  pathName,
  onClose,
  rows = 4,
  cols = 5,

  // ✅ Upload props
  canUpload = false,
  onUpload,
  uploadLabel = "UPLOAD TO DEVICE",
}: {
  visible: boolean;
  path: PathStep[];
  pathName: string;
  onClose: () => void;
  rows?: number;
  cols?: number;

  canUpload?: boolean;
  onUpload?: () => void;
  uploadLabel?: string;
}) {
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, modalScale, modalOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const uploadEnabled = !!canUpload && !!onUpload;

  const handleUpload = () => {
    if (!uploadEnabled) return;
    onUpload?.();
  };

  const total = rows * cols;
  const spacing = 8;
  const boardPadding = 40;
  const nodeSize = Math.floor(
    (SCREEN_WIDTH - boardPadding * 2 - spacing * (cols - 1)) / cols
  );

  const selectionMap = useMemo(() => {
    const map = new Map<number, { positions: number[]; lastPos: number; lastHand: HandBit }>();
    (path || []).forEach((step, pos) => {
      const [idx, hand] = step;
      const existing = map.get(idx);
      if (!existing) map.set(idx, { positions: [pos], lastPos: pos, lastHand: hand });
      else {
        existing.positions.push(pos);
        existing.lastPos = pos;
        existing.lastHand = hand;
      }
    });
    return map;
  }, [path]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Animated.View style={[s.modal, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          {/* prevent closing when tapping inside */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={["#1a1a2e", "#0f0f1a"]} style={s.content}>
              {/* Header */}
              <View style={s.header}>
                <View>
                  <Text style={s.title}>{pathName || "Untitled Route"}</Text>
                  <Text style={s.sub}>{(path?.length || 0) + " steps"}</Text>
                </View>
                <Pressable onPress={handleClose} style={s.closeBtn}>
                  <Text style={s.closeText}>✕</Text>
                </Pressable>
              </View>

              {/* Board */}
              <View style={s.boardWrap}>
                <View style={[s.board, { width: nodeSize * cols + spacing * (cols - 1) }]}>
                  {Array.from({ length: total }).map((_, idx) => {
                    const sel = selectionMap.get(idx);
                    const on = !!sel;

                    return (
                      <View
                        key={idx}
                        style={[
                          s.node,
                          {
                            width: nodeSize,
                            height: nodeSize,
                            borderRadius: nodeSize / 2,
                            marginRight: (idx + 1) % cols === 0 ? 0 : spacing,
                            marginBottom: spacing,
                          },
                          on && s.nodeOn,
                        ]}
                      >
                        <Text style={[s.idx, on && s.idxOn]}>{idx+1}</Text>

                        {on ? (
                          <>
                            <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={s.badge}>
                              <Text style={s.badgeText}>{sel!.lastPos + 1}</Text>
                            </LinearGradient>

                            <View style={[s.hand, sel!.lastHand === 0 ? s.handL : s.handR]}>
                              <Text style={s.handText}>{sel!.lastHand === 0 ? "L" : "R"}</Text>
                            </View>

                            {sel!.positions.length > 1 ? (
                              <View style={s.count}>
                                <Text style={s.countText}>×{sel!.positions.length}</Text>
                              </View>
                            ) : null}
                          </>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Path sequence */}
              <View style={s.seqBox}>
                <Text style={s.seqTitle}>PATH</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }}>
                  <View style={s.seqTrack}>
                    {(path || []).map((step, i) => (
                      <View key={i} style={s.seqStep}>
                        <LinearGradient
                          colors={step[1] === 0 ? ["#3B82F6", "#1D4ED8"] : ["#F59E0B", "#D97706"]}
                          style={s.seqNode}
                        >
                          <Text style={s.seqNodeText}>{step[0]}</Text>
                        </LinearGradient>
                        <Text style={s.seqHand}>{step[1] === 0 ? "L" : "R"}</Text>
                        {i < path.length - 1 ? <Text style={s.seqArrow}>→</Text> : null}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                <Stat label="Steps" value={path?.length || 0} />
                <Div />
                <Stat label="Unique" value={selectionMap.size} />
                <Div />
                <Stat
                  label="Hands"
                  value={`${(path || []).filter((x) => x[1] === 0).length}L / ${(path || []).filter((x) => x[1] === 1).length}R`}
                />
              </View>

              {/* ✅ Bottom action bar */}
              <View style={s.actionBar}>
                <Pressable onPress={handleClose} style={s.actionGhost}>
                  <Text style={s.actionGhostText}>CLOSE</Text>
                </Pressable>

                <Pressable
                  onPress={handleUpload}
                  disabled={!uploadEnabled}
                  style={[s.actionPrimaryWrap, !uploadEnabled && { opacity: 0.45 }]}
                >
                  <LinearGradient
                    colors={
                      uploadEnabled
                        ? ["#8B5CF6", "#6366F1"]
                        : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)"]
                    }
                    style={s.actionPrimary}
                  >
                    <Text style={s.actionPrimaryText}>
                      {uploadEnabled ? uploadLabel : "SCAN DEVICE TO UPLOAD"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

function Div() {
  return <View style={s.statDiv} />;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 16 },
  modal: { borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.35)" },
  content: { padding: 18 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "700", marginTop: 3 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  boardWrap: { alignItems: "center", marginBottom: 14 },
  board: { flexDirection: "row", flexWrap: "wrap" },
  node: { borderWidth: 2, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center", position: "relative" },
  nodeOn: { borderColor: "rgba(139, 92, 246, 0.80)", backgroundColor: "rgba(139, 92, 246, 0.13)" },
  idx: { color: "rgba(255,255,255,0.28)", fontSize: 12, fontWeight: "800" },
  idxOn: { color: "rgba(255,255,255,0.92)" },

  badge: { position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0f0f1a" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },

  hand: { position: "absolute", bottom: -6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 2, borderColor: "#0f0f1a" },
  handL: { backgroundColor: "#3B82F6" },
  handR: { backgroundColor: "#F59E0B" },
  handText: { color: "#fff", fontSize: 9, fontWeight: "900" },

  count: { position: "absolute", top: -4, left: -4, backgroundColor: "rgba(0,0,0,0.80)", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  countText: { color: "#A78BFA", fontSize: 9, fontWeight: "900" },

  seqBox: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 12, marginBottom: 12 },
  seqTitle: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "900", letterSpacing: 1.4, marginBottom: 10 },
  seqTrack: { flexDirection: "row", alignItems: "center" },
  seqStep: { flexDirection: "row", alignItems: "center" },
  seqNode: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  seqNodeText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  seqHand: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: "900", marginLeft: 3 },
  seqArrow: { color: "rgba(255,255,255,0.30)", fontSize: 12, marginHorizontal: 6 },

  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14 },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "900" },
  statLbl: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "800", marginTop: 4, textAlign: "center" },
  statDiv: { width: 1, height: 34, backgroundColor: "rgba(255,255,255,0.1)" },

  // Action bar
  actionBar: { marginTop: 14, flexDirection: "row", gap: 10 },
  actionGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  actionGhostText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1 },

  actionPrimaryWrap: { flex: 2 },
  actionPrimary: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.45)",
  },
  actionPrimaryText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1 },
});
