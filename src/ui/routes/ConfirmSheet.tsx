import React, { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function ConfirmSheet(props: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { visible, title, message, confirmLabel = "CONFIRM", cancelLabel = "CANCEL", onConfirm, onCancel } = props;

  const y = useRef(new Animated.Value(40)).current;
  const o = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(o, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(y, { toValue: 0, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [visible, o, y]);

  const close = () => {
    Animated.parallel([
      Animated.timing(o, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(y, { toValue: 40, duration: 140, useNativeDriver: true }),
    ]).start(() => onCancel());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={s.backdrop} onPress={close}>
        <Animated.View style={[s.sheet, { opacity: o, transform: [{ translateY: y }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={s.card}>
              <Text style={s.title}>{title}</Text>
              {!!message && <Text style={s.msg}>{message}</Text>}

              <View style={s.row}>
                <Pressable onPress={close} style={s.btnGhost}>
                  <Text style={s.btnGhostText}>{cancelLabel}</Text>
                </Pressable>

                <Pressable onPress={onConfirm} style={s.btnDanger}>
                  <Text style={s.btnDangerText}>{confirmLabel}</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
    padding: 16,
  },
  sheet: { width: "100%" },

  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(8,10,16,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  title: {
    color: "#EAF0FF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.0,
  },
  msg: {
    marginTop: 8,
    color: "rgba(255,255,255,0.70)",
    fontWeight: "700",
    lineHeight: 18,
  },

  row: { flexDirection: "row", gap: 10, marginTop: 14 },

  btnGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnGhostText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.1 },

  btnDanger: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.18)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.34)",
  },
  btnDangerText: { color: "#FFD6DE", fontWeight: "900", letterSpacing: 1.1 },
});
