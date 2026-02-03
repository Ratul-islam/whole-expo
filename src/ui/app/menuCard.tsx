import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";

export function MenuCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.textWrap}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{description}</Text>
      </View>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textWrap: { flex: 1, paddingRight: 10 },
  title: { color: "white", fontSize: 16, fontWeight: "700" },
  desc: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 18 },
  chev: { color: "rgba(255,255,255,0.5)", fontSize: 28, marginLeft: 8 },
});
