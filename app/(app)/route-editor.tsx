import React, { useEffect, useMemo, useState } from "react";
import { ScreenLayout } from "@/src/ui/app/screenLayout";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { pathService } from "@/src/path/path.services";
import { PathBoard, type PathStep } from "@/src/ui/routes/pathBoard";
import { router, useLocalSearchParams } from "expo-router";

type EditRouteDTO = {
  _id: string;
  name: string;
  path: PathStep[];
  isPublic?: boolean;
};

export default function RouteEditorVisualScreen() {
  const params = useLocalSearchParams<{ pathId?: string }>();
  const pathId = typeof params?.pathId === "string" ? params.pathId : undefined;

  const isEdit = !!pathId;

  const [name, setName] = useState("");
  const [path, setPath] = useState<PathStep[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [bootLoading, setBootLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const stepsCount = path.length;

  const summary = useMemo(() => {
    if (!stepsCount) return "No steps yet.";
    const last = path[path.length - 1];
    return `Last: ${last[0]}${last[1] === 0 ? "L" : "R"} • Total: ${stepsCount}`;
  }, [path, stepsCount]);

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        setBootLoading(true);

        const res = await pathService.getAllPath();

        const list = (res as any)?.data ?? (res as any) ?? [];
        const found: EditRouteDTO | undefined = Array.isArray(list)
          ? list.find((x: any) => String(x?._id) === String(pathId))
          : undefined;

        if (!found) {
          Alert.alert("Not found", "Could not find this route.");
          router.back();
          return;
        }

        setName(found.name ?? "");
        setPath((found.path ?? []) as any);
        setIsPublic(!!found.isPublic);
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load route.");
        router.back();
      } finally {
        setBootLoading(false);
      }
    };

    load();
  }, [isEdit, pathId]);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Give this route a name.");
      return;
    }
    if (!path.length) {
      Alert.alert("Empty route", "Tap nodes to build a route first.");
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        await (pathService as any).updatePath?.({
          pathId,
          name: trimmed,
          path,
          isPublic,
        });

        Alert.alert("Updated", "Route updated successfully.", [
          { text: "OK", onPress: () => router.push("/(app)/my-routes") },
        ]);
        return;
      }

      await pathService.addNewPath({ name: trimmed, path, isPublic } as any);

      Alert.alert("Saved", "Route saved successfully.", [
        { text: "OK", onPress: () => router.push("/(app)/my-routes") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not save route.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="" subtitle="">
      <View style={ui.header}>
        <View style={{ flex: 1 }}>
          <Text style={ui.brand}>ROUTE FORGE</Text>
          <Text style={ui.subtitle}>
            {isEdit ? "Edit your route and republish it." : "Build a sequence like a combo."}
          </Text>
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving || bootLoading}
          style={({ pressed }) => [
            ui.saveBtn,
            (pressed || saving || bootLoading) && { opacity: 0.85 },
            (saving || bootLoading) && { opacity: 0.6 },
          ]}
        >
          <Text style={ui.saveText}>{isEdit ? "UPDATE" : "SAVE"}</Text>
        </Pressable>
      </View>

      <View style={ui.panel}>
        <View style={ui.panelTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>ROUTE NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Warmup L/R"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={ui.input}
            />
          </View>

          <Pressable
            onPress={() => setPath([])}
            disabled={saving || bootLoading}
            style={({ pressed }) => [
              ui.clearBtn,
              pressed && { opacity: 0.85 },
              (saving || bootLoading) && { opacity: 0.6 },
            ]}
          >
            <Text style={ui.clearText}>CLEAR</Text>
          </Pressable>
        </View>

        <View style={ui.hudRow}>
          <View style={ui.hudPill}>
            <Text style={ui.hudKey}>STEPS</Text>
            <Text style={ui.hudVal}>{stepsCount}</Text>
          </View>

          <View style={ui.hudPill}>
            <Text style={ui.hudKey}>STATUS</Text>
            <Text style={ui.hudVal}>
              {bootLoading ? "LOADING" : stepsCount ? (isEdit ? "EDITING" : "BUILDING") : "IDLE"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setIsPublic((v) => !v)}
          disabled={saving || bootLoading}
          style={({ pressed }) => [
            ui.toggleRow,
            pressed && { opacity: 0.9 },
            (saving || bootLoading) && { opacity: 0.6 },
          ]}
        >
          <View style={ui.toggleLeft}>
            <View style={[ui.checkBox, isPublic && ui.checkBoxOn]}>
              {isPublic ? <Text style={ui.checkMark}>✓</Text> : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={ui.toggleTitle}>Upload to Leaderboard</Text>
              <Text style={ui.toggleHint}>
                {isPublic
                  ? "Public — others can challenge or use it."
                  : "Private — only you can use it."}
              </Text>
            </View>
          </View>

          <View style={[ui.badge, isPublic ? ui.badgeOn : ui.badgeOff]}>
            <Text style={ui.badgeText}>{isPublic ? "PUBLIC" : "PRIVATE"}</Text>
          </View>
        </Pressable>

        <Text style={ui.summary}>{summary}</Text>

        {bootLoading ? (
          <View style={ui.loadingRow}>
            <ActivityIndicator />
            <Text style={ui.loadingText}>Loading route…</Text>
          </View>
        ) : null}
      </View>

      <PathBoard
        rows={4}
        cols={5}
        path={path}
        onChangePath={setPath}
        title="BOARD"
        hint="Tap a node → add Left/Right. Repeat nodes allowed."
        allowMultiple={true}
      />

      <View style={ui.footer}>
        <Text style={ui.footerTitle}>TIP</Text>
        <Text style={ui.footerHint}>
          You can reuse the same node multiple times to create patterns.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const ui = StyleSheet.create({
  header: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  brand: {
    color: "#EAF0FF",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 1.6,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "800",
  },

  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(122,162,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.40)",
  },
  saveText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.2 },

  panel: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },

  label: {
    color: "rgba(255,255,255,0.60)",
    fontWeight: "900",
    letterSpacing: 1.1,
    fontSize: 12,
  },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.22)",
    color: "#EAF0FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "800",
  },

  hudRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  hudPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudKey: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "900",
    letterSpacing: 1.0,
    fontSize: 11,
  },
  hudVal: { color: "#EAF0FF", fontWeight: "900", fontSize: 14 },

  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,92,122,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,92,122,0.35)",
  },
  clearText: { color: "#FFD6DE", fontWeight: "900", letterSpacing: 1.1, fontSize: 12 },

  summary: {
    marginTop: 10,
    color: "rgba(255,255,255,0.70)",
    fontWeight: "800",
  },

  footer: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  footerTitle: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.2 },
  footerHint: { marginTop: 6, color: "rgba(255,255,255,0.65)", fontWeight: "800" },

  panelTopRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },

  toggleRow: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  toggleLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },

  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },

  checkBoxOn: {
    backgroundColor: "rgba(122,162,255,0.25)",
    borderColor: "rgba(122,162,255,0.55)",
  },

  checkMark: { color: "#EAF0FF", fontWeight: "900", fontSize: 14, lineHeight: 16 },

  toggleTitle: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 0.6 },

  toggleHint: { marginTop: 3, color: "rgba(255,255,255,0.65)", fontWeight: "800", fontSize: 12 },

  badge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1 },

  badgeOn: { backgroundColor: "rgba(122,162,255,0.18)", borderColor: "rgba(122,162,255,0.40)" },

  badgeOff: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" },

  badgeText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.1, fontSize: 11 },

  loadingRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { color: "rgba(255,255,255,0.70)", fontWeight: "800" },
});