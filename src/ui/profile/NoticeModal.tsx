import React from "react";
import { Modal, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function NoticeModal(props: {
  visible: boolean;
  title: string;
  message?: string;
  primaryText?: string;
  onPrimary?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  loading?: boolean;
}) {
  const {
    visible,
    title,
    message,
    primaryText = "OK",
    onPrimary,
    secondaryText,
    onSecondary,
    loading,
  } = props;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={s.backdrop} onPress={onSecondary || onPrimary}>
        <Pressable onPress={(e) => e.stopPropagation()} style={s.card}>
          <LinearGradient colors={["#141428", "#0B0B12"]} style={s.inner}>
            <Text style={s.title}>{title}</Text>
            {message ? <Text style={s.msg}>{message}</Text> : null}

            <View style={s.row}>
              {secondaryText ? (
                <Pressable onPress={onSecondary} style={s.btnGhost} disabled={!!loading}>
                  <Text style={s.btnGhostText}>{secondaryText}</Text>
                </Pressable>
              ) : null}

              <Pressable onPress={onPrimary} style={s.btn} disabled={!!loading}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} style={s.btnGrad}>
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={s.btnText}>{primaryText}</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
  },
  inner: { padding: 16 },
  title: { color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 1.2 },
  msg: { marginTop: 8, color: "rgba(255,255,255,0.70)", fontWeight: "700", lineHeight: 20 },
  row: { marginTop: 14, flexDirection: "row", gap: 10, justifyContent: "flex-end" },

  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnGhostText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.8 },

  btn: { borderRadius: 14, overflow: "hidden" },
  btnGrad: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "900", letterSpacing: 1 },
});
