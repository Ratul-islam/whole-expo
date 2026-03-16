import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { ViewerToast, type ToastState } from "./pathboardViewer/viewerToast";
import { normalizeBoardType, getBoardLayout, boardMeta } from "./pathboardViewer/boardConfig";
import { BoardPreview } from "./pathboardViewer/boardPreview";
import { PathSequence } from "./pathboardViewer/pathSequence";
import { ViewerStats } from "./pathboardViewer/viewerStats";
import { ViewerActions } from "./pathboardViewer/viewerActions";

type HandBit = 0 | 1;
export type PathStep = [number, HandBit];
type ActionFn = () => Promise<any> | void;

export function PathBoardViewer({
  visible,
  path,
  pathName,
  onClose,
  context = "OWNER",

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

  boardConf = "20",
}: {
  visible: boolean;
  path: PathStep[];
  pathName: string;
  onClose: () => void;

  context?: "OWNER" | "LEADERBOARD";

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

  boardConf?: string | number;
}) {
  const { width } = useWindowDimensions();

  const boardType = normalizeBoardType(boardConf);
  const layout = useMemo(() => getBoardLayout(boardType), [boardType]);
  const meta = useMemo(() => boardMeta(boardType), [boardType]);

  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const [localToast, setLocalToast] = useState<ToastState>(null);
  const activeToast = toast ?? localToast;

  useEffect(() => {
    if (!visible) return;
    modalScale.setValue(0.8);
    modalOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
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
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

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

  const anyBusy = !!(uploadBusy || leaderboardBusy || editBusy || saveBusy);

  const safeRun = async (
    fn: ActionFn | undefined,
    start: ToastState,
    ok: ToastState,
    fail: (e: any) => ToastState
  ) => {
    if (!fn) return;
    try {
      showToast(start);
      await fn();
      showToast(ok);
    } catch (e: any) {
      showToast(fail(e));
    }
  };

  const uploadEnabled = !!canUpload && !!onUpload && !anyBusy;
  const leaderboardEnabled = !!canToggleLeaderboard && !!onToggleLeaderboard && !anyBusy;
  const editEnabled = !!canEdit && !!onEdit && !anyBusy;
  const saveEnabled = !!canSave && !!onSaveToggle && !anyBusy;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={s.backdrop} onPress={handleClose}>
        <Animated.View
          style={[
            s.modal,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={s.content}>
              <ViewerToast toast={activeToast} />

              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text style={s.statusText}>
                    Status : Connected - {meta.statusSuffix}
                  </Text>
                  <Text
                    style={[
                      s.title,
                      { fontSize: isTablet ? 24 : isSmallPhone ? 18 : 22 },
                    ]}
                  >
                    {pathName || meta.title}
                  </Text>
                </View>

                <Pressable onPress={handleClose} style={s.closeBtn}>
                  <Text style={s.closeText}>✕</Text>
                </Pressable>
              </View>

              <BoardPreview boardType={boardType} layout={layout} path={path} />

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

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  statusText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  title: {
    color: "#111111",
    fontWeight: "500",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
  },
});