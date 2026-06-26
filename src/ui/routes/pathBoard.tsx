import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export type HandBit = 0 | 1;
export type PathStep = [number, HandBit]; // [globalHoleIndex, HandBit]

type BoardUsage = {
  positions: number[];
  lastPos: number;
  lastHand: HandBit;
};

// EXACT TYPES FOR YOUR NEW JSON PAYLOAD:
export interface HolePosition {
  index: number;
  x: number;
  y: number;
}

export interface HardwareModule {
  _id: string;
  masterDeviceId: string;
  hardwareId: string;
  moduleType: string;
  index: number;
  isActive: boolean;
  holePositions: HolePosition[];
}

type FlattenedHole = {
  globalIndex: number; // 0, 1, 2, 3... (This goes to the backend)
  displayNumber: number; // 1, 2, 3, 4... (Shown inside the circle)
  rawX: number;
  rawY: number;
  moduleId: string;
  moduleIndex: number;
  localHoleIndex: number;
  pixelX: number;
  pixelY: number;
};

type Props = {
  path: PathStep[];
  onChangePath: (next: PathStep[]) => void;
  modules?: HardwareModule[];
  title?: string;
  hint?: string;
  allowMultiple?: boolean;
  statusText?: string;
};

function PulsingGlow({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderRadius: size / 2,
          backgroundColor: "rgba(59,130,246,0.20)",
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.65] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
        },
      ]}
    />
  );
}

