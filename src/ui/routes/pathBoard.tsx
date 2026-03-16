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

export type HandBit = 0 | 1;
export type PathStep = [number, HandBit];

type BoardUsage = {
  positions: number[];
  lastPos: number;
  lastHand: HandBit;
};

type BoardType = "10" | "20";

type HoleLayoutItem = {
  valueIndex: number;
  displayId: number;
  row: number;
  col: number;
};

type PositionedHole = HoleLayoutItem & {
  x: number;
  y: number;
};

type Props = {
  path: PathStep[];
  onChangePath: (next: PathStep[]) => void;
  title?: string;
  hint?: string;
  allowMultiple?: boolean;
  boardConf?: string | number;
  statusText?: string;
};

function normalizeBoardType(boardConf?: string | number): BoardType {
  const v = String(boardConf ?? "").trim().toLowerCase();

  if (v === "10" || v === "2x5" || v.includes("lite")) return "10";
  if (v === "20" || v === "4x5" || v.includes("nextpeg") || v.includes("full")) return "20";

  return "10";
}

function getBoardLayout(type: BoardType): HoleLayoutItem[] {
  if (type === "10") {
    return [
      { valueIndex: 0, displayId: 1, row: 0, col: 0 },
      { valueIndex: 1, displayId: 2, row: 0, col: 1 },
      { valueIndex: 2, displayId: 3, row: 0, col: 2 },

      { valueIndex: 3, displayId: 4, row: 1, col: 0 },
      { valueIndex: 4, displayId: 5, row: 1, col: 1 },
      { valueIndex: 5, displayId: 6, row: 1, col: 2 },
      { valueIndex: 6, displayId: 7, row: 1, col: 3 },

      { valueIndex: 7, displayId: 8, row: 2, col: 0 },
      { valueIndex: 8, displayId: 9, row: 2, col: 1 },
      { valueIndex: 9, displayId: 10, row: 2, col: 2 },
    ];
  }

  return [
    { valueIndex: 0, displayId: 1, row: 0, col: 0 },
    { valueIndex: 1, displayId: 2, row: 0, col: 1 },
    { valueIndex: 2, displayId: 3, row: 0, col: 2 },

    { valueIndex: 3, displayId: 4, row: 1, col: 0 },
    { valueIndex: 4, displayId: 5, row: 1, col: 1 },
    { valueIndex: 5, displayId: 6, row: 1, col: 2 },
    { valueIndex: 6, displayId: 7, row: 1, col: 3 },

    { valueIndex: 7, displayId: 8, row: 2, col: 0 },
    { valueIndex: 8, displayId: 9, row: 2, col: 1 },
    { valueIndex: 9, displayId: 10, row: 2, col: 2 },
    { valueIndex: 10, displayId: 11, row: 2, col: 3 },
    { valueIndex: 11, displayId: 12, row: 2, col: 4 },
    { valueIndex: 12, displayId: 13, row: 2, col: 5 },

    { valueIndex: 13, displayId: 14, row: 3, col: 0 },
    { valueIndex: 14, displayId: 15, row: 3, col: 1 },
    { valueIndex: 15, displayId: 16, row: 3, col: 2 },
    { valueIndex: 16, displayId: 17, row: 3, col: 3 },

    { valueIndex: 17, displayId: 18, row: 4, col: 0 },
    { valueIndex: 18, displayId: 19, row: 4, col: 1 },
    { valueIndex: 19, displayId: 20, row: 4, col: 2 },
  ];
}

function boardMeta(type: BoardType) {
  if (type === "10") {
    return {
      title: "NextPeg Lite",
      rows: 3,
    };
  }

  return {
    title: "NextPeg",
    rows: 5,
  };
}

function PulsingGlow({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
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
          opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.28, 0.65],
          }),
          transform: [
            {
              scale: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            },
          ],
        },
      ]}
    />
  );
}

