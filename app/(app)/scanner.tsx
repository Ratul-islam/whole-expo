import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform, ActivityIndicator, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { sessionService } from "@/src/session/session.services";

// Updated Type: deviceSecret and boardConf are now optional 
// since the new backend only requires deviceId
type DeviceQr = {
  type: "device";
  deviceId: string;
  v: 1;
  deviceSecret?: string;
  boardConf?: "20" | "10";
};

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function parseDeviceQr(raw: string): { ok: true; value: DeviceQr } | { ok: false; reason: string } {
  const s = String(raw ?? "").trim();
  if (!s) return { ok: false, reason: "Wrong QR code." };

  if (/^https?:\/\//i.test(s)) return { ok: false, reason: "Wrong QR code." };
  
  const parsed = safeJsonParse(s);
  if (!parsed || typeof parsed !== "object") return { ok: false, reason: "Wrong QR code." };
  
  const obj = parsed as Record<string, unknown>;
  
  if (obj.type !== "device") return { ok: false, reason: "Wrong QR code." };
  if (obj.v !== 1) return { ok: false, reason: "Unsupported QR version." };
  
  // We now only strictly validate the deviceId presence
  if (!isNonEmptyString(obj.deviceId)) return { ok: false, reason: "Invalid device QR." };
  
  const deviceId = obj.deviceId.trim();
  
  if (deviceId.length < 3) return { ok: false, reason: "Invalid device QR." };
  
  return { 
    ok: true, 
    value: { 
      type: "device", 
      deviceId, 
      v: 1,
      deviceSecret: isNonEmptyString(obj.deviceSecret) ? obj.deviceSecret : undefined,
      boardConf: (obj.boardConf === "20" || obj.boardConf === "10") ? obj.boardConf : undefined
    } 
  };
}

function extractApiErrorMessage(err: any) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed. Please try again.";
  return String(msg);
}

type PopupState =
  | { open: false }
  | { open: true; title: string; message: string; tone: "error" | "info" };

