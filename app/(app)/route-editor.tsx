import React, { useMemo, useState } from "react";
import { ScreenLayout } from "@/src/ui/app/screenLayout";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { pathService } from "@/src/path/path.services";
import { PathBoard, type PathStep } from "@/src/ui/routes/pathBoard";
import { router } from "expo-router";

export default function RouteEditorVisualScreen() {
  const [name, setName] = useState("");
  const [path, setPath] = useState<PathStep[]>([]);

  const stepsCount = path.length;

  const summary = useMemo(() => {
    if (!stepsCount) return "No steps yet.";
    const last = path[path.length - 1];
    return `Last: ${last[0]}${last[1] === 0 ? "L" : "R"} • Total: ${stepsCount}`;
  }, [path, stepsCount]);

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

    const payload = { name: trimmed, path };
    await pathService.addNewPath(payload);
Alert.alert(
  "Saved",
  "Route saved successfully.",
  [
    { text: "OK", onPress: () => router.push("/(app)/my-routes") },
  ],
  { cancelable: true }
);

  };

  return (
    <ScreenLayout title="" subtitle="">
      {/* Top header (arcade style) */}
      <View style={ui.header}>
        <View>
          <Text style={ui.brand}>ROUTE FORGE</Text>
          <Text style={ui.subtitle}>Build a sequence like a combo.</Text>
        </View>

        <Pressable onPress={onSave} style={ui.saveBtn}>
          <Text style={ui.saveText}>SAVE</Text>
        </Pressable>
      </View>

      {/* Name + small HUD */}
      <View style={ui.panel}>
        <Text style={ui.label}>ROUTE NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Warmup L/R"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={ui.input}
        />

        <View style={ui.hudRow}>
          <View style={ui.hudPill}>
            <Text style={ui.hudKey}>STEPS</Text>
            <Text style={ui.hudVal}>{stepsCount}</Text>
          </View>

          <View style={ui.hudPill}>
            <Text style={ui.hudKey}>STATUS</Text>
            <Text style={ui.hudVal}>{stepsCount ? "EDITING" : "IDLE"}</Text>
          </View>

          <Pressable onPress={() => setPath([])} style={ui.clearBtn}>
            <Text style={ui.clearText}>CLEAR</Text>
          </Pressable>
        </View>

        <Text style={ui.summary}>{summary}</Text>
      </View>

      {/* Reusable board */}
      <PathBoard
        rows={4}
        cols={5}
        path={path}
        onChangePath={setPath}
        title="BOARD"
        hint="Tap a node → add Left/Right. Repeat nodes allowed."
        allowMultiple={true}
      />

      {/* Footer hint (clean) */}
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

  label: { color: "rgba(255,255,255,0.60)", fontWeight: "900", letterSpacing: 1.1, fontSize: 12 },

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
  hudKey: { color: "rgba(255,255,255,0.65)", fontWeight: "900", letterSpacing: 1.0, fontSize: 11 },
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
});
