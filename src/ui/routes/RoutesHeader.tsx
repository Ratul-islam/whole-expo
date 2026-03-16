import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
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

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const ui = {
    title: isTablet ? 22 : 20,
    subtitle: isTablet ? 14 : 13,
    padding: isTablet ? 14 : 12,
  };

  return (
    <View>
      {/* Top Bar */}
      <View style={s.topBar}>
        <Pressable onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[s.hTitle, { fontSize: ui.title }]}>My Routes</Text>
          <Text style={[s.hSub, { fontSize: ui.subtitle }]}>
            Keep your presets ready for battle
          </Text>
        </View>

        <Pressable onPress={onCreate} style={s.hBtn}>
          <Text style={s.hBtnText}>+ Create</Text>
        </Pressable>
      </View>

      {/* Panel */}
      <View style={[s.panel, { padding: ui.padding }]}>
        <View style={s.panelTop}>
          {/* Tabs */}
          <View style={s.tabRow}>
            <Pressable
              onPress={() => setTab("CREATED")}
              style={[s.tabBtn, tab === "CREATED" && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === "CREATED" && s.tabTextActive]}>
                Created
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("SAVED")}
              style={[s.tabBtn, tab === "SAVED" && s.tabBtnActive]}
            >
              <Text style={[s.tabText, tab === "SAVED" && s.tabTextActive]}>
                Saved
              </Text>
            </Pressable>
          </View>

          <DevicePill device={device} />
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search routes…"
            placeholderTextColor="#A5A5A5"
            style={s.search}
          />
        </View>

        {/* Error */}
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
    backgroundColor: "#EDEDED",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  backIcon: {
    color: "#111111",
    fontWeight: "700",
    fontSize: 16,
  },

  hTitle: {
    color: "#111111",
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  hSub: {
    marginTop: 3,
    color: "#6B6B6B",
    fontWeight: "500",
  },

  hBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#111111",
  },

  hBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  panel: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  panelTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

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
    backgroundColor: "#EFEFEF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  tabBtnActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  tabText: {
    color: "#444444",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  searchRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  searchIcon: {
    color: "#8A8A8A",
    fontWeight: "700",
  },

  search: {
    flex: 1,
    color: "#111111",
    fontWeight: "500",
    paddingVertical: 0,
  },

  errorRow: {
    marginTop: 10,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(225,85,114,0.08)",
    borderWidth: 1,
    borderColor: "rgba(225,85,114,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  errorText: {
    flex: 1,
    color: "#C44760",
    fontWeight: "600",
  },

  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#111111",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});