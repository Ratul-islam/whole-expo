import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export function HomeAppBar({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={s.appBar}>
      <View>
        <Text style={s.title}>Dashboard</Text>
        <Text style={s.sub}>Play faster. Track progress.</Text>
      </View>

      <Pressable style={s.logoutIcon} onPress={onLogout}>
        <Text style={s.logoutIconText}>⎋</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  title: { color: "#fff", fontWeight: "900", fontSize: 24 },
  sub: { color: "rgba(255,255,255,0.60)", fontWeight: "700", marginTop: 4 },

  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIconText: { color: "#fff", fontWeight: "900", fontSize: 18 },
});
