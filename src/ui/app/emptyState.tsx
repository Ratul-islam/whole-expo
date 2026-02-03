import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 30,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  title: { color: "white", fontWeight: "700", fontSize: 15 },
  hint: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 18 },
});
