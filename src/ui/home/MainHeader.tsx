import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

export function MainHeader({
  deviceText,
  onLogout,
}: {
  deviceText: string;
  onLogout: () => void;
}) {
  const scaleHook = useResponsiveScale();
  const ui = useMemo(() => getHeaderStyles(scaleHook), [scaleHook]);

  return (
    <View style={ui.headerRow}>
      <View>
        <Text style={ui.brand}>CLIMB</Text>
        <Text style={ui.subtitle}>Dashboard</Text>
      </View>

      <View style={ui.right}>
        <Text style={ui.miniTag}>{deviceText}</Text>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            ui.logoutBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={ui.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getHeaderStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    headerRow: {
      marginTop: s(6),
      marginBottom: s(18),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    brand: {
      color: "#111111",
      fontWeight: "900",
      fontSize: s(14),
      letterSpacing: 1,
    },

    subtitle: {
      color: "#6B6B6B",
      fontWeight: "600",
      marginTop: s(2),
      fontSize: s(11),
    },

    right: {
      alignItems: "flex-end",
    },

    miniTag: {
      color: "#8A8A8A",
      fontWeight: "700",
      fontSize: s(10),
      letterSpacing: 0.8,
    },

    logoutBtn: {
      marginTop: s(8),
      paddingVertical: s(8),
      paddingHorizontal: s(14),
      borderRadius: s(12),
      backgroundColor: "#EDEDED",
      borderWidth: 1,
      borderColor: "#D9D9D9",
    },

    logoutText: {
      color: "#111111",
      fontWeight: "700",
      fontSize: s(11),
    },
  });