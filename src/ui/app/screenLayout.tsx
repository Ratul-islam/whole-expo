import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.body}>{children}</View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F1A" },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "white" },
  subtitle: { marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.7)" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});
