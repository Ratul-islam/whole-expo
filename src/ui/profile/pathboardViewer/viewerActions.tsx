import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { ToastState } from "./viewerToast";

type ActionFn = () => Promise<any> | void;

export function ViewerActions({
  context,
  handleClose,
  safeRun,

  canEdit,
  editEnabled,
  onEdit,
  editLabel,
  editBusy,

  canToggleLeaderboard,
  leaderboardEnabled,
  onToggleLeaderboard,
  isPublic,
  leaderboardBusy,

  canSave,
  saveEnabled,
  onSaveToggle,
  isSaved,
  saveBusy,

  uploadEnabled,
  onUpload,
  uploadLabel,
  uploadBusy,
}: {
  context: "OWNER" | "LEADERBOARD";
  handleClose: () => void;
  safeRun: (
    fn: ActionFn | undefined,
    start: ToastState,
    ok: ToastState,
    fail: (e: any) => ToastState
  ) => Promise<void>;

  canEdit: boolean;
  editEnabled: boolean;
  onEdit?: ActionFn;
  editLabel: string;
  editBusy: boolean;

  canToggleLeaderboard: boolean;
  leaderboardEnabled: boolean;
  onToggleLeaderboard?: ActionFn;
  isPublic: boolean;
  leaderboardBusy: boolean;

  canSave: boolean;
  saveEnabled: boolean;
  onSaveToggle?: ActionFn;
  isSaved: boolean;
  saveBusy: boolean;

  uploadEnabled: boolean;
  onUpload?: ActionFn;
  uploadLabel: string;
  uploadBusy: boolean;
}) {
  return (
    <View style={s.actionBar}>
      <Pressable onPress={handleClose} style={s.actionGhost}>
        <Text style={s.actionGhostText}>CLOSE</Text>
      </Pressable>

      {context === "OWNER" && canEdit ? (
        <Pressable
          onPress={() =>
            safeRun(
              onEdit,
              { type: "info", title: "Opening", message: "Loading editor…" },
              { type: "success", title: "Ready", message: "Editor opened." },
              (e) => ({ type: "error", title: "Could not open", message: e?.message })
            )
          }
          disabled={!editEnabled}
          style={[s.actionMidWrap, !editEnabled && { opacity: 0.55 }]}
        >
          <View style={s.actionMid}>
            <View style={s.actionInnerRow}>
              {editBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>✎</Text>}
              <Text style={[s.actionMidText, s.actionLightText]} numberOfLines={1}>
                {editLabel}
              </Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {context === "OWNER" && canToggleLeaderboard ? (
        <Pressable
          onPress={() =>
            safeRun(
              onToggleLeaderboard,
              {
                type: "info",
                title: isPublic ? "Updating" : "Uploading",
                message: isPublic ? "Making route private…" : "Publishing to leaderboard…",
              },
              {
                type: "success",
                title: isPublic ? "Made private" : "Published",
                message: isPublic ? "Route is private now." : "Route is live on leaderboard.",
              },
              (e) => ({ type: "error", title: "Update failed", message: e?.message || "Try again." })
            )
          }
          disabled={!leaderboardEnabled}
          style={[s.actionMidWrap, !leaderboardEnabled && { opacity: 0.55 }]}
        >
          <View style={[s.actionMid, isPublic ? s.actionWarn : s.actionDark]}>
            <View style={s.actionInnerRow}>
              {leaderboardBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>{isPublic ? "⤓" : "↑"}</Text>}
              <Text
                style={[
                  s.actionMidText,
                  isPublic ? s.actionWarnText : s.actionDarkText,
                ]}
                numberOfLines={1}
              >
                {isPublic ? "MAKE PRIVATE" : "UPLOAD"}
              </Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {context === "LEADERBOARD" && canSave ? (
        <Pressable
          onPress={() =>
            safeRun(
              onSaveToggle,
              {
                type: "info",
                title: isSaved ? "Removing" : "Saving",
                message: isSaved ? "Removing from saved…" : "Saving route…",
              },
              {
                type: "success",
                title: isSaved ? "Removed" : "Saved",
                message: isSaved ? "Removed from saved." : "Saved to your routes.",
              },
              (e) => ({ type: "error", title: "Failed", message: e?.message || "Try again." })
            )
          }
          disabled={!saveEnabled}
          style={[s.actionMidWrap, !saveEnabled && { opacity: 0.55 }]}
        >
          <View style={[s.actionMid, isSaved ? s.actionWarn : s.actionLight]}>
            <View style={s.actionInnerRow}>
              {saveBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>{isSaved ? "✓" : "+"}</Text>}
              <Text
                style={[
                  s.actionMidText,
                  isSaved ? s.actionWarnText : s.actionLightText,
                ]}
                numberOfLines={1}
              >
                {isSaved ? "UNSAVE" : "SAVE"}
              </Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {context === "OWNER" ? (
        <Pressable
          onPress={() =>
            safeRun(
              onUpload,
              { type: "info", title: "Uploading", message: "Sending to device…" },
              { type: "success", title: "Uploaded", message: "Route uploaded to device." },
              (e) => ({ type: "error", title: "Upload failed", message: e?.message || "Try again." })
            )
          }
          disabled={!uploadEnabled}
          style={[s.actionPrimaryWrap, !uploadEnabled && { opacity: 0.45 }]}
        >
          <View style={[s.actionPrimary, uploadEnabled ? s.actionDark : s.actionLight]}>
            <View style={s.actionInnerRow}>
              {uploadBusy ? <ActivityIndicator /> : <Text style={s.actionIcon}>⎆</Text>}
              <Text
                style={[
                  s.actionPrimaryText,
                  uploadEnabled ? s.actionDarkText : s.actionLightText,
                ]}
                numberOfLines={1}
              >
                {uploadEnabled ? uploadLabel : "SCAN DEVICE TO UPLOAD"}
              </Text>
            </View>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  actionBar: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  actionGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  actionGhostText: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  actionMidWrap: {
    flex: 1.2,
  },
  actionMid: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionPrimaryWrap: {
    flex: 2.1,
  },
  actionPrimary: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionDark: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  actionLight: {
    backgroundColor: "#EDEDED",
    borderColor: "#D9D9D9",
  },
  actionWarn: {
    backgroundColor: "rgba(225,85,114,0.08)",
    borderColor: "rgba(225,85,114,0.28)",
  },
  actionInnerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIcon: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 12,
  },
  actionMidText: {
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 12,
  },
  actionPrimaryText: {
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 12,
  },
  actionDarkText: {
    color: "#FFFFFF",
  },
  actionLightText: {
    color: "#111111",
  },
  actionWarnText: {
    color: "#C44760",
  },
});