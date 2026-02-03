import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import type { ConnectedDevice, Tab } from "./types";
import { DevicePill } from "./DevicePill";

export function RoutesHeader(props: {
  tab: Tab;
  setTab: (t: Tab) => void;

  query: string;
  setQuery: (q: string) => void;

  onBack: () => void;
  onCreate: () => void;

  device: ConnectedDevice;

  errorText: string | null;
  onRetry: () => void;
}) {
  const { tab, setTab, query, setQuery, onBack, onCreate, device, errorText, onRetry } = props;

  return (
    <View>
      {/* Top bar (UNCHANGED) */}
      <View style={s.topBar}>
        <Pressable onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={s.hTitle}>My Routes</Text>
          <Text style={s.hSub}>Keep your presets ready for battle</Text>
        </View>

        <Pressable onPress={onCreate} style={s.hBtn}>
          <Text style={s.hBtnText}>+ Create</Text>
        </Pressable>
      </View>

      {/* Panel (same design, just add tab row) */}
      <View style={s.panel}>
        <View style={s.panelTop}>
          {/* ✅ NEW: Saved/Created tabs, inserted here */}
          <View style={s.tabRow}>
            <Pressable
              onPress={() => setTab("CREATED")}
              style={[s.tabBtn, tab === "CREATED" && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === "CREATED" && s.tabTextActive]}>Created</Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("SAVED")}
              style={[s.tabBtn, tab === "SAVED" && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === "SAVED" && s.tabTextActive]}>Saved</Text>
            </Pressable>
          </View>

          {/* Device pill (UNCHANGED) */}
          <DevicePill device={device} />
        </View>

        {/* Search row (UNCHANGED) */}
        <View style={s.searchRow}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search routes…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={s.search}
          />
        </View>

        {/* Error row (UNCHANGED) */}
        {!!errorText && (
          <View style={s.errorRow}>
            <Text style={s.errorText} numberOfLines={2}>
              {errorText}
            </Text>
            <Pressable onPress={onRetry} style={s.retryBtn}>
              <Text style={s.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  backIcon: { color: "#EAF0FF", fontWeight: "900", fontSize: 16 },

  hTitle: { color: "#EAF0FF", fontSize: 20, fontWeight: "900", letterSpacing: 0.6 },
  hSub: { marginTop: 4, color: "rgba(255,255,255,0.65)", fontWeight: "700" },

  hBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(122,162,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(122,162,255,0.26)",
  },
  hBtnText: { color: "#EAF0FF", fontWeight: "900" },

  panel: {
    marginTop: 12,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  panelTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  /* ✅ NEW: tab row, styled to match your old panel */
  tabRow: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  tabBtnActive: {
    backgroundColor: "rgba(122,162,255,0.16)",
    borderColor: "rgba(122,162,255,0.30)",
  },
  tabText: {
    color: "rgba(255,255,255,0.70)",
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#EAF0FF",
  },

  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  searchIcon: { color: "rgba(255,255,255,0.55)", fontWeight: "900" },
  search: { flex: 1, color: "#fff", fontWeight: "700", paddingVertical: 0 },

  errorRow: {
    marginTop: 10,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(255,80,80,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: { flex: 1, color: "#FFD6DE", fontWeight: "800" },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  retryText: { color: "#fff", fontWeight: "900" },
});
