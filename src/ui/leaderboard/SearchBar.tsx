import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.wrap}>
      <Text style={s.icon}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9A9A9A"
        style={s.input}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  icon: {
    color: "#6B6B6B",
    fontSize: 16,
    fontWeight: "700",
  },

  input: {
    flex: 1,
    color: "#111111",
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
});