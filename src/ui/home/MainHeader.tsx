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

const ui = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  brand: {
    color: "#111111",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 1,
  },

  subtitle: {
    color: "#6B6B6B",
    fontWeight: "600",
    marginTop: 2,
  },

  right: {
    alignItems: "flex-end",
  },

  miniTag: {
    color: "#8A8A8A",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.8,
  },

  logoutBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  logoutText: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 14,
  },
});