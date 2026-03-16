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
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { pathService } from "@/src/path/path.services";
import { PathBoard, type PathStep } from "@/src/ui/routes/pathBoard";
import { router, useLocalSearchParams } from "expo-router";

type EditRouteDTO = {
  _id: string;
  name: string;
  path: PathStep[];
  isPublic?: boolean;
  boardConf?: string | number;
};

type BoardPreset = {
  label: string;
  value: "10" | "20";
};

const BOARD_PRESETS: BoardPreset[] = [
  { label: "NextPeg Lite", value: "10" },
  { label: "NextPeg", value: "20" },
];

function normalizeBoardConf(value?: string | number): "10" | "20" {
  const v = String(value ?? "").trim().toLowerCase();

  if (v === "10" || v === "2x5" || v.includes("lite")) return "10";
  if (v === "20" || v === "4x5" || v.includes("nextpeg") || v.includes("full")) return "20";

  return "20";
}

export default function RouteEditorVisualScreen() {
  const params = useLocalSearchParams<{ pathId?: string }>();
  const pathId = typeof params?.pathId === "string" ? params.pathId : undefined;
  const isEdit = !!pathId;

  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const isTablet = width >= 768;

  const [name, setName] = useState("");
  const [path, setPath] = useState<PathStep[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [boardConf, setBoardConf] = useState<"10" | "20">("20");

  const [bootLoading, setBootLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const stepsCount = path.length;

  const summary = useMemo(() => {
    if (!stepsCount) return "No steps yet.";
    const last = path[path.length - 1];
    return `Last: ${last[0] + 1}${last[1] === 0 ? "L" : "R"} • Total: ${stepsCount}`;
  }, [path, stepsCount]);

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        setBootLoading(true);

        const res = await pathService.getAllPath();
        const raw = (res as any)?.data ?? (res as any) ?? [];
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.list)
          ? raw.list
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        const found: EditRouteDTO | undefined = list.find(
          (x: any) => String(x?._id ?? x?.id) === String(pathId)
        );

        if (!found) {
          Alert.alert("Not found", "Could not find this route.");
          router.back();
          return;
        }

        setName(found.name ?? "");
        setPath((found.path ?? []) as PathStep[]);
        setIsPublic(!!found.isPublic);
        setBoardConf(normalizeBoardConf(found.boardConf));
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load route.");
        router.back();
      } finally {
        setBootLoading(false);
      }
    };

    load();
  }, [isEdit, pathId]);

  const onSelectBoard = (next: "10" | "20") => {
    if (next === boardConf) return;
    setBoardConf(next);
    setPath([]);
  };

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
          boardConf,
        });

        Alert.alert("Updated", "Route updated successfully.", [
          { text: "OK", onPress: () => router.push("/(app)/my-routes") },
        ]);
        return;
      }

      await pathService.addNewPath({
        name: trimmed,
        path,
        isPublic,
        boardConf,
      } as any);

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
          <Text style={[ui.brand, { fontSize: isTablet ? 24 : 22 }]}>
            Route Forge
          </Text>
          <Text style={ui.subtitle}>
            {isEdit
              ? "Edit your route and update it."
              : "Build a sequence and save it."}
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
      <ScrollView>

      <View style={ui.panel}>
        <View style={ui.panelTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>ROUTE NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Warmup L/R"
              placeholderTextColor="#A5A5A5"
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
              {bootLoading
                ? "LOADING"
                : stepsCount
                ? isEdit
                  ? "EDITING"
                  : "BUILDING"
                : "IDLE"}
            </Text>
          </View>
        </View>

        <View style={ui.boardRow}>
          <Text style={ui.label}>BOARD TYPE</Text>

          <View style={ui.boardPills}>
            {BOARD_PRESETS.map((preset) => {
              const active = preset.value === boardConf;

              return (
                <Pressable
                  key={preset.value}
                  onPress={() => onSelectBoard(preset.value)}
                  disabled={saving || bootLoading}
                  style={({ pressed }) => [
                    ui.boardPill,
                    active && ui.boardPillOn,
                    pressed && { opacity: 0.9 },
                    (saving || bootLoading) && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[ui.boardPillText, active && ui.boardPillTextOn]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={ui.boardHint}>
            Switching board type will clear the current route.
          </Text>
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
            <Text style={[ui.badgeText, isPublic ? ui.badgeTextOn : ui.badgeTextOff]}>
              {isPublic ? "PUBLIC" : "PRIVATE"}
            </Text>
          </View>
        </Pressable>

        <Text style={ui.summary}>{summary}</Text>

        {bootLoading ? (
          <View style={ui.loadingRow}>
            <ActivityIndicator color="#111111" />
            <Text style={ui.loadingText}>Loading route…</Text>
          </View>
        ) : null}
      </View>

      <PathBoard
        boardConf={boardConf}
        path={path}
        onChangePath={setPath}
        title="BOARD"
        hint="Tap a hold → add Left/Right. Repeat holds allowed."
        allowMultiple
        />

      <View style={ui.footer}>
        <Text style={ui.footerTitle}>TIP</Text>
        <Text style={ui.footerHint}>
          You can reuse the same hold multiple times to create patterns.
        </Text>
      </View>
        </ScrollView>
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
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 4,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#111111",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  panel: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  label: {
    color: "#6B6B6B",
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 12,
  },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFFFFF",
    color: "#111111",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "600",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hudKey: {
    color: "#7A7A7A",
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 11,
  },

  hudVal: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 14,
  },

  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(225,85,114,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.28)",
  },

  clearText: {
    color: "#C44760",
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 12,
  },

  summary: {
    marginTop: 10,
    color: "#444444",
    fontWeight: "600",
  },

  footer: {
    marginTop: 14,
    marginBottom:40,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  footerTitle: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  footerHint: {
    marginTop: 6,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  panelTopRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  toggleRow: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  toggleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  checkBoxOn: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  checkMark: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 16,
  },

  toggleTitle: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  toggleHint: {
    marginTop: 3,
    color: "#6B6B6B",
    fontWeight: "500",
    fontSize: 12,
  },

  badge: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },

  badgeOn: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  badgeOff: {
    backgroundColor: "#EDEDED",
    borderColor: "#D9D9D9",
  },

  badgeText: {
    fontWeight: "700",
    letterSpacing: 0.8,
    fontSize: 11,
  },

  badgeTextOn: {
    color: "#FFFFFF",
  },

  badgeTextOff: {
    color: "#444444",
  },

  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "#6B6B6B",
    fontWeight: "500",
  },

  boardRow: {
    marginTop: 12,
    gap: 10,
  },

  boardPills: {
    flexDirection: "row",
    gap: 10,
  },

  boardPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  boardPillOn: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  boardPillText: {
    color: "#444444",
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  boardPillTextOn: {
    color: "#FFFFFF",
  },

  boardHint: {
    marginTop: 2,
    color: "#7A7A7A",
    fontWeight: "500",
    fontSize: 12,
  },
});