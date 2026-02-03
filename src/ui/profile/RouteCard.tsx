import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PathStep } from "./PathBoardViewer";

export type ProfilePath = {
  _id: string;
  name?: string;
  path: PathStep[];
  createdAt?: string;
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

  const leftCount = route.path?.filter((s) => s[1] === 0).length || 0;
  const rightCount = route.path?.filter((s) => s[1] === 1).length || 0;

  return (
    <Animated.View style={{ transform: [{ translateX: slideIn }, { scale }], opacity: fadeIn }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <LinearGradient colors={["rgba(139, 92, 246, 0.10)", "rgba(99, 102, 241, 0.05)"]} style={s.card}>
          <View style={s.head}>
            <View style={s.iconWrap}>
              <Text style={s.icon}>🗺️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{route.name || "Untitled Route"}</Text>
              <Text style={s.date}>Created {formatDate(route.createdAt)}</Text>
            </View>

            <View style={s.btnWrap}>
              <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={s.btn}>
                <Text style={s.btnText}>VIEW</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={s.preview}>
            <Text style={s.previewText} numberOfLines={1}>
              {pathPreview}{route.path?.length > 5 ? " …" : ""}
            </Text>
          </View>

          <View style={s.stats}>
            <MiniStat label="Steps" value={route.path?.length || 0} />
            <Div />
            <MiniStat label="Left" value={leftCount} tint="#3B82F6" />
            <Div />
            <MiniStat label="Right" value={rightCount} tint="#F59E0B" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function MiniStat({ label, value, tint }: { label: string; value: string | number; tint?: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statVal, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}
function Div() {
  return <View style={s.div} />;
}

const s = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(139, 92, 246, 0.20)" },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(139, 92, 246, 0.18)", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 22 },
  name: { color: "#fff", fontSize: 16, fontWeight: "900" },
  date: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "700", marginTop: 2 },

  btnWrap: { borderRadius: 10, overflow: "hidden" },
  btn: { paddingVertical: 8, paddingHorizontal: 14 },
  btnText: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 1 },

  preview: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.26)" },
  previewText: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: "800" },

  stats: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center" },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "900" },
  statLbl: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "800", marginTop: 2 },
  div: { width: 1, height: 22, backgroundColor: "rgba(255,255,255,0.10)" },
});
