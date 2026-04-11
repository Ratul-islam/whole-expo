import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import type { PathStep } from "./PathBoardViewer";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export type ProfilePath = {
  _id: string;
  name?: string;
  path: PathStep[];
  createdAt?: string;
  boardConf?: string
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function RouteCard({
  route,
  index,
  onPress,
}: {
  route: ProfilePath;
  index: number;
  onPress: () => void;
}) {
  const scaleHook = useResponsiveScale();
  const s = useMemo(() => getResponsiveStyles(scaleHook), [scaleHook]);

  const slideIn = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 360,
        delay: index * 90,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.4)),
      }),
      Animated.timing(fadeIn, { toValue: 1, duration: 260, delay: index * 90, useNativeDriver: true }),
    ]).start();
  }, [slideIn, fadeIn, index]);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const pathPreview = useMemo(() => {
    const take = (route.path || []).slice(0, 5);
    if (!take.length) return "No steps";
    return take.map(([idx, hand]) => `${idx}${hand === 0 ? "L" : "R"}`).join(" → ");
  }, [route.path]);

  const leftCount = route.path?.filter((st) => st[1] === 0).length || 0;
  const rightCount = route.path?.filter((st) => st[1] === 1).length || 0;

  return (
    <Animated.View style={{ transform: [{ translateX: slideIn }, { scale }], opacity: fadeIn }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={s.card}>
          <View style={s.head}>
            <View style={s.iconWrap}>
              <Text style={s.icon}>🗺️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{route.name || "Untitled Route"}</Text>
              <Text style={s.date}>Created {formatDate(route.createdAt)}</Text>
            </View>

            <View style={s.btn}>
              <Text style={s.btnText}>VIEW</Text>
            </View>
          </View>

          <View style={s.preview}>
            <Text style={s.previewText} numberOfLines={1}>
              {pathPreview}{route.path?.length > 5 ? " …" : ""}
            </Text>
          </View>

          <View style={s.stats}>
            <MiniStat label="Steps" value={route.path?.length || 0} s={s} />
            <View style={s.div} />
            <MiniStat label="Left" value={leftCount} tint="#2563EB" s={s} />
            <View style={s.div} />
            <MiniStat label="Right" value={rightCount} tint="#ff0000" s={s} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MiniStat({ label, value, tint, s }: { label: string; value: string | number; tint?: string; s: any }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const getResponsiveStyles = (scale: (val: number) => number) =>
  StyleSheet.create({
    card: { 
      padding: scale(16), 
      borderRadius: scale(18), 
      borderWidth: 1, 
      borderColor: "#E3E3E3", 
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    
    head: { flexDirection: "row", alignItems: "center", gap: scale(12) },
    iconWrap: { 
      width: scale(42), 
      height: scale(42), 
      borderRadius: scale(21), 
      backgroundColor: "#F7F7F7", 
      borderWidth: 1,
      borderColor: "#D9D9D9",
      alignItems: "center", 
      justifyContent: "center" 
    },
    icon: { fontSize: scale(18) },
    name: { color: "#111111", fontSize: scale(15), fontWeight: "800", letterSpacing: -0.3 },
    date: { color: "#8A8A8A", fontSize: scale(11), fontWeight: "600", marginTop: scale(2) },

    btn: { 
      paddingVertical: scale(8), 
      paddingHorizontal: scale(14),
      borderRadius: scale(10),
      backgroundColor: "#111111"
    },
    btnText: { color: "#FFFFFF", fontSize: scale(10), fontWeight: "800", letterSpacing: 0.8 },

    preview: { 
      marginTop: scale(14), 
      paddingVertical: scale(10), 
      paddingHorizontal: scale(12), 
      borderRadius: scale(10), 
      backgroundColor: "#F7F7F7",
      borderWidth: 1,
      borderColor: "#E3E3E3"
    },
    previewText: { color: "#6B6B6B", fontSize: scale(12), fontWeight: "700" },

    stats: { marginTop: scale(14), flexDirection: "row", alignItems: "center" },
    stat: { flex: 1, alignItems: "center" },
    statVal: { color: "#111111", fontSize: scale(16), fontWeight: "800" },
    statLbl: { color: "#8A8A8A", fontSize: scale(10), fontWeight: "700", marginTop: scale(2) },
    div: { width: 1, height: scale(22), backgroundColor: "#E3E3E3" },
  });