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
import { deviceService } from "@/src/device/device.services";
import { PathBoard, type PathStep, type HardwareModule } from "@/src/ui/routes/pathBoard";
import { router, useLocalSearchParams } from "expo-router";
import { useResponsiveScale } from "@/hooks/useResponsiveScale";

type EditRouteDTO = {
  _id: string;
  name: string;
  path: PathStep[];
  isPublic?: boolean;
  macAddress?: string;
};

export default function RouteEditorVisualScreen() {
  const params = useLocalSearchParams<{ pathId?: string; macAddress?: string }>();

  const pathId = typeof params?.pathId === "string" ? params.pathId : undefined;
  const passedMac = typeof params?.macAddress === "string" ? params.macAddress : undefined;

  const isEdit = !!pathId;

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const scale = useResponsiveScale();
  const ui = useMemo(() => getResponsiveStyles(scale), [scale]);

  const [name, setName] = useState("");
  const [path, setPath] = useState<PathStep[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [activeMac, setActiveMac] = useState<string | undefined>(passedMac);
  const [modules, setModules] = useState<HardwareModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);

  const [bootLoading, setBootLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const stepsCount = path.length;

  // ACCURATELY COUNTS TOTAL PEGS ACROSS ALL VARIABLE MODULES:
  const totalPhysicalPegs = useMemo(() => {
    return modules.reduce((acc, curr) => acc + (curr.holePositions?.length || 0), 0);
  }, [modules]);

  const summary = useMemo(() => {
    if (!stepsCount) return "No steps yet.";
    const last = path[path.length - 1];
    return `Last Hold: #${last[0] + 1} (${last[1] === 0 ? "L" : "R"}) • Total: ${stepsCount}`;
  }, [path, stepsCount]);

  // 1. FETCH DYNAMIC HARDWARE MODULES
  useEffect(() => {
    if (!activeMac) {
      setModulesLoading(false);
      return;
    }

    const loadHardwareLayout = async () => {
      try {
        setModulesLoading(true);
        const res = await deviceService.get_all_connected_modules(activeMac);
        const rawList = (res as any)?.data ?? res ?? [];
        setModules(Array.isArray(rawList) ? rawList : []);
      } catch (e) {
        Alert.alert("Hardware Error", "Could not read peg positions from device.");
      } finally {
        setModulesLoading(false);
      }
    };

    loadHardwareLayout();
  }, [activeMac]);

  // 2. LOAD EXISTING ROUTE (If Editing)
  useEffect(() => {
    if (!isEdit) return;

    const loadRoute = async () => {
      try {
        setBootLoading(true);
        const res = await pathService.getAllPath();
        const raw = (res as any)?.data ?? (res as any) ?? [];
        const list = Array.isArray(raw) ? raw : raw?.list ?? raw?.data ?? [];

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
        if (found.macAddress && !activeMac) {
          setActiveMac(found.macAddress);
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load route.");
        router.back();
      } finally {
        setBootLoading(false);
      }
    };

    loadRoute();
  }, [isEdit, pathId]);

  const onSave = async () => {
    const trimmed = name.trim();

    if (!trimmed) return Alert.alert("Name required", "Give this route a name.");
    if (trimmed.length > 16) return Alert.alert("Limit exceeded", "Max 16 characters.");
    if (!path.length) return Alert.alert("Empty route", "Tap holds to build a sequence.");
    if (!activeMac) return Alert.alert("No Device", "Cannot save a route without a target MAC.");

    try {
      setSaving(true);

      const payload = {
        name: trimmed,
        path,
        isPublic,
        macAddress: activeMac,
      };

      if (isEdit) {
        await (pathService as any).updatePath?.({ pathId, ...payload });
        Alert.alert("Updated", "Route updated successfully.", [{ text: "OK", onPress: () => router.back() }]);
        return;
      }

      await pathService.addNewPath(payload as any);
      Alert.alert("Saved", "Route saved successfully.", [{ text: "OK", onPress: () => router.back() }]);
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
          <Text style={[ui.brand, { fontSize: isTablet ? scale(20) : scale(16) }]}>Route Forge</Text>
          <Text style={ui.subtitle}>
            {isEdit ? "Edit sequence for this layout." : "Map sequence to live hardware."}
          </Text>
        </View>

        <Pressable
          onPress={onSave}
          disabled={saving || bootLoading || modulesLoading || !totalPhysicalPegs}
          style={({ pressed }) => [
            ui.saveBtn,
            (pressed || saving) && { opacity: 0.85 },
            (!totalPhysicalPegs || saving) && { opacity: 0.4 },
          ]}
        >
          <Text style={ui.saveText}>{isEdit ? "UPDATE" : "SAVE"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={ui.panel}>
          <View style={ui.panelTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={ui.label}>ROUTE NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Dyno Slap"
                placeholderTextColor="#A5A5A5"
                style={ui.input}
              />
            </View>

            <Pressable onPress={() => setPath([])} style={ui.clearBtn}>
              <Text style={ui.clearText}>CLEAR</Text>
            </Pressable>
          </View>

          <View style={ui.hudRow}>
            <View style={ui.hudPill}>
              <Text style={ui.hudKey}>STEPS</Text>
              <Text style={ui.hudVal}>{stepsCount}</Text>
            </View>

            <View style={ui.hudPill}>
              <Text style={ui.hudKey}>DETECTED HOLDS</Text>
              <Text style={ui.hudVal}>{modulesLoading ? "..." : totalPhysicalPegs}</Text>
            </View>
          </View>

          <View style={ui.boardRow}>
            <Text style={ui.label}>HARDWARE MAPPING</Text>
            <View style={ui.hardwareBox}>
              {modulesLoading ? (
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#111" />
                  <Text style={ui.boardHint}>Interrogating MAC: {activeMac}...</Text>
                </View>
              ) : totalPhysicalPegs > 0 ? (
                <Text style={ui.hardwareSuccess}>
                  ✓ Canvas locked ({modules.length} modules • {totalPhysicalPegs} total pegs)
                </Text>
              ) : (
                <Text style={ui.hardwareFail}>⚠️ No physical holds returned for this MAC.</Text>
              )}
            </View>
          </View>

          <Pressable onPress={() => setIsPublic(!isPublic)} style={ui.toggleRow}>
            <View style={ui.toggleLeft}>
              <View style={[ui.checkBox, isPublic && ui.checkBoxOn]}>
                {isPublic && <Text style={ui.checkMark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ui.toggleTitle}>Public Leaderboard</Text>
                <Text style={ui.toggleHint}>Allow global players to challenge this exact map.</Text>
              </View>
            </View>
          </Pressable>

          <Text style={ui.summary}>{summary}</Text>
        </View>

        <PathBoard
          modules={modules}
          path={path}
          onChangePath={setPath}
          title="LIVE CANVAS"
          hint={modulesLoading ? "Waiting for hardware..." : "Tap a hold → assign Left/Right."}
          allowMultiple
        />

        <View style={ui.footer}>
          <Text style={ui.footerTitle}>HARDWARE NOTE</Text>
          <Text style={ui.footerHint}>
            Routes built here are permanently mapped to the unique coordinate IDs of device [{activeMac ?? "None"}].
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getResponsiveStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    header: { marginTop: s(6), flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: s(12) },
    brand: { color: "#111111", fontWeight: "700", letterSpacing: 0.2 },
    subtitle: { marginTop: s(4), color: "#6B6B6B", fontWeight: "500", fontSize: s(11) },
    saveBtn: { paddingVertical: s(12), paddingHorizontal: s(14), borderRadius: s(16), backgroundColor: "#111111", borderWidth: 1, borderColor: "#111111" },
    saveText: { color: "#FFFFFF", fontWeight: "700", letterSpacing: 0.8, fontSize: s(10) },
    panel: { marginTop: s(14), borderRadius: s(22), padding: s(14), backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#D9D9D9" },
    label: { color: "#6B6B6B", fontWeight: "700", letterSpacing: 0.8, fontSize: s(10) },
    input: { marginTop: s(10), borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF", color: "#111111", borderRadius: s(16), paddingHorizontal: s(12), paddingVertical: s(12), fontWeight: "600", fontSize: s(11) },
    panelTopRow: { flexDirection: "row", alignItems: "flex-end", gap: s(10) },
    clearBtn: { paddingVertical: s(10), paddingHorizontal: s(12), borderRadius: s(16), backgroundColor: "rgba(225,85,114,0.08)", borderWidth: 1, borderColor: "rgba(225,85,114,0.28)" },
    clearText: { color: "#C44760", fontWeight: "700", letterSpacing: 0.8, fontSize: s(10) },
    hudRow: { marginTop: s(12), flexDirection: "row", gap: s(10), alignItems: "center" },
    hudPill: { flex: 1, borderRadius: s(16), paddingVertical: s(10), paddingHorizontal: s(12), backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3E3E3", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    hudKey: { color: "#7A7A7A", fontWeight: "700", letterSpacing: 0.8, fontSize: s(11) },
    hudVal: { color: "#111111", fontWeight: "700", fontSize: s(11) },
    boardRow: { marginTop: s(12), gap: s(6) },
    boardHint: { color: "#7A7A7A", fontWeight: "500", fontSize: s(10) },
    toggleRow: { marginTop: s(12), borderRadius: s(18), paddingVertical: s(12), paddingHorizontal: s(12), backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3E3E3", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: s(10) },
    toggleLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: s(10) },
    checkBox: { width: s(22), height: s(22), borderRadius: s(8), borderWidth: 1, borderColor: "#D0D0D0", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
    checkBoxOn: { backgroundColor: "#111111", borderColor: "#111111" },
    checkMark: { color: "#FFFFFF", fontWeight: "700", fontSize: s(11), lineHeight: s(16) },
    toggleTitle: { color: "#111111", fontWeight: "700", letterSpacing: 0.2, fontSize: s(11) },
    toggleHint: { marginTop: s(3), color: "#6B6B6B", fontWeight: "500", fontSize: s(10) },
    summary: { marginTop: s(10), color: "#444444", fontWeight: "600", fontSize: s(11) },
    footer: { marginTop: s(14), marginBottom: s(40), borderRadius: s(18), padding: s(14), backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#E3E3E3" },
    footerTitle: { color: "#111111", fontWeight: "700", letterSpacing: 0.8, fontSize: s(11) },
    footerHint: { marginTop: s(6), color: "#6B6B6B", fontWeight: "500", fontSize: s(11) },
    hardwareBox: { padding: s(12), borderRadius: s(14), backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E3E3E3" },
    hardwareSuccess: { color: "#2E7D32", fontWeight: "700", fontSize: s(11) },
    hardwareFail: { color: "#C62828", fontWeight: "700", fontSize: s(11) },
  });