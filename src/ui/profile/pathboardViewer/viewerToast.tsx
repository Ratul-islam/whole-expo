import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type ToastState =
  | null
  | { type: "success" | "error" | "info"; title: string; message?: string };

export function ViewerToast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  return (
    <View
      style={[
        s.toast,
        toast.type === "success" && s.toastSuccess,
        toast.type === "error" && s.toastError,
        toast.type === "info" && s.toastInfo,
      ]}
    >
      <Text style={s.toastTitle}>{toast.title}</Text>
      {toast.message ? <Text style={s.toastMsg}>{toast.message}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  toast: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  toastSuccess: {
    borderColor: "rgba(34,160,107,0.25)",
    backgroundColor: "rgba(34,160,107,0.08)",
  },
  toastError: {
    borderColor: "rgba(225,85,114,0.25)",
    backgroundColor: "rgba(225,85,114,0.08)",
  },
  toastInfo: {
    borderColor: "#D9D9D9",
    backgroundColor: "#F7F7F7",
  },
  toastTitle: {
    color: "#111111",
    fontWeight: "700",
  },
  toastMsg: {
    marginTop: 4,
    color: "#6B6B6B",
    fontWeight: "500",
    fontSize: 12,
  },
});