export default function Scanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const [busy, setBusy] = useState(false);
  const scanLockRef = useRef(false);

  const [popup, setPopup] = useState<PopupState>({ open: false });

  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canScan = useMemo(
    () => permission?.granted && !busy && !scanLockRef.current && !popup.open,
    [permission?.granted, busy, popup.open]
  );

  const resetScan = () => {
    scanLockRef.current = false;
    setBusy(false);
    setPopup({ open: false });
  };

  const showErrorPopup = (message: string, title = "Scan failed") => {
    setBusy(false);
    setPopup({ open: true, title, message, tone: "error" });
  };

  const onBarcodeScanned = async ({ data }: { data: any }) => {
    if (!canScan) return;

    scanLockRef.current = true;

    const parsed = parseDeviceQr(String(data ?? ""));
    if (!parsed.ok) {
      showErrorPopup(parsed.reason, "Wrong QR");
      return;
    }

    setBusy(true); // Show "Connecting..." overlay
    try {
      // UPDATED: Only sending the deviceId as expected by the new backend
      await sessionService.start({
        deviceId: parsed.value.deviceId,
      });

      // The new backend handles the session creation and MQTT verification.
      // Once it returns success (or "already connected"), we safely route back.
      router.back();
    } catch (err: any) {
      const msg = extractApiErrorMessage(err);
      showErrorPopup(msg, "Connection error");
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#B48CFF" />
        <Text style={styles.centerText}>Preparing camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>Camera access required</Text>
        <Text style={styles.permissionHint}>Enable camera permission to scan the DEVICE QR.</Text>

        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      <View style={styles.hud}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backText}>BACK</Text>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>DEVICE SCAN</Text>
            <Text style={styles.subtitle}>{Platform.OS === "ios" ? "iOS" : "Android"}</Text>
          </View>

          <View style={[styles.statePill, busy ? styles.pillBusy : styles.pillReady]}>
            <Text style={styles.statePillText}>{busy ? "CONNECTING" : "READY"}</Text>
          </View>
        </View>

        <View style={styles.frameWrap}>
          <View style={styles.frameOuter}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>INSTRUCTIONS</Text>
          <Text style={styles.panelText}>Scan the device QR to connect.</Text>

          <View style={styles.btnRow}>
            <Pressable style={styles.secondaryBtn} onPress={resetScan} disabled={busy}>
              <Text style={styles.secondaryBtnText}>{busy ? "Please wait…" : "Reset"}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* FULL SCREEN LOADING OVERLAY */}
      {busy && !popup.open && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#B48CFF" />
            <Text style={styles.loadingCardText}>Connecting to device...</Text>
          </View>
        </View>
      )}

      {/* ERROR MODAL */}
      <Modal visible={popup.open} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {popup.open && (
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{popup.title}</Text>
              </View>

              <Text style={styles.modalMessage}>{popup.message}</Text>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={resetScan}
                >
                  <Text style={styles.modalBtnPrimaryText}>SCAN AGAIN</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { ...StyleSheet.absoluteFillObject },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#070712" },
  centerText: { marginTop: 12, color: "rgba(255,255,255,0.75)", fontWeight: "800" },
  permissionTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  permissionHint: { marginTop: 8, color: "rgba(255,255,255,0.7)", fontWeight: "700", textAlign: "center" },

  hud: { flex: 1, padding: 16, justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.30)" },

  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  backText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1 },
  titleWrap: { flex: 1 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 1.2 },
  subtitle: { marginTop: 4, color: "rgba(255,255,255,0.55)", fontWeight: "800", fontSize: 12 },

  statePill: { height: 38, paddingHorizontal: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  statePillText: { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  pillReady: { borderColor: "rgba(130,170,255,0.35)", backgroundColor: "rgba(130,170,255,0.10)" },
  pillBusy: { borderColor: "rgba(255,200,120,0.35)", backgroundColor: "rgba(255,200,120,0.10)" },

  frameWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  frameOuter: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },
  cornerTL: { position: "absolute", top: -2, left: -2, width: 46, height: 46, borderTopWidth: 3, borderLeftWidth: 3, borderColor: "rgba(180, 140, 255, 0.9)", borderTopLeftRadius: 18 },
  cornerTR: { position: "absolute", top: -2, right: -2, width: 46, height: 46, borderTopWidth: 3, borderRightWidth: 3, borderColor: "rgba(180, 140, 255, 0.9)", borderTopRightRadius: 18 },
  cornerBL: { position: "absolute", bottom: -2, left: -2, width: 46, height: 46, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: "rgba(180, 140, 255, 0.9)", borderBottomLeftRadius: 18 },
  cornerBR: { position: "absolute", bottom: -2, right: -2, width: 46, height: 46, borderBottomWidth: 3, borderRightWidth: 3, borderColor: "rgba(180, 140, 255, 0.9)", borderBottomRightRadius: 18 },

  panel: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(10, 10, 20, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(180, 140, 255, 0.18)",
  },
  panelTitle: { color: "rgba(255,255,255,0.6)", fontWeight: "900", letterSpacing: 1.6, fontSize: 11 },
  panelText: { marginTop: 8, color: "#fff", fontWeight: "800", lineHeight: 20 },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: {
    marginTop: 14,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(180, 140, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(180, 140, 255, 0.35)",
  },
  primaryBtnText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1 },

  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: "rgba(10, 10, 20, 0.95)",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(180, 140, 255, 0.35)",
    alignItems: "center",
    gap: 16,
  },
  loadingCardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(12,12,22,0.98)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modalHeader: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: { color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 0.6 },
  modalMessage: { color: "rgba(255,255,255,0.75)", fontWeight: "800", lineHeight: 20 },

  modalActions: { marginTop: 14, flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  modalBtnPrimary: {
    backgroundColor: "rgba(180, 140, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(180, 140, 255, 0.35)",
  },
  modalBtnPrimaryText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.2 },
});