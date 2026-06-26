import React, { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from "react-native";

type HandBit = 0 | 1;
type PathStep = [number, HandBit];

export interface HolePosition {
  index: number;
  x: number;
  y: number;
}

export interface HardwareModule {
  _id: string;
  index: number;
  isActive: boolean;
  holePositions: HolePosition[];
}

type ProjectedPeg = {
  globalIndex: number;
  displayNumber: number;
  pixelX: number;
  pixelY: number;
};

export function BoardPreview({
  modules = [],
  path = [],
  loading = false,
}: {
  modules: HardwareModule[];
  path: PathStep[];
  loading?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const containerWidth = Math.min(width - (isTablet ? 72 : 40), isTablet ? 620 : 360);

  // --- CARTESIAN CAD NORMALIZER ---
  const { projectedPegs, boardWidth, boardHeight, holeSize } = useMemo(() => {
    const flat: Array<{ rawX: number; rawY: number }> = [];

    // 1. Flatten variable modules strictly sorted by hardware index
    const activeMods = [...modules]
      .filter((m) => m.isActive !== false)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    activeMods.forEach((mod) => {
      const sortedHoles = [...(mod.holePositions || [])].sort((a, b) => a.index - b.index);
      sortedHoles.forEach((hole) => {
        flat.push({ rawX: hole.x, rawY: hole.y });
      });
    });

    if (flat.length === 0) {
      return { projectedPegs: [], boardWidth: containerWidth, boardHeight: 220, holeSize: 38 };
    }

    // 2. Discover physical millimeter bounds
    const xs = flat.map((h) => h.rawX);
    const ys = flat.map((h) => h.rawY);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);

    // 3. Project millimeters onto responsive screen pixels
    const calcHoleSize = Math.min(52, Math.max(32, containerWidth / (Math.sqrt(flat.length) * 1.5)));
    const pad = calcHoleSize * 0.85;

    const availableDrawWidth = containerWidth - pad * 2;
    const physicalRatio = spanY / spanX;
    
    const boundedDrawHeight = Math.max(160, Math.min(460, availableDrawWidth * physicalRatio));
    const finalCanvasHeight = boundedDrawHeight + pad * 2;

    const pegs: ProjectedPeg[] = flat.map((item, idx) => {
      const normX = (item.rawX - minX) / spanX;
      const normY = (item.rawY - minY) / spanY;

      return {
        globalIndex: idx,
        displayNumber: idx + 1,
        pixelX: pad + normX * availableDrawWidth - calcHoleSize / 2,
        pixelY: pad + normY * boundedDrawHeight - calcHoleSize / 2,
      };
    });

    return {
      projectedPegs: pegs,
      boardWidth: containerWidth,
      boardHeight: finalCanvasHeight,
      holeSize: calcHoleSize,
    };
  }, [modules, containerWidth]);

  // Link incoming path steps to flattened global index
  const selectionMap = useMemo(() => {
    const map = new Map<number, { positions: number[]; lastPos: number; lastHand: HandBit }>();

    (path || []).forEach((step, pos) => {
      const idx = Number(step?.[0]);
      const hand = Number(step?.[1]) as HandBit;

      if (!Number.isFinite(idx) || hand !== 0 && hand !== 1) return;

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
  }, [path]);

  if (loading) {
    return (
      <View style={[s.boardWrap, { width: boardWidth, height: 220, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="small" color="#111" />
        <Text style={{ marginTop: 8, fontSize: 11, color: "#666", fontWeight: "600" }}>Rendering CAD projection...</Text>
      </View>
    );
  }

  if (projectedPegs.length === 0) {
    return (
      <View style={[s.boardWrap, { width: boardWidth, height: 160, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#999", fontSize: 12, fontWeight: "600" }}>No physical hold coordinates found.</Text>
      </View>
    );
  }

  return (
    <View style={[s.boardWrap, { width: boardWidth, height: boardHeight }]}>
      {projectedPegs.map((item) => {
        const sel = selectionMap.get(item.globalIndex);
        const on = !!sel;

        return (
          <View
            key={item.globalIndex}
            style={[s.holeWrap, { width: holeSize, height: holeSize, left: item.pixelX, top: item.pixelY }]}
          >
            <View style={[s.node, { width: holeSize, height: holeSize, borderRadius: holeSize / 2 }, on && s.nodeOn]}>
              <Text style={[s.idx, { fontSize: isTablet ? 14 : 11 }, on && s.idxOn]}>
                {item.displayNumber}
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
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  holeWrap: { position: "absolute" },
  node: { backgroundColor: "#D9D9D9", alignItems: "center", justifyContent: "center", position: "relative" },
  nodeOn: { borderWidth: 2, borderColor: "#3B82F6", backgroundColor: "#CFCFCF" },
  idx: { color: "#111111", fontWeight: "700" },
  idxOn: { textDecorationLine: "underline" },
  badge: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#111111" },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  hand: { position: "absolute", bottom: -6, paddingHorizontal: 6, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  handL: { backgroundColor: "#2563EB" },
  handR: { backgroundColor: "#ff0000" },
  handText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  count: { position: "absolute", top: -4, left: -4, backgroundColor: "#111111", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  countText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },
});