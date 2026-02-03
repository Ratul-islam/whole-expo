import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from "react-native";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search players...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const border = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(border, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, border]);

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          borderColor: border.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(255,255,255,0.10)", "rgba(99,102,241,0.55)"],
          }),
        },
      ]}
    >
      <Text style={s.icon}>🔎</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.input}
      />
      {!!value && (
        <Pressable onPress={() => onChange("")} style={s.clear}>
          <Text style={s.clearText}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  icon: { color: "rgba(255,255,255,0.65)" },
  input: { flex: 1, paddingVertical: 12, color: "#fff", fontWeight: "700" },
  clear: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  clearText: { color: "rgba(255,255,255,0.75)", fontWeight: "900" },
});
