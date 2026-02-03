import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

type BoardUsage = {
  positions: number[];
  lastPos: number;
  lastHand: HandBit;
};

type Props = {
  rows?: number;
  cols?: number;
  path: PathStep[];
  onChangePath: (next: PathStep[]) => void;
  title?: string;
  hint?: string;
  allowMultiple?: boolean;
};

// Animated pulsing glow for selected nodes
function PulsingGlow({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: size / 2,
          backgroundColor: "rgba(99, 102, 241, 0.3)",
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }],
        },
      ]}
    />
  );
}

// Floating particles in the background
function BoardParticles() {
  const particles = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      anim: new Animated.Value(0),
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 3 + Math.random() * 4,
      duration: 2000 + Math.random() * 2000,
      delay: i * 200,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }).start(() => animate());
      };
      animate();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: `rgba(139, 92, 246, ${0.3 + (i % 3) * 0.1})`,
            opacity: p.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.6, 0.2] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

// Animated node component
function BoardNode({
  idx,
  size,
  spacing,
  cols,
  selected,
  onPress,
}: {
  idx: number;
  size: number;
  spacing: number;
  cols: number;
  selected: BoardUsage | undefined;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isSelected = !!selected;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          marginRight: (idx + 1) % cols === 0 ? 0 : spacing,
          marginBottom: spacing,
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
        {isSelected && <PulsingGlow size={size} />}

        <LinearGradient
          colors={
            isSelected
              ? ["rgba(99, 102, 241, 0.4)", "rgba(139, 92, 246, 0.2)"]
              : ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.02)"]
          }
          style={[
            b.node,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: isSelected ? "rgba(139, 92, 246, 0.8)" : "rgba(255, 255, 255, 0.1)",
            },
          ]}
        >
          {/* Node index */}
          <Text style={[b.nodeIndex, isSelected && b.nodeIndexSelected]}>{idx+1}</Text>

          {isSelected && (
            <>
              {/* Step number badge */}
              <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={b.badge}>
                <Text style={b.badgeText}>{selected.lastPos + 1}</Text>
              </LinearGradient>

              {/* Hand indicator */}
              <View style={[b.handBadge, selected.lastHand === 0 ? b.handLeft : b.handRight]}>
                <Text style={b.handText}>{selected.lastHand === 0 ? "L" : "R"}</Text>
              </View>

              {/* Usage count */}
              {selected.positions.length > 1 && (
                <View style={b.countBadge}>
                  <Text style={b.countText}>×{selected.positions.length}</Text>
                </View>
              )}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Path visualization showing the sequence
function PathSequence({ path, onClear }: { path: PathStep[]; onClear: () => void }) {
  if (!path || path.length === 0) {
    return (
      <View style={b.sequenceEmpty}>
        <Text style={b.sequenceEmptyIcon}>🎯</Text>
        <Text style={b.sequenceEmptyText}>No path selected yet</Text>
      </View>
    );
  }

  return (
    <View style={b.sequenceContainer}>
      <View style={b.sequenceHeader}>
        <View style={b.sequenceTitleRow}>
          <Text style={b.sequenceIcon}>📍</Text>
          <Text style={b.sequenceTitle}>PATH SEQUENCE</Text>
        </View>
        <Pressable onPress={onClear} style={b.clearBtnSmall}>
          <Text style={b.clearBtnSmallText}>✕</Text>
        </Pressable>
      </View>

      <View style={b.sequenceTrack}>
        {path.map((step, i) => (
          <View key={i} style={b.sequenceStep}>
            <LinearGradient
              colors={step[1] === 0 ? ["#3B82F6", "#1D4ED8"] : ["#F59E0B", "#D97706"]}
              style={b.sequenceNode}
            >
              <Text style={b.sequenceNodeText}>{step[0]}</Text>
            </LinearGradient>
            <Text style={b.sequenceHand}>{step[1] === 0 ? "L" : "R"}</Text>
            {i < path.length - 1 && (
              <View style={b.sequenceArrow}>
                <Text style={b.sequenceArrowText}>→</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export function PathBoard({
  rows = 4,
  cols = 5,
  path,
  onChangePath,
  title = "PATH BOARD",
  hint = "Tap a node to add Left/Right. Repeat nodes allowed.",
  allowMultiple = true,
}: Props) {
  const total = rows * cols;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const selectedMap = useMemo(() => {
    const m = new Map<number, BoardUsage>();

    (Array.isArray(path) ? path : []).forEach((step: any, pos) => {
      if (!Array.isArray(step) || step.length < 2) return;

      const idx = Number(step[0]);
      const hand = Number(step[1]) as HandBit;

      if (!Number.isFinite(idx) || idx < 0 || idx >= total) return;
      if (hand !== 0 && hand !== 1) return;

      const existing = m.get(idx);
      if (!existing) m.set(idx, { positions: [pos], lastPos: pos, lastHand: hand });
      else {
        existing.positions.push(pos);
        existing.lastPos = pos;
        existing.lastHand = hand;
      }
    });

    return m;
  }, [path, total]);

  const activeInfo = activeIndex !== null ? selectedMap.get(activeIndex) : null;

  const openPicker = (idx: number) => {
    setActiveIndex(idx);
    modalScale.setValue(0.8);
    modalOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setActiveIndex(null));
  };

  const addStep = (idx: number, hand: HandBit) => {
    if (!allowMultiple) {
      const existing = selectedMap.get(idx);
      if (existing) {
        const lastPos = existing.lastPos;
        const next = path.map((s, i) => (i === lastPos ? ([idx, hand] as PathStep) : s));
        onChangePath(next);
      } else {
        onChangePath([...(path || []), [idx, hand]]);
      }
      closePicker();
      return;
    }

    onChangePath([...(path || []), [idx, hand]]);
    closePicker();
  };

  const removeLastOccurrence = (idx: number) => {
    const prev = path || [];
    let last = -1;
    for (let i = prev.length - 1; i >= 0; i--) {
      if (prev[i]?.[0] === idx) {
        last = i;
        break;
      }
    }
    if (last === -1) {
      closePicker();
      return;
    }
    const next = prev.filter((_, i) => i !== last);
    onChangePath(next);
    closePicker();
  };

  const clearAll = () => onChangePath([]);

  const screenW = Dimensions.get("window").width;
  const spacing = 10;
  const horizontalPadding = 20 * 2;
  const holeSize = Math.floor((screenW - horizontalPadding - spacing * (cols - 1) - 28) / cols);

  return (
    <View style={b.wrap}>
      {/* Background effects */}
      <View style={b.bgGlow} />
      <BoardParticles />

      {/* Header */}
      <View style={b.header}>
        <LinearGradient colors={["rgba(139, 92, 246, 0.2)", "rgba(99, 102, 241, 0.1)"]} style={b.headerGradient}>
          <View style={b.headerContent}>
            <View style={b.titleSection}>
              <Text style={b.titleIcon}>🎮</Text>
              <View>
                <Text style={b.title}>{title}</Text>
                <Text style={b.hint}>{hint}</Text>
              </View>
            </View>

            <Pressable onPress={clearAll} style={b.clearBtn}>
              <LinearGradient colors={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]} style={b.clearBtnGradient}>
                <Text style={b.clearIcon}>🗑️</Text>
                <Text style={b.clearText}>CLEAR</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* Stats bar */}
      <View style={b.statsBar}>
        <View style={b.statItem}>
          <Text style={b.statValue}>{path?.length || 0}</Text>
          <Text style={b.statLabel}>Steps</Text>
        </View>
        <View style={b.statDivider} />
        <View style={b.statItem}>
          <Text style={b.statValue}>{selectedMap.size}</Text>
          <Text style={b.statLabel}>Nodes</Text>
        </View>
        <View style={b.statDivider} />
        <View style={b.statItem}>
          <Text style={b.statValue}>{total}</Text>
          <Text style={b.statLabel}>Total</Text>
        </View>
      </View>

      {/* Board */}
      <View style={b.boardContainer}>
        <View style={b.board}>
          {Array.from({ length: total }).map((_, idx) => (
            <BoardNode
              key={idx}
              idx={idx}
              size={holeSize}
              spacing={spacing}
              cols={cols}
              selected={selectedMap.get(idx)}
              onPress={() => openPicker(idx)}
            />
          ))}
        </View>
      </View>

      {/* Path sequence visualization */}
      <PathSequence path={path} onClear={clearAll} />

      {/* Picker Modal */}
      <Modal transparent visible={activeIndex !== null} animationType="none">
        <Pressable style={b.backdrop} onPress={closePicker}>
          <Animated.View
            style={[
              b.modalCard,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <LinearGradient colors={["#1a1a2e", "#0f0f1a"]} style={b.modalGradient}>
                {/* Modal header */}
                <View style={b.modalHeader}>
                  <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={b.modalNodePreview}>
                    <Text style={b.modalNodeText}>{1+activeIndex?? ""}</Text>
                  </LinearGradient>
                  <View>
                    <Text style={b.modalTitle}>NODE #{activeIndex ?? ""}</Text>
                    <Text style={b.modalHint}>
                      {activeInfo
                        ? `Used ${activeInfo.positions.length}× • Last step #${activeInfo.lastPos + 1}`
                        : "Not used yet"}
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={b.modalActions}>
                  <Text style={b.actionLabel}>SELECT HAND</Text>

                  <View style={b.handButtons}>
                    <Pressable style={b.handBtn} onPress={() => addStep(activeIndex!, 0)}>
                      <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={b.handBtnGradient}>
                        <Text style={b.handBtnIcon}>👈</Text>
                        <Text style={b.handBtnText}>LEFT</Text>
                        <Text style={b.handBtnCode}>(0)</Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable style={b.handBtn} onPress={() => addStep(activeIndex!, 1)}>
                      <LinearGradient colors={["#F59E0B", "#D97706"]} style={b.handBtnGradient}>
                        <Text style={b.handBtnIcon}>👉</Text>
                        <Text style={b.handBtnText}>RIGHT</Text>
                        <Text style={b.handBtnCode}>(1)</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>

                  {activeIndex !== null && selectedMap.has(activeIndex) && (
                    <Pressable style={b.removeBtn} onPress={() => removeLastOccurrence(activeIndex)}>
                      <LinearGradient colors={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]} style={b.removeBtnGradient}>
                        <Text style={b.removeBtnIcon}>🗑️</Text>
                        <Text style={b.removeBtnText}>REMOVE LAST OCCURRENCE</Text>
                      </LinearGradient>
                    </Pressable>
                  )}

                  <Pressable style={b.closeBtn} onPress={closePicker}>
                    <Text style={b.closeBtnText}>CLOSE</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const b = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    backgroundColor: "rgba(15, 15, 26, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    overflow: "hidden",
    marginTop: 14,
  },

  bgGlow: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },

  // Header
  header: {
    overflow: "hidden",
  },
  headerGradient: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  titleIcon: {
    fontSize: 32,
  },
  title: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1.5,
  },
  hint: {
    marginTop: 4,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    fontSize: 12,
    maxWidth: 200,
  },

  clearBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  clearBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  clearIcon: {
    fontSize: 14,
  },
  clearText: {
    color: "#FCA5A5",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },

  // Stats bar
  statsBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  // Board
  boardContainer: {
    padding: 14,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  node: {
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  nodeIndex: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "800",
  },
  nodeIndexSelected: {
    color: "rgba(255, 255, 255, 0.9)",
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f0f1a",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  handBadge: {
    position: "absolute",
    bottom: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0f0f1a",
  },
  handLeft: {
    backgroundColor: "#3B82F6",
  },
  handRight: {
    backgroundColor: "#F59E0B",
  },
  handText: {
    fontWeight: "900",
    color: "#fff",
    fontSize: 10,
  },

  countBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countText: {
    fontWeight: "900",
    color: "#A78BFA",
    fontSize: 10,
  },

  // Sequence
  sequenceContainer: {
    margin: 14,
    marginTop: 0,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  sequenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sequenceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sequenceIcon: {
    fontSize: 16,
  },
  sequenceTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  clearBtnSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtnSmallText: {
    color: "#FCA5A5",
    fontWeight: "900",
    fontSize: 12,
  },
  sequenceTrack: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  sequenceStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  sequenceNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sequenceNodeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  sequenceHand: {
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "800",
    fontSize: 10,
    marginLeft: 2,
  },
  sequenceArrow: {
    marginHorizontal: 4,
  },
  sequenceArrowText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
  },
  sequenceEmpty: {
    margin: 14,
    marginTop: 0,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    gap: 8,
  },
  sequenceEmptyIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  sequenceEmptyText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "700",
    fontSize: 13,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  modalNodePreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  modalNodeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  modalHint: {
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
    marginTop: 4,
    fontSize: 13,
  },

  modalActions: {
    gap: 12,
  },
  actionLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  handButtons: {
    flexDirection: "row",
    gap: 12,
  },
  handBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  handBtnGradient: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  handBtnIcon: {
    fontSize: 28,
  },
  handBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  handBtnCode: {
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "700",
    fontSize: 12,
  },

  removeBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  removeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  removeBtnIcon: {
    fontSize: 16,
  },
  removeBtnText: {
    color: "#FCA5A5",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  closeBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  closeBtnText: {
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 1.5,
    fontSize: 13,
  },
});