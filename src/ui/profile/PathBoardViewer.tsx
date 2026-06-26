import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { ViewerToast, type ToastState } from "./pathboardViewer/viewerToast";
import { BoardPreview } from "./pathboardViewer/boardPreview";
import { PathSequence } from "./pathboardViewer/pathSequence";
import { ViewerStats } from "./pathboardViewer/viewerStats";
import { ViewerActions } from "./pathboardViewer/viewerActions";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";
import { deviceService } from "@/src/device/device.services"; // <-- ADDED

type HandBit = 0 | 1;
export type PathStep = [number, HandBit];
type ActionFn = () => Promise<any> | void;

export function PathBoardViewer({
  visible,
  path,
  pathName,
  onClose,
  context = "OWNER",
  selectedId,
  canUpload = false,
  onUpload,
  uploadLabel = "UPLOAD TO DEVICE",
  uploadBusy = false,

  canToggleLeaderboard = false,
  isPublic = false,
  onToggleLeaderboard,
  leaderboardBusy = false,

  canEdit = false,
  onEdit,
  editLabel = "EDIT",
  editBusy = false,

  canSave = false,
  isSaved = false,
  onSaveToggle,
  saveBusy = false,

  toast,
  onClearToast,
}: {
  visible: boolean;
  path: PathStep[];
  pathName: string;
  onClose: () => void;
  context?: "OWNER" | "LEADERBOARD";
  selectedId: string | any; // Safeguarded against object passing
  canUpload?: boolean;
  onUpload?: ActionFn;
  uploadLabel?: string;
  uploadBusy?: boolean;
  canToggleLeaderboard?: boolean;
  isPublic?: boolean;
  onToggleLeaderboard?: ActionFn;
  leaderboardBusy?: boolean;
  canEdit?: boolean;
  onEdit?: ActionFn;
  editLabel?: string;
  editBusy?: boolean;
  canSave?: boolean;
  isSaved?: boolean;
  onSaveToggle?: ActionFn;
  saveBusy?: boolean;
  toast?: ToastState;
  onClearToast?: () => void;
}) {
  const scale = useResponsiveScale();
  const s = useMemo(() => getViewerStyles(scale), [scale]);

  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const [localToast, setLocalToast] = useState<ToastState>(null);
  const activeToast = toast ?? localToast;

  // --- LIVE HARDWARE CAD STATE ---
  const [modules, setModules] = useState<any[]>([]);
  const [hardwareLoading, setHardwareLoading] = useState<boolean>(false);

  // SAFE ID RESOLVER: Extracts string even if parent passed full route object
  const targetDeviceId = useMemo(() => {
    if (!selectedId) return null;
    if (typeof selectedId === "object") {
      return selectedId.macAddress ?? selectedId.deviceId ?? selectedId.masterDeviceId ?? selectedId.id ?? null;
    }
    return String(selectedId);
  }, [selectedId]);


  // 1. FETCH EXACT CAD HOLE POSITIONS ON OPEN
  useEffect(() => {
    if (!visible || !targetDeviceId) {
      setModules([]);
      return;
    }

    let isMounted = true;
    const fetchHoleGeometry = async () => {
      try {
        setHardwareLoading(true);
        const res = await deviceService.get_all_connected_modules(targetDeviceId);

        console.log(res)
        const list = (res as any)?.data ?? res ?? [];
        if (isMounted) setModules(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Viewer CAD Fetch Error:", e);
      } finally {
        if (isMounted) setHardwareLoading(false);
      }
    };

    fetchHoleGeometry();
    return () => { isMounted = false; };
  }, [visible, targetDeviceId]);

  // 2. MODAL SPRING ANIMATION
  useEffect(() => {
    if (!visible) return;
    modalScale.setValue(0.8);
    modalOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, modalScale, modalOpacity]);

  useEffect(() => {
    if (!activeToast) return;
    const t = setTimeout(() => {
      if (toast) onClearToast?.();
      else setLocalToast(null);
    }, 2200);
    return () => clearTimeout(t);
  }, [activeToast, toast, onClearToast]);

  const showToast = (t: ToastState) => {
    if (toast) return;
    setLocalToast(t);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const selectionMap = useMemo(() => {
    const map = new Map<number, { positions: number[] }>();
    (path || []).forEach((step) => {
      const idx = Number(step?.[0]);
      if (!Number.isFinite(idx)) return;
      const existing = map.get(idx);
      if (!existing) map.set(idx, { positions: [idx] });
      else existing.positions.push(idx);
    });
    return map;
  }, [path]);

  const anyBusy = !!(uploadBusy || leaderboardBusy || editBusy || saveBusy || hardwareLoading);

  const safeRun = async (fn: ActionFn | undefined, start: ToastState, ok: ToastState, fail: (e: any) => ToastState) => {
    if (!fn) return;
    try {
      showToast(start);
      await fn();
      showToast(ok);
    } catch (e: any) {
      showToast(fail(e));
    }
  };

  const uploadEnabled = !!canUpload && !!onUpload && !anyBusy && modules.length > 0;
  const leaderboardEnabled = !!canToggleLeaderboard && !!onToggleLeaderboard && !anyBusy;
  const editEnabled = !!canEdit && !!onEdit && !anyBusy;
  const saveEnabled = !!canSave && !!onSaveToggle && !anyBusy;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Animated.View style={[s.modal, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={s.content}>
              <ViewerToast toast={activeToast} />

              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text style={s.statusText}>
                    Status: {hardwareLoading ? "Interrogating Hardware..." : `Online (${modules.length} Transceiver Modules)`}
                  </Text>
                  <Text style={s.title} numberOfLines={1}>
                    {pathName || "Custom Route"}
                  </Text>
                </View>

                <Pressable onPress={handleClose} style={s.closeBtn}>
                  <Text style={s.closeText}>✕</Text>
                </Pressable>
              </View>

              {/* DYNAMIC CAD CANVAS */}
              <BoardPreview modules={modules} path={path} loading={hardwareLoading} />

              <PathSequence path={path} />

              <ViewerStats
                steps={path?.length || 0}
                unique={selectionMap.size}
                leftCount={(path || []).filter((x) => x[1] === 0).length}
                rightCount={(path || []).filter((x) => x[1] === 1).length}
              />

              <ViewerActions
                context={context}
                handleClose={handleClose}
                safeRun={safeRun}
                canEdit={canEdit}
                editEnabled={editEnabled}
                onEdit={onEdit}
                editLabel={editLabel}
                editBusy={editBusy}
                canToggleLeaderboard={canToggleLeaderboard}
                leaderboardEnabled={leaderboardEnabled}
                onToggleLeaderboard={onToggleLeaderboard}
                isPublic={isPublic}
                leaderboardBusy={leaderboardBusy}
                canSave={canSave}
                saveEnabled={saveEnabled}
                onSaveToggle={onSaveToggle}
                isSaved={isSaved}
                saveBusy={saveBusy}
                uploadEnabled={uploadEnabled}
                onUpload={onUpload}
                uploadLabel={uploadLabel}
                uploadBusy={uploadBusy}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const getViewerStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: s(16) },
    modal: { borderRadius: s(22), overflow: "hidden", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9D9D9" },
    content: { padding: s(16) },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: s(14) },
    statusText: { color: "#111111", fontSize: s(12), fontWeight: "700", marginBottom: s(6) },
    title: { color: "#111111", fontWeight: "800", fontSize: s(16) },
    closeBtn: { width: s(36), height: s(36), borderRadius: s(14), backgroundColor: "#EDEDED", borderWidth: 1, borderColor: "#D9D9D9", alignItems: "center", justifyContent: "center" },
    closeText: { color: "#111111", fontSize: s(14), fontWeight: "700" },
  });