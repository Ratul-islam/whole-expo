import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export function MainHeader({
  deviceText,
  onLogout,
}: {
  deviceText: string;
  onLogout: () => void;
}) {
  return (
    <View style={ui.headerRow}>
      <View>
        <Text style={ui.brand}>CLIMB</Text>
        <Text style={ui.subtitle}>Dashboard</Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={ui.miniTag}>{deviceText}</Text>
        <Pressable onPress={onLogout} style={ui.logoutBtn}>
          <Text style={ui.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const ui = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  brand: {
    color: "#EAF0FF",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 1.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "800",
    marginTop: 2,
  },
  miniTag: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "900",
    letterSpacing: 0.8,
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  logoutText: { color: "#EAF0FF", fontWeight: "900" },
});
