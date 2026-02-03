import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export function BottomActionBar(props: {
  visible: boolean;
  canUpload: boolean;
  onClose: () => void;
  onUpload: () => void;
}) {
  const { visible, canUpload, onClose, onUpload } = props;
  if (!visible) return null;

  return (
    <View style={s.wrap}>
      <Pressable onPress={onClose} style={s.btnGhost}>
        <Text style={s.btnGhostText}>Close</Text>
      </Pressable>

      <Pressable onPress={onUpload} disabled={!canUpload} style={[s.btn, !canUpload && { opacity: 0.45 }]}>
        <Text style={s.btnText}>{canUpload ? "Upload" : "Upload (scan device)"}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: "row",
    gap: 10,
  },
  btnGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  btnGhostText: { color: "#EAF0FF", fontWeight: "900" },
  btn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(122,162,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.35)",
  },
  btnText: { color: "#EAF0FF", fontWeight: "900" },
});
