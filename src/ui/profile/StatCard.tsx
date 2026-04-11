import React, { useRef, useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export function StatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
}) {
  const scaleHook = useResponsiveScale();
  const s = useMemo(() => getResponsiveStyles(scaleHook), [scaleHook]);

  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={s.inner}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>{icon}</Text>
        </View>
        <Text style={s.value}>{value}</Text>
        <Text style={s.label}>{label}</Text>
        {subValue ? <Text style={s.sub}>{subValue}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

// --- DYNAMIC LIGHT THEME STYLES ---
const getResponsiveStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    card: { 
      width: "48%" 
    },
    inner: {
      padding: s(16),
      borderRadius: s(18),
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E3E3E3",
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    iconWrap: { 
      width: s(46), 
      height: s(46), 
      borderRadius: s(23), 
      backgroundColor: "#F7F7F7",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      justifyContent: "center", 
      alignItems: "center", 
      marginBottom: s(8) 
    },
    icon: { 
      fontSize: s(22) 
    },
    value: { 
      color: "#111111", 
      fontSize: s(22), 
      fontWeight: "800", 
      letterSpacing: -0.5 
    },
    label: { 
      color: "#6B6B6B", 
      fontSize: s(11), 
      fontWeight: "700", 
      letterSpacing: 0.5, 
      marginTop: s(4) 
    },
    sub: { 
      color: "#8A8A8A", 
      fontSize: s(10), 
      fontWeight: "600", 
      marginTop: s(2) 
    },
  });