function SequenceBar({ path, onClear }: { path: PathStep[]; onClear: () => void }) {
  const scale = useResponsiveScale();
  const styles = useMemo(() => getResponsiveStyles(scale), [scale]);

  if (!path.length) return null;

  return (
    <View style={styles.sequenceWrap}>
      <View style={styles.sequenceHead}>
        <Text style={styles.sequenceTitle}>Path sequence</Text>
        <Pressable onPress={onClear}>
          <Text style={styles.sequenceClear}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.sequenceTrack}>
        {path.map((step, i) => (
          <View key={`${step[0]}-${step[1]}-${i}`} style={styles.sequenceItem}>
            <View style={styles.sequenceNode}>
              <Text style={styles.sequenceNodeText}>{step[0] + 1}</Text>
            </View>
            <Text style={styles.sequenceHand}>{step[1] === 0 ? "L" : "R"}</Text>
            {i < path.length - 1 ? <Text style={styles.sequenceArrow}>→</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function PathBoard({
  path,
  onChangePath,
  modules = [],
  title,
  hint = "Tap a hold to add Left / Right hand.",
  allowMultiple = true,
  statusText,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = useResponsiveScale();
  const styles = useMemo(() => getResponsiveStyles(scale), [scale]);

  const [activeId, setActiveId] = useState<number | null>(null);
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const isTablet = width >= 768;
  const contentMaxWidth = Math.min(width - (isTablet ? scale(40) : scale(24)), isTablet ? scale(720) : scale(520));

  // --- THE MASTER FLATTENING & CAD NORMALIZER ---
  const { positionedHoles, boardPixelWidth, boardPixelHeight, holeSize } = useMemo(() => {
    const flat: Omit<FlattenedHole, "pixelX" | "pixelY">[] = [];
    let counter = 0;

    // 1. Sort modules deterministically by their hardware index
    const activeMods = [...modules]
      .filter((m) => m.isActive !== false)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    activeMods.forEach((mod) => {
      const sortedPegs = [...(mod.holePositions || [])].sort((a, b) => a.index - b.index);
      sortedPegs.forEach((peg) => {
        flat.push({
          globalIndex: counter,
          displayNumber: counter + 1,
          rawX: peg.x,
          rawY: peg.y,
          moduleId: mod._id,
          moduleIndex: mod.index,
          localHoleIndex: peg.index,
        });
        counter++;
      });
    });

    if (flat.length === 0) {
      return { positionedHoles: [], boardPixelWidth: 300, boardPixelHeight: 300, holeSize: scale(46) };
    }

    // 2. Discover the physical millimeter bounds of the real wall
    const xs = flat.map((h) => h.rawX);
    const ys = flat.map((h) => h.rawY);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);

    // 3. Project physical millimeter ratio onto mobile screen pixels
    const finalWidth = contentMaxWidth - scale(16);
    const calcHole = Math.min(scale(60), Math.max(scale(38), finalWidth / (Math.sqrt(flat.length) * 1.6)));
    const pad = calcHole * 0.85;

    const canvasDrawWidth = finalWidth - pad * 2;
    const physicalAspectRatio = spanY / spanX;
    
    const rawCalcHeight = canvasDrawWidth * physicalAspectRatio;
    const boundedDrawHeight = Math.max(scale(220), Math.min(scale(580), rawCalcHeight));
    const finalHeight = boundedDrawHeight + pad * 2;

    const projected: FlattenedHole[] = flat.map((item) => {
      const normX = (item.rawX - minX) / spanX;
      const normY = (item.rawY - minY) / spanY;

      return {
        ...item,
        pixelX: pad + normX * canvasDrawWidth - calcHole / 2,
        pixelY: pad + normY * boundedDrawHeight - calcHole / 2,
      };
    });

    return {
      positionedHoles: projected,
      boardPixelWidth: finalWidth,
      boardPixelHeight: finalHeight,
      holeSize: calcHole,
    };
  }, [modules, contentMaxWidth, scale]);

  const total = positionedHoles.length;

  const selectedMap = useMemo(() => {
    const m = new Map<number, BoardUsage>();
    (Array.isArray(path) ? path : []).forEach((step: any, pos) => {
      if (!Array.isArray(step) || step.length < 2) return;
      const hold = Number(step[0]);
      const hand = Number(step[1]) as HandBit;

      if (!Number.isFinite(hold) || hold < 0 || hold >= total) return;
      if (hand !== 0 && hand !== 1) return;

      const existing = m.get(hold);
      if (!existing) m.set(hold, { positions: [pos], lastPos: pos, lastHand: hand });
      else {
        existing.positions.push(pos);
        existing.lastPos = pos;
        existing.lastHand = hand;
      }
    });
    return m;
  }, [path, total]);

  const activeHoleObj = activeId !== null ? positionedHoles[activeId] : null;
  const activeUsageInfo = activeId !== null ? selectedMap.get(activeId) : null;

  const openPicker = (id: number) => {
    setActiveId(id);
    modalScale.setValue(0.9);
    modalOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.9, duration: 130, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 130, useNativeDriver: true }),
    ]).start(() => setActiveId(null));
  };

  const addStep = (id: number, hand: HandBit) => {
    if (!allowMultiple) {
      const existing = selectedMap.get(id);
      if (existing) {
        const next = path.map((s, i) => (i === existing.lastPos ? ([id, hand] as PathStep) : s));
        onChangePath(next);
      } else onChangePath([...(path || []), [id, hand]]);
    } else onChangePath([...(path || []), [id, hand]]);
    closePicker();
  };

  const removeLastOccurrence = (id: number) => {
    const prev = path || [];
    let last = -1;
    for (let i = prev.length - 1; i >= 0; i--) {
      if (prev[i]?.[0] === id) { last = i; break; }
    }
    if (last === -1) return closePicker();
    onChangePath(prev.filter((_, i) => i !== last));
    closePicker();
  };

  if (!total) {
    return (
      <View style={[styles.wrap, { alignItems: "center", paddingVertical: scale(40) }]}>
        <Text style={{ color: "#888", fontWeight: "600" }}>No physical holds detected on this canvas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.boardTitle}>{title}</Text> : null}
      {statusText ? <Text style={styles.status}>{statusText}</Text> : null}

      <View style={[styles.boardShell, { width: boardPixelWidth, height: boardPixelHeight }]}>
        {positionedHoles.map((item) => {
          const selected = selectedMap.get(item.globalIndex);

          return (
            <Pressable
              key={item.globalIndex}
              onPress={() => openPicker(item.globalIndex)}
              style={[styles.holeWrap, { width: holeSize, height: holeSize, left: item.pixelX, top: item.pixelY }]}
            >
              {selected ? <PulsingGlow size={holeSize} /> : null}

              <View style={[styles.hole, { width: holeSize, height: holeSize, borderRadius: holeSize / 2 }, selected && styles.holeSelected]}>
                <Text style={[styles.holeText, { fontSize: isTablet ? scale(14) : scale(11) }, selected && styles.holeTextSelected]}>
                  {item.displayNumber}
                </Text>

                {selected ? (
                  <>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{selected.lastPos + 1}</Text>
                    </View>
                    <View style={[styles.handBadge, selected.lastHand === 0 ? styles.handLeft : styles.handRight]}>
                      <Text style={styles.handBadgeText}>{selected.lastHand === 0 ? "L" : "R"}</Text>
                    </View>
                  </>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>{hint}</Text>
      <SequenceBar path={path} onClear={() => onChangePath([])} />

      <Modal transparent visible={activeId !== null} animationType="none">
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Hold #{activeHoleObj?.displayNumber}</Text>
              
              {/* SICK HARDWARE DEBUGGING LINE: */}
              <Text style={styles.modalSub}>
                {activeHoleObj ? `[Module #${activeHoleObj.moduleIndex} • Peg ${activeHoleObj.localHoleIndex + 1}]` : ""} 
                {activeUsageInfo ? ` • Used ${activeUsageInfo.positions.length}×` : " • Unused"}
              </Text>

              <View style={styles.modalActions}>
                <Pressable style={[styles.handBtn, styles.leftBtn]} onPress={() => activeId !== null && addStep(activeId, 0)}>
                  <Text style={styles.handBtnText}>Left</Text>
                </Pressable>
                <Pressable style={[styles.handBtn, styles.rightBtn]} onPress={() => activeId !== null && addStep(activeId, 1)}>
                  <Text style={styles.handBtnText}>Right</Text>
                </Pressable>
              </View>

              {activeId !== null && selectedMap.has(activeId) ? (
                <Pressable style={styles.removeBtn} onPress={() => removeLastOccurrence(activeId)}>
                  <Text style={styles.removeBtnText}>Remove last occurrence</Text>
                </Pressable>
              ) : null}

              <Pressable style={styles.closeBtn} onPress={closePicker}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const getResponsiveStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    wrap: { marginTop: s(14), borderRadius: s(20), backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9D9D9", padding: s(14) },
    status: { color: "#111111", fontSize: s(12), fontWeight: "700", marginBottom: s(10) },
    boardTitle: { color: "#111111", fontWeight: "800", fontSize: s(12), letterSpacing: 1, marginBottom: s(14) },
    boardShell: { alignSelf: "center", position: "relative", backgroundColor: "#FAFAFA", borderRadius: s(16), borderWidth: 1, borderColor: "#EAEAEA" },
    holeWrap: { position: "absolute" },
    hole: { backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center", overflow: "visible" },
    holeSelected: { borderWidth: 2, borderColor: "#3B82F6", backgroundColor: "#CFCFCF" },
    holeText: { color: "#111111", fontWeight: "700" },
    holeTextSelected: { textDecorationLine: "underline" },
    badge: { position: "absolute", top: s(-6), right: s(-6), minWidth: s(18), height: s(18), borderRadius: s(9), paddingHorizontal: s(4), backgroundColor: "#111111", alignItems: "center", justifyContent: "center" },
    badgeText: { color: "#FFFFFF", fontSize: s(10), fontWeight: "700" },
    handBadge: { position: "absolute", bottom: s(-6), paddingHorizontal: s(6), height: s(18), borderRadius: s(9), alignItems: "center", justifyContent: "center" },
    handLeft: { backgroundColor: "#2563EB" },
    handRight: { backgroundColor: "#ff0000" },
    handBadgeText: { color: "#FFFFFF", fontSize: s(10), fontWeight: "700" },
    hint: { marginTop: s(14), color: "#6B6B6B", fontSize: s(10), textAlign: "center" },
    sequenceWrap: { marginTop: s(14), backgroundColor: "#F7F7F7", borderRadius: s(16), borderWidth: 1, borderColor: "#E3E3E3", padding: s(12) },
    sequenceHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: s(8) },
    sequenceTitle: { color: "#111111", fontSize: s(11), fontWeight: "700" },
    sequenceClear: { color: "#C44760", fontWeight: "700", fontSize: s(12) },
    sequenceTrack: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: s(6) },
    sequenceItem: { flexDirection: "row", alignItems: "center" },
    sequenceNode: { width: s(28), height: s(28), borderRadius: s(14), backgroundColor: "#111111", alignItems: "center", justifyContent: "center" },
    sequenceNodeText: { color: "#FFFFFF", fontWeight: "700", fontSize: s(12) },
    sequenceHand: { marginLeft: s(4), color: "#6B6B6B", fontSize: s(11), fontWeight: "700" },
    sequenceArrow: { marginHorizontal: s(6), color: "#999999", fontWeight: "700" },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: s(20) },
    modalCard: { backgroundColor: "#FFFFFF", borderRadius: s(20), borderWidth: 1, borderColor: "#D9D9D9", padding: s(18) },
    modalTitle: { color: "#111111", fontSize: s(14), fontWeight: "700" },
    modalSub: { color: "#6B6B6B", fontSize: s(11), marginTop: s(4), marginBottom: s(14) },
    modalActions: { flexDirection: "row", gap: s(10) },
    handBtn: { flex: 1, height: s(48), borderRadius: s(14), alignItems: "center", justifyContent: "center" },
    leftBtn: { backgroundColor: "#2563EB" },
    rightBtn: { backgroundColor: "#ff0000" },
    handBtnText: { color: "#FFFFFF", fontSize: s(12), fontWeight: "700" },
    removeBtn: { marginTop: s(12), height: s(46), borderRadius: s(14), alignItems: "center", justifyContent: "center", backgroundColor: "rgba(225,85,114,0.08)", borderWidth: 1, borderColor: "rgba(225,85,114,0.25)" },
    removeBtnText: { color: "#C44760", fontWeight: "700" },
    closeBtn: { marginTop: s(10), height: s(44), alignItems: "center", justifyContent: "center" },
    closeBtnText: { color: "#444444", fontWeight: "700" },
  });