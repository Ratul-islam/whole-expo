import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export function BottomActionBar(props: {
  visible: boolean;
  canUpload: boolean;
  onClose: () => void;
  onUpload: () => void;
}) {
  const { visible, canUpload, onClose, onUpload } = props;
  const { width } = useWindowDimensions();

  if (!visible) return null;

  const isTablet = width >= 768;

  return (
    <View style={[s.wrap, { paddingHorizontal: isTablet ? 24 : 16 }]}>
      <Pressable onPress={onClose} style={s.btnGhost}>
        <Text style={s.btnGhostText}>Close</Text>
      </Pressable>

      <Pressable
        onPress={onUpload}
        disabled={!canUpload}
        style={[s.btnPrimary, !canUpload && s.btnDisabled]}
      >
        <Text style={s.btnPrimaryText}>
          {canUpload ? "Upload" : "Upload (scan device)"}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    flexDirection: "row",
    gap: 10,
  },

  btnGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  btnGhostText: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 15,
  },

  btnPrimary: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
  },

  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  btnDisabled: {
    opacity: 0.45,
  },
});