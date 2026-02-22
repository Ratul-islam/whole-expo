import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

type ToastState =
  | null
  | { type: "success" | "error" | "info"; title: string; message?: string };

type ActionFn = () => Promise<any> | void;

export function PathBoardViewer({
  visible,
  path,
  pathName,
  onClose,
  rows = 4,
  cols = 5,

  // ✅ context label
  context = "OWNER", // "OWNER" | "LEADERBOARD"

  // ✅ Upload to device (OWNER)
  canUpload = false,
  onUpload,
  uploadLabel = "UPLOAD TO DEVICE",
  uploadBusy = false,

  // ✅ Leaderboard visibility (OWNER)
  canToggleLeaderboard = false,
  isPublic = false,
  onToggleLeaderboard,
  leaderboardBusy = false,

  // ✅ Edit (OWNER)
  canEdit = false,
  onEdit,
  editLabel = "EDIT",
  editBusy = false,

  // ✅ Save/Unsave (LEADERBOARD)
  canSave = false,
  isSaved = false,
  onSaveToggle,
  saveBusy = false,

  // ✅ Toast
  toast,
  onClearToast,
}: {
  visible: boolean;
  path: PathStep[];
  pathName: string;
  onClose: () => void;
  rows?: number;
  cols?: number;

  context?: "OWNER" | "LEADERBOARD";

  // OWNER actions
  canUpload?: boolean;
  onUpload?: ActionFn;
  uploadLabel?: string;
  uploadBusy?: boolean;

  canToggleLeaderboard?: boolean;
  isPublic?: boolean;
  onToggleLeaderboard?: ActionFn;
  leaderboardBusy?: boolean;

  canEdit?: boolean;
  onEdit?: ActionFn;
  editLabel?: string;
  editBusy?: boolean;

  // LEADERBOARD actions
  canSave?: boolean;
  isSaved?: boolean;
  onSaveToggle?: ActionFn;
  saveBusy?: boolean;

  // Toast
  toast?: ToastState;
  onClearToast?: () => void;
}) {
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const [localToast, setLocalToast] = useState<ToastState>(null);
  const activeToast = toast ?? localToast;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, modalScale, modalOpacity]);

  useEffect(() => {
    if (!activeToast) return;
    const t = setTimeout(() => {
      if (toast) onClearToast?.();
      else setLocalToast(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [activeToast, toast, onClearToast]);

  const showToast = (t: ToastState) => {
    if (toast) return;
    setLocalToast(t);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
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

  const anyBusy = !!(uploadBusy || leaderboardBusy || editBusy || saveBusy);

  const safeRun = async (
    fn: ActionFn | undefined,
    start: ToastState,
    ok: ToastState,
    fail: (e: any) => ToastState
  ) => {
    if (!fn) return;
    try {
      showToast(start);
      await fn();
      showToast(ok);
    } catch (e: any) {
      showToast(fail(e));
    }
  };

  // enabled flags
  const uploadEnabled = !!canUpload && !!onUpload && !anyBusy;
  const leaderboardEnabled = !!canToggleLeaderboard && !!onToggleLeaderboard && !anyBusy;
  const editEnabled = !!canEdit && !!onEdit && !anyBusy;
  const saveEnabled = !!canSave && !!onSaveToggle && !anyBusy;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Animated.View style={[s.modal, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={["#1a1a2e", "#0f0f1a"]} style={s.content}>
              {/* Toast */}
              {activeToast ? (
                <View
                  style={[
                    s.toast,
                    activeToast.type === "success" && s.toastSuccess,
                    activeToast.type === "error" && s.toastError,
                    activeToast.type === "info" && s.toastInfo,
                  ]}
                >
                  <Text style={s.toastTitle}>{activeToast.title}</Text>
                  {activeToast.message ? <Text style={s.toastMsg}>{activeToast.message}</Text> : null}
                </View>
              ) : null}

              {/* Header */}
              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{pathName || "Untitled Route"}</Text>

                  <View style={s.headerRow}>
                    <Text style={s.sub}>{(path?.length || 0) + " steps"}</Text>

                    {/* OWNER: show public/private badge */}
                    {context === "OWNER" && canToggleLeaderboard ? (
                      <View style={[s.visibilityBadge, isPublic ? s.badgePublic : s.badgePrivate]}>
                        <Text style={s.visibilityText}>{isPublic ? "PUBLIC" : "PRIVATE"}</Text>
                      </View>
                    ) : null}

                    {/* LEADERBOARD: show saved badge */}
                    {context === "LEADERBOARD" && canSave ? (
                      <View style={[s.visibilityBadge, isSaved ? s.badgeSaved : s.badgeUnsaved]}>
                        <Text style={s.visibilityText}>{isSaved ? "SAVED" : "NOT SAVED"}</Text>
                      </View>
                    ) : null}
                  </View>
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
                        <Text style={[s.idx, on && s.idxOn]}>{idx + 1}</Text>

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

              {/* Sequence */}
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

              {/* Actions */}
              <View style={s.actionBar}>
                <Pressable onPress={handleClose} style={s.actionGhost}>
                  <Text style={s.actionGhostText}>CLOSE</Text>
                </Pressable>

                {/* OWNER: Edit */}
                {context === "OWNER" && canEdit ? (
                  <Pressable
                    onPress={() =>
                      safeRun(
                        onEdit,
                        { type: "info", title: "Opening", message: "Loading editor…" },
                        { type: "success", title: "Ready", message: "Editor opened." },
                        (e) => ({ type: "error", title: "Could not open", message: e?.message })
                      )
                    }
                    disabled={!editEnabled}
                    style={[s.actionMidWrap, !editEnabled && { opacity: 0.55 }]}
                  >
                    <LinearGradient colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)"]} style={s.actionMid}>
                      <View style={s.actionInnerRow}>
                        {editBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>✎</Text>}
                        <Text style={s.actionMidText} numberOfLines={1}>
                          {editLabel}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : null}

                {/* OWNER: public/private */}
                {context === "OWNER" && canToggleLeaderboard ? (
                  <Pressable
                    onPress={() =>
                      safeRun(
                        onToggleLeaderboard,
                        {
                          type: "info",
                          title: isPublic ? "Updating" : "Uploading",
                          message: isPublic ? "Making route private…" : "Publishing to leaderboard…",
                        },
                        {
                          type: "success",
                          title: isPublic ? "Made private" : "Published",
                          message: isPublic ? "Route is private now." : "Route is live on leaderboard.",
                        },
                        (e) => ({ type: "error", title: "Update failed", message: e?.message || "Try again." })
                      )
                    }
                    disabled={!leaderboardEnabled}
                    style={[s.actionMidWrap, !leaderboardEnabled && { opacity: 0.55 }]}
                  >
                    <LinearGradient
                      colors={
                        isPublic
                          ? ["rgba(255,92,122,0.18)", "rgba(255,92,122,0.10)"]
                          : ["rgba(122,162,255,0.22)", "rgba(122,162,255,0.12)"]
                      }
                      style={[s.actionMid, { borderColor: isPublic ? "rgba(255,92,122,0.38)" : "rgba(122,162,255,0.48)" }]}
                    >
                      <View style={s.actionInnerRow}>
                        {leaderboardBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>{isPublic ? "⤓" : "↑"}</Text>}
                        <Text style={s.actionMidText} numberOfLines={1}>
                          {isPublic ? "MAKE PRIVATE" : "UPLOAD"}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : null}

                {/* LEADERBOARD: Save/Unsave */}
                {context === "LEADERBOARD" && canSave ? (
                  <Pressable
                    onPress={() =>
                      safeRun(
                        onSaveToggle,
                        { type: "info", title: isSaved ? "Removing" : "Saving", message: isSaved ? "Removing from saved…" : "Saving route…" },
                        { type: "success", title: isSaved ? "Removed" : "Saved", message: isSaved ? "Removed from saved." : "Saved to your routes." },
                        (e) => ({ type: "error", title: "Failed", message: e?.message || "Try again." })
                      )
                    }
                    disabled={!saveEnabled}
                    style={[s.actionMidWrap, !saveEnabled && { opacity: 0.55 }]}
                  >
                    <LinearGradient
                      colors={
                        isSaved
                          ? ["rgba(255,92,122,0.14)", "rgba(255,92,122,0.08)"]
                          : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)"]
                      }
                      style={[s.actionMid, { borderColor: isSaved ? "rgba(255,92,122,0.30)" : "rgba(255,255,255,0.12)" }]}
                    >
                      <View style={s.actionInnerRow}>
                        {saveBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>{isSaved ? "✓" : "+"}</Text>}
                        <Text style={s.actionMidText} numberOfLines={1}>
                          {isSaved ? "UNSAVE" : "SAVE"}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : null}

                {/* OWNER: Upload to device */}
                {context === "OWNER" ? (
                  <Pressable
                    onPress={() =>
                      safeRun(
                        onUpload,
                        { type: "info", title: "Uploading", message: "Sending to device…" },
                        { type: "success", title: "Uploaded", message: "Route uploaded to device." },
                        (e) => ({ type: "error", title: "Upload failed", message: e?.message || "Try again." })
                      )
                    }
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
                      <View style={s.actionInnerRow}>
                        {uploadBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>⎆</Text>}
                        <Text style={s.actionPrimaryText} numberOfLines={1}>
                          {uploadEnabled ? uploadLabel : "SCAN DEVICE TO UPLOAD"}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : null}
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

  toast: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  toastSuccess: { borderColor: "rgba(122,162,255,0.55)", backgroundColor: "rgba(122,162,255,0.14)" },
  toastError: { borderColor: "rgba(255,92,122,0.45)", backgroundColor: "rgba(255,92,122,0.12)" },
  toastInfo: { borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.06)" },
  toastTitle: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.5 },
  toastMsg: { marginTop: 4, color: "rgba(255,255,255,0.70)", fontWeight: "800", fontSize: 12 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 10 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "700" },

  visibilityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  badgePublic: { borderColor: "rgba(122,162,255,0.50)" },
  badgePrivate: { borderColor: "rgba(255,255,255,0.14)" },
  badgeSaved: { borderColor: "rgba(122,162,255,0.50)" },
  badgeUnsaved: { borderColor: "rgba(255,255,255,0.14)" },
  visibilityText: { color: "#EAF0FF", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },

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

  actionMidWrap: { flex: 1.2 },
  actionMid: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  actionMidText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.6, fontSize: 12 },

  actionPrimaryWrap: { flex: 2.1 },
  actionPrimary: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.45)",
  },
  actionPrimaryText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.6, fontSize: 12 },

  actionInnerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: { color: "#EAF0FF", fontWeight: "900", fontSize: 12 },
});