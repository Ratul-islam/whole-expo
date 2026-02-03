import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[s.item, active ? s.activeItem : null]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[s.text, active ? s.activeText : null]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  item: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeItem: { backgroundColor: "rgba(255,255,255,0.12)" },
  text: { color: "rgba(255,255,255,0.75)", fontWeight: "600", fontSize: 13 },
  activeText: { color: "white" },
});
