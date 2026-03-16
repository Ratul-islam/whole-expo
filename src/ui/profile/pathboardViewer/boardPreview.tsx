import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { HoleLayoutItem, BoardType } from "./boardConfig";

type HandBit = 0 | 1;
type PathStep = [number, HandBit];

type PositionedHole = HoleLayoutItem & {
  x: number;
  y: number;
};

export function BoardPreview({
  boardType,
  layout,
  path,
}: {
  boardType: BoardType;
  layout: HoleLayoutItem[];
  path: PathStep[];
}) {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const containerWidth = Math.min(width - (isTablet ? 72 : 40), isTablet ? 620 : 360);

  const holeSize = useMemo(() => {
    if (boardType === "10") {
      return Math.min(56, Math.max(40, containerWidth / 6));
    }
    return Math.min(46, Math.max(31, containerWidth / 8.8));
  }, [boardType, containerWidth]);

  const gapX = boardType === "10" ? holeSize * 0.22 : holeSize * 0.16;
  const gapY = boardType === "10" ? holeSize * 0.22 : holeSize * 0.22;

  const leftPanelWidth = boardType === "20" ? holeSize * 1.28 : 0;
  const leftPanelGap = boardType === "20" ? holeSize * 0.28 : 0;

  const positioned = useMemo<PositionedHole[]>(() => {
    if (boardType === "10") {
      const rowCounts = [3, 4, 3];
      const maxCols = 4;

      return layout.map((item) => {
        const count = rowCounts[item.row];
        const rowWidth = count * holeSize + (count - 1) * gapX;
        const fullWidth = maxCols * holeSize + (maxCols - 1) * gapX;
        const startX = (fullWidth - rowWidth) / 2;

        const rowIndexMap =
          item.row === 0
            ? { 1: 0, 2: 1, 3: 2 }
            : item.row === 1
            ? { 4: 0, 5: 1, 6: 2, 7: 3 }
            : { 8: 0, 9: 1, 10: 2 };

        const visualIndex =
          rowIndexMap[item.displayId as keyof typeof rowIndexMap] ?? 0;

        return {
          ...item,
          x: startX + visualIndex * (holeSize + gapX),
          y: item.row * (holeSize + gapY),
        };
      });
    }

    const rowCounts = [3, 4, 6, 4, 3];
    const maxCols = 6;
    const fullWidth = maxCols * holeSize + (maxCols - 1) * gapX;

    return layout.map((item) => {
      const count = rowCounts[item.row];
      const rowWidth = count * holeSize + (count - 1) * gapX;
      const startX = leftPanelWidth + leftPanelGap + (fullWidth - rowWidth) / 2;

      const rowIndexMap =
        item.row === 0
          ? { 1: 0, 2: 1, 3: 2 }
          : item.row === 1
          ? { 4: 0, 5: 1, 6: 2, 7: 3 }
          : item.row === 2
          ? { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5 }
          : item.row === 3
          ? { 14: 0, 15: 1, 16: 2, 17: 3 }
          : { 18: 0, 19: 1, 20: 2 };

      const visualIndex =
        rowIndexMap[item.displayId as keyof typeof rowIndexMap] ?? 0;

      return {
        ...item,
        x: startX + visualIndex * (holeSize + gapX),
        y: item.row * (holeSize + gapY),
      };
    });
  }, [boardType, layout, holeSize, gapX, gapY, leftPanelWidth, leftPanelGap]);

  const boardWidth = useMemo(() => {
    if (boardType === "10") {
      return 4 * holeSize + 3 * gapX;
    }
    return leftPanelWidth + leftPanelGap + (6 * holeSize + 5 * gapX);
  }, [boardType, holeSize, gapX, leftPanelWidth, leftPanelGap]);

  const boardHeight = useMemo(() => {
    return (boardType === "10" ? 3 : 5) * holeSize + ((boardType === "10" ? 2 : 4) * gapY);
  }, [boardType, holeSize, gapY]);

  const selectionMap = useMemo(() => {
    const map = new Map<number, { positions: number[]; lastPos: number; lastHand: HandBit }>();

    (path || []).forEach((step, pos) => {
      const idx = Number(step?.[0]);
      const hand = Number(step?.[1]) as HandBit;

      if (!Number.isFinite(idx)) return;
      if (idx < 0 || idx >= layout.length) return;
      if (hand !== 0 && hand !== 1) return;

      const existing = map.get(idx);
      if (!existing) {
        map.set(idx, { positions: [pos], lastPos: pos, lastHand: hand });
      } else {
        existing.positions.push(pos);
        existing.lastPos = pos;
        existing.lastHand = hand;
      }
    });

    return map;
  }, [path, layout.length]);

  return (
    <View style={[s.boardWrap, { width: boardWidth, height: boardHeight }]}>
      {boardType === "10" ? (
        <>
          <View
            style={[
              s.liteOutline,
              {
                width: boardWidth,
                height: boardHeight,
              },
            ]}
          />
          <View
            style={[
              s.liteDiagonalTop,
              {
                width: holeSize * 1.42,
                left: -holeSize * 0.9,
                top: holeSize * 0.04,
              },
            ]}
          />
          <View
            style={[
              s.liteDiagonalBottom,
              {
                width: holeSize * 1.42,
                left: -holeSize * 0.9,
                bottom: holeSize * 0.04,
              },
            ]}
          />
        </>
      ) : (
        <View
          style={[
            s.ledPanel,
            {
              width: leftPanelWidth,
              height: holeSize * 1.06,
              left: 0,
              top: holeSize * 0.06,
            },
          ]}
        >
          <Text style={s.ledPanelText}>LED{"\n"}PANEL</Text>
        </View>
      )}

      {positioned.map((item) => {
        const sel = selectionMap.get(item.valueIndex);
        const on = !!sel;

        return (
          <View
            key={item.valueIndex}
            style={[
              s.holeWrap,
              {
                width: holeSize,
                height: holeSize,
                left: item.x,
                top: item.y,
              },
            ]}
          >
            <View
              style={[
                s.node,
                {
                  width: holeSize,
                  height: holeSize,
                  borderRadius: holeSize / 2,
                },
                on && s.nodeOn,
              ]}
            >
              <Text
                style={[
                  s.idx,
                  { fontSize: isTablet ? 14 : isSmallPhone ? 11 : 13 },
                  on && s.idxOn,
                ]}
              >
                {item.displayId}
              </Text>

              {on ? (
                <>
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{sel!.lastPos + 1}</Text>
                  </View>

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
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  boardWrap: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 14,
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
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
  },

  holeWrap: {
    position: "absolute",
  },

  node: {
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  nodeOn: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#CFCFCF",
  },

  idx: {
    color: "#111111",
    fontWeight: "700",
  },
  idxOn: {
    textDecorationLine: "underline",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  hand: {
    position: "absolute",
    bottom: -6,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  handL: {
    backgroundColor: "#2563EB",
  },
  handR: {
    backgroundColor: "#D97706",
  },
  handText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  count: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "#111111",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});