function SequenceBar({
  path,
  onClear,
}: {
  path: PathStep[];
  onClear: () => void;
}) {
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
  title,
  hint = "Tap a hold to add Left / Right hand.",
  allowMultiple = true,
  boardConf,
  statusText,
}: Props) {
  const { width } = useWindowDimensions();

  const boardType = normalizeBoardType(boardConf);
  const layout = useMemo(() => getBoardLayout(boardType), [boardType]);
  const meta = useMemo(() => boardMeta(boardType), [boardType]);

  const total = layout.length;
  const effectiveTitle = title || meta.title;
  const effectiveStatus = statusText || `Status : Connected - ${meta.title}`;

  const [activeId, setActiveId] = useState<number | null>(null);

  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const selectedMap = useMemo(() => {
    const m = new Map<number, BoardUsage>();

    (Array.isArray(path) ? path : []).forEach((step: any, pos) => {
      if (!Array.isArray(step) || step.length < 2) return;

      const hold = Number(step[0]);
      const hand = Number(step[1]) as HandBit;

      if (!Number.isFinite(hold) || hold < 0 || hold >= total) return;
      if (hand !== 0 && hand !== 1) return;

      const existing = m.get(hold);
      if (!existing) {
        m.set(hold, { positions: [pos], lastPos: pos, lastHand: hand });
      } else {
        existing.positions.push(pos);
        existing.lastPos = pos;
        existing.lastHand = hand;
      }
    });

    return m;
  }, [path, total]);

  const activeInfo = activeId !== null ? selectedMap.get(activeId) : null;
  const activeDisplayId =
    activeId !== null
      ? layout.find((x) => x.valueIndex === activeId)?.displayId ?? ""
      : "";

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const contentMaxWidth = Math.min(width - (isTablet ? 40 : 24), isTablet ? 720 : 520);

  const holeSize = useMemo(() => {
    if (boardType === "10") {
      const usable = contentMaxWidth - 24;
      return Math.min(74, Math.max(42, usable / 5.2));
    }
    const usable = contentMaxWidth - 24;
    return Math.min(58, Math.max(58, usable / 8.8));
  }, [boardType, contentMaxWidth]);

  const gapX = boardType === "10" ? holeSize * 0.22 : holeSize * 0.16;
  const gapY = boardType === "10" ? holeSize * 0.22 : holeSize * 0.22;

  const ledPanelWidth = boardType === "20" ? holeSize * 1.25 : 0;
  const ledPanelGap = boardType === "20" ? holeSize * 0.24 : 0;

  const positioned = useMemo<PositionedHole[]>(() => {
    if (boardType === "10") {
      const rowCounts = [3, 4, 3];
      const fullWidth = 4 * holeSize + 3 * gapX;

      return layout.map((item) => {
        const rowWidth = rowCounts[item.row] * holeSize + (rowCounts[item.row] - 1) * gapX;
        const startX = (fullWidth - rowWidth) / 2;

        return {
          ...item,
          x: startX + item.col * (holeSize + gapX),
          y: item.row * (holeSize + gapY),
        };
      });
    }

    const rowCounts = [3, 4, 6, 4, 3];
    const gridWidth = 6 * holeSize + 5 * gapX;

    return layout.map((item) => {
      const rowWidth = rowCounts[item.row] * holeSize + (rowCounts[item.row] - 1) * gapX;
      const startX = ledPanelWidth + ledPanelGap + (gridWidth - rowWidth) / 2;

      return {
        ...item,
        x: startX + item.col * (holeSize + gapX),
        y: item.row * (holeSize + gapY),
      };
    });
  }, [boardType, layout, holeSize, gapX, gapY, ledPanelWidth, ledPanelGap]);

  const boardPixelWidth = useMemo(() => {
    if (boardType === "10") {
      return 4 * holeSize + 3 * gapX;
    }
    return ledPanelWidth + ledPanelGap + (7.5 * holeSize + 5 * gapX);
  }, [boardType, holeSize, gapX, ledPanelWidth, ledPanelGap]);

  const boardPixelHeight = meta.rows * holeSize + (meta.rows - 1) * gapY;

  const openPicker = (id: number) => {
    setActiveId(id);
    modalScale.setValue(0.9);
    modalOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => setActiveId(null));
  };

  const addStep = (id: number, hand: HandBit) => {
    if (!allowMultiple) {
      const existing = selectedMap.get(id);
      if (existing) {
        const next = path.map((s, i) =>
          i === existing.lastPos ? ([id, hand] as PathStep) : s
        );
        onChangePath(next);
      } else {
        onChangePath([...(path || []), [id, hand]]);
      }
    } else {
      onChangePath([...(path || []), [id, hand]]);
    }
    closePicker();
  };

  const removeLastOccurrence = (id: number) => {
    const prev = path || [];
    let last = -1;

    for (let i = prev.length - 1; i >= 0; i--) {
      if (prev[i]?.[0] === id) {
        last = i;
        break;
      }
    }

    if (last === -1) {
      closePicker();
      return;
    }

    onChangePath(prev.filter((_, i) => i !== last));
    closePicker();
  };

  const clearAll = () => onChangePath([]);

  return (
    <View style={styles.wrap}>
      {/* <Text style={styles.status}>{effectiveStatus}</Text> */}
      {/* <Text
        style={[
          styles.boardTitle,
          { fontSize: isTablet ? 20 : isSmallPhone ? 16 : 18 },
        ]}
      >
        {effectiveTitle}
      </Text> */}

      <View style={[styles.boardShell, { width: boardPixelWidth, height: boardPixelHeight }]}>
       

        {positioned.map((item) => {
          const selected = selectedMap.get(item.valueIndex);

          return (
            <Pressable
              key={item.valueIndex}
              onPress={() => openPicker(item.valueIndex)}
              style={[
                styles.holeWrap,
                {
                  width: holeSize,
                  height: holeSize,
                  left: item.x,
                  top: item.y,
                },
              ]}
            >
              {selected ? <PulsingGlow size={holeSize} /> : null}

              <View
                style={[
                  styles.hole,
                  {
                    width: holeSize,
                    height: holeSize,
                    borderRadius: holeSize / 2,
                  },
                  selected && styles.holeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.holeText,
                    { fontSize: isTablet ? 16 : isSmallPhone ? 12 : 14 },
                    selected && styles.holeTextSelected,
                  ]}
                >
                  {item.displayId}
                </Text>

                {selected ? (
                  <>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{selected.lastPos + 1}</Text>
                    </View>

                    <View
                      style={[
                        styles.handBadge,
                        selected.lastHand === 0 ? styles.handLeft : styles.handRight,
                      ]}
                    >
                      <Text style={styles.handBadgeText}>
                        {selected.lastHand === 0 ? "L" : "R"}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>{hint}</Text>

      <SequenceBar path={path} onClear={clearAll} />

      <Modal transparent visible={activeId !== null} animationType="none">
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Hold {activeDisplayId}</Text>
              <Text style={styles.modalSub}>
                {activeInfo
                  ? `Used ${activeInfo.positions.length}× • Last step #${activeInfo.lastPos + 1}`
                  : "Not used yet"}
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.handBtn, styles.leftBtn]}
                  onPress={() => activeId !== null && addStep(activeId, 0)}
                >
                  <Text style={styles.handBtnText}>Left</Text>
                </Pressable>

                <Pressable
                  style={[styles.handBtn, styles.rightBtn]}
                  onPress={() => activeId !== null && addStep(activeId, 1)}
                >
                  <Text style={styles.handBtnText}>Right</Text>
                </Pressable>
              </View>

              {activeId !== null && selectedMap.has(activeId) ? (
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeLastOccurrence(activeId)}
                >
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

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    padding: 14,
  },

  status: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  boardTitle: {
    color: "#111111",
    fontWeight: "500",
    marginBottom: 14,
  },

  boardShell: {
    alignSelf: "center",
    position: "relative",
  },

  liteOutline: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },

  liteDiagonalTop: {
    position: "absolute",
    height: 1,
    backgroundColor: "#3A3A3A",
    transform: [{ rotate: "-54deg" }],
  },

  liteDiagonalBottom: {
    position: "absolute",
    height: 1,
    backgroundColor: "#3A3A3A",
    transform: [{ rotate: "54deg" }],
  },

  ledPanel: {
    position: "absolute",
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  ledPanelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 13,
  },

  holeWrap: {
    position: "absolute",
  },

  hole: {
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  holeSelected: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#CFCFCF",
  },

  holeText: {
    color: "#111111",
    fontWeight: "700",
  },

  holeTextSelected: {
    textDecorationLine: "underline",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  handBadge: {
    position: "absolute",
    bottom: -6,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  handLeft: {
    backgroundColor: "#2563EB",
  },

  handRight: {
    backgroundColor: "#D97706",
  },

  handBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  hint: {
    marginTop: 14,
    color: "#6B6B6B",
    fontSize: 13,
  },

  sequenceWrap: {
    marginTop: 14,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    padding: 12,
  },

  sequenceHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  sequenceTitle: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
  },

  sequenceClear: {
    color: "#C44760",
    fontWeight: "700",
    fontSize: 12,
  },

  sequenceTrack: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },

  sequenceItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  sequenceNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  sequenceNodeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  sequenceHand: {
    marginLeft: 4,
    color: "#6B6B6B",
    fontSize: 11,
    fontWeight: "700",
  },

  sequenceArrow: {
    marginHorizontal: 6,
    color: "#999999",
    fontWeight: "700",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    padding: 18,
  },

  modalTitle: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
  },

  modalSub: {
    color: "#6B6B6B",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  handBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  leftBtn: {
    backgroundColor: "#2563EB",
  },

  rightBtn: {
    backgroundColor: "#D97706",
  },

  handBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  removeBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(225,85,114,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.25)",
  },

  removeBtnText: {
    color: "#C44760",
    fontWeight: "700",
  },

  closeBtn: {
    marginTop: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  closeBtnText: {
    color: "#444444",
    fontWeight: "700",
  },
});