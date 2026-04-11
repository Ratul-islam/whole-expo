import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenLayout } from "../../src/ui/app/screenLayout";
import { EmptyState } from "../../src/ui/app/emptyState";

import { pathService } from "@/src/path/path.services";
import { deviceService } from "@/src/device/device.services";
import { PathBoardViewer } from "@/src/ui/profile/PathBoardViewer";

import type {
  ApiMeta,
  ApiResponse,
  ConnectedDevice,
  PathStep,
  RouteCardModel,
  Tab,
} from "@/src/ui/routes/types";

import {
  pickKey,
  safeArr,
  titleSafe,
  unwrapPayload,
} from "@/src/ui/routes/helpers";
import { RoutesHeader } from "@/src/ui/routes/RoutesHeader";
import { RouteCard } from "@/src/ui/routes/RouteCard";
import { ConfirmSheet } from "@/src/ui/routes/ConfirmSheet";

const LIMIT = 10;

type Notice =
  | null
  | { type: "info" | "success" | "error"; title: string; message?: string };

const normalizeBoardConf = (v: string) => v.trim().replace(/×/g, "x");

export default function MyRoutesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // --- DYNAMIC SCALING UTILITY ---
  const scale = useMemo(() => {
    return (size: number) => Math.min((width / 375) * size, size * 1.3);
  }, [width]);

  const styles = useMemo(() => getResponsiveStyles(scale), [scale]);

  const ui = useMemo(() => {
    return {
      contentBottom: scale(24),
      cardGap: scale(10),
      modePadding: scale(12),
      footerPad: scale(16),
      buttonRadius: scale(16),
      smallText: scale(10),
    };
  }, [scale]);

  const [tab, setTab] = useState<Tab>("CREATED");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [created, setCreated] = useState<RouteCardModel[]>([]);
  const [saved, setSaved] = useState<RouteCardModel[]>([]);
  const [fallbackAll, setFallbackAll] = useState<any[]>([]);

  const [deviceConnected, setDeviceConnected] = useState<ConnectedDevice | any>(null);
  const [deviceReady, setDeviceReady] = useState(false);

  const [selected, setSelected] = useState<RouteCardModel | null>(null);

  const [notice, setNotice] = useState<Notice>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RouteCardModel | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [busyVisibilityId, setBusyVisibilityId] = useState<string | null>(null);

  const queryRef = useRef(query);
  queryRef.current = query;

  const data = tab === "CREATED" ? created : saved;

  // --- DEVICE CONNECTION & UPLOAD LOGIC ---
  const isDeviceConnected = !!(
    deviceConnected?.deviceId &&
    deviceConnected?.deviceSecret &&
    deviceConnected?.boardConf
  );

  const isOnlineMode = deviceConnected?.control === "online";
  
  let uploadLabel = "SCAN DEVICE TO CONNECT";
  let canUploadButton = false;

  if (isDeviceConnected) {
    if (isOnlineMode) {
      uploadLabel = "UPLOAD TO DEVICE";
      canUploadButton = true;
    } else {
      uploadLabel = "MANUAL MODE";
      canUploadButton = false;
    }
  }

  const mapToModel = (raw: any): RouteCardModel => {
    const p = raw?.path?._id ? raw.path : raw;
    return {
      id: raw?._id ?? p?._id ?? p?.id, 
      
      // FIX: Changed || to ?? to prevent mixing operators
      targetPathId: raw?.pathId ?? p?._id ?? p?.id, 
      
      title: titleSafe(p?.name),
      steps: safeArr(p?.path).length,
      boardConf: p.boardConf,
      createdAt: p?.createdAt,
      path: safeArr<PathStep>(p?.path),
      isPublic: !!p?.isPublic,
    } as any;
  };

  const goCreate = () => router.replace("/(app)/route-editor");

  const resetPaging = () => {
    setPage(1);
    setHasMore(true);
    setFallbackAll([]);
    if (tab === "CREATED") setCreated([]);
    else setSaved([]);
  };

  const fetchDeviceStatus = async () => {
    try {
      const res = await deviceService.status();
      const payload = unwrapPayload(res);

      const connectedFlag = payload?.connected;
      const deviceId = pickKey(payload, ["deviceId", "deviceID", "device_id"]);
      const deviceSecret = pickKey(payload, ["deviceSecret", "device_secret"]);
      const rawBoard = pickKey(payload, ["boardConf", "board_conf", "boardCONF"]) as string | undefined;

      const boardConf = rawBoard ? normalizeBoardConf(rawBoard) : undefined;
      const control = res?.data?.sessionId?.control;

      if (connectedFlag === false || !deviceId || !deviceSecret) {
        setDeviceConnected(null);
        return;
      }

      setDeviceConnected({
        deviceId,
        deviceSecret,
        boardConf,
        sessionId: payload.sessionId._id,
        control,
      } as any);

      if (boardConf) setQuery(boardConf);
    } catch (err) {
      console.log("device status error:", err);
      setDeviceConnected(null);
    } finally {
      setDeviceReady(true);
    }
  };

  const handleSelectRoute = async (item: RouteCardModel) => {
    setSelected(item);
    await fetchDeviceStatus();
  };

  const fetchPage = async (opts: { reset?: boolean } = {}) => {
    const reset = !!opts.reset;

    try {
      setErrorText(null);

      const deviceBoard = deviceConnected?.boardConf
        ? normalizeBoardConf(deviceConnected.boardConf)
        : "";

      const q = queryRef.current.trim();
      const nextPage = reset ? 1 : page;
      const params: any = { page: nextPage, limit: LIMIT };

      if (deviceBoard) {
        params.boardConf = deviceBoard;
      } else if (q) {
        params.q = q;
      }

      const res = (tab === "SAVED"
        ? await pathService.getSavedPaths(params)
        : await pathService.getAllPath(params)) as ApiResponse | any;
      const ok = res;
      const meta: ApiMeta | undefined = ok ? res.meta : res?.meta;

      // Extract array properly handling both CREATED and SAVED payload structures
      const responsePayload = res?.data?.list ?? res?.data;
      const dataRaw = safeArr<any>(responsePayload);

      const backendHasPaging =
        !!meta &&
        (typeof meta.hasMore === "boolean" || typeof meta.total === "number");

      const setList = tab === "SAVED" ? setSaved : setCreated;
      
      const currentList = tab === "SAVED" ? saved : created;

      if (backendHasPaging) {
        const chunk = dataRaw.map(mapToModel);
        setList((prev) => (reset ? chunk : [...prev, ...chunk]));

        const hm =
          typeof meta.hasMore === "boolean"
            ? meta.hasMore
            : typeof meta.total === "number"
            ? (reset ? chunk.length : currentList.length + chunk.length) < meta.total
            : chunk.length === LIMIT;

        setHasMore(hm);
        setPage(nextPage + 1);

        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      const normalized = dataRaw.map((raw: any) => {
        const p = raw?.path?._id ? raw.path : raw;
        return {
          ...raw,
          ...p,
          name: titleSafe(p?.name),
          path: safeArr<PathStep>(p?.path),
          boardConf: p?.boardConf,
        };
      });

      const base = reset || fallbackAll.length === 0 ? normalized : fallbackAll;
      if (reset || fallbackAll.length === 0) setFallbackAll(normalized);

      const filtered = base.filter((p: any) => {
        if (deviceBoard) {
          const docBoard = p?.boardConf ? normalizeBoardConf(p.boardConf) : "";
          return docBoard === deviceBoard;
        }

        if (!q) return true;
        const hay = `${p.name} ${safeArr(p.path).length}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });

      const start = (nextPage - 1) * LIMIT;
      const slice = filtered.slice(start, start + LIMIT).map(mapToModel);

      setList((prev) => (reset ? slice : [...prev, ...slice]));
      setHasMore(start + LIMIT < filtered.length);
      setPage(nextPage + 1);

      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    } catch (e: any) {
      setErrorText(e?.message || "Failed to load routes.");
      setNotice({ type: "error", title: "Could not load routes", message: e?.message });
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
  }, []);

  useEffect(() => {
    if (!deviceReady) return;
    setLoading(true);
    resetPaging();
    fetchPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, deviceReady]);

  useEffect(() => {
    if (!deviceReady) return;
    const t = setTimeout(() => {
      setLoading(true);
      resetPaging();
      fetchPage({ reset: true });
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, deviceReady]);

  const onRefresh = async () => {
    setRefreshing(true);
    resetPaging();
    await fetchPage({ reset: true });
    await fetchDeviceStatus();
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (loading || refreshing || loadingMore) return;
    if (!hasMore) return;
    setLoadingMore(true);
    fetchPage({ reset: false });
  };

  const onUpload = async () => {
    if (!selected) return;

    if (!isDeviceConnected) {
      throw new Error("Scan/connect a device to upload this route.");
    }

    if (!isOnlineMode) {
      throw new Error("Device is currently in manual mode. Switch to online mode to upload.");
    }
    
    // Extract the exact pathId (rather than the saved path reference ID)
    const uploadId = (selected as any).targetPathId || selected.id;

    const res = await deviceService.loadPreset({
      id: deviceConnected.sessionId,
      pathId: uploadId,
    });

    console.log(res)
    if (res?.status === "error" || res?.status === "fail" || res?.error || res?.success === false) {
      throw new Error(res?.message || "Device rejected the upload.");
    }

    setSelected(null); // Closes the board viewer
    router.replace("/(app)/device"); // Redirects to device page
  };

  const toggleLeaderboard = async (route: RouteCardModel) => {
    try {
      setBusyVisibilityId(route.id);
      const next = !route.isPublic;

      await (pathService as any).updatePath?.({ pathId: route.id, isPublic: next });

      setCreated((prev) => prev.map((x) => (x.id === route.id ? { ...x, isPublic: next } : x)));
      setNotice({
        type: "success",
        title: next ? "Uploaded" : "Made private",
        message: next ? "This route is now on the leaderboard." : "This route is now private.",
      });
      setSelected((cur) => cur?.id === route.id ? { ...cur, isPublic: next } : cur);
    } catch (e: any) {
      setNotice({ type: "error", title: "Update failed", message: e?.message || "Could not update leaderboard status." });
      throw e;
    } finally {
      setBusyVisibilityId(null);
    }
  };

  const requestDelete = (r: RouteCardModel) => {
    setPendingDelete(r);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    const r = pendingDelete;
    if (!r) return;

    setConfirmOpen(false);
    setPendingDelete(null);

    if (tab === "SAVED") {
      try {
        setNotice({ type: "info", title: "Removing", message: "Removing from saved…" });
        await pathService.deleteSavedPath(r.id);
        setSaved((prev) => prev.filter((x) => x.id !== r.id));
        setNotice({ type: "success", title: "Removed", message: "Route removed from saved list." });
      } catch (err: any) {
        setNotice({ type: "error", title: "Remove failed", message: err?.message || "Could not remove saved route." });
      }
      return;
    }

    try {
      setNotice({ type: "info", title: "Deleting", message: "Removing route…" });
      await pathService.deletePath({ pathId: r.id });
      setCreated((prev) => prev.filter((x) => x.id !== r.id));
      setNotice({ type: "success", title: "Deleted", message: "Route deleted." });
    } catch (err: any) {
      setNotice({ type: "error", title: "Delete failed", message: err?.message || "Could not delete the route." });
    }
  };

  const empty = () => {
    if (loading) return null;

    if (tab === "SAVED") {
      return (
        <View style={styles.emptyWrap}>
          <EmptyState title="No saved routes" hint="Saved routes will appear here." />
        </View>
      );
    }

    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          title={query.trim() ? "No results" : "No routes yet"}
          hint={query.trim() ? "Try a different search." : "Create your first route to get started."}
        />
        {!query.trim() ? (
          <Pressable onPress={goCreate} style={[styles.emptyBtn, { borderRadius: ui.buttonRadius }]}>
            <Text style={styles.emptyBtnText}>OPEN ROUTE EDITOR</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenLayout title="" subtitle="">
      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: ui.cardGap }}>
            <RouteCard
              item={item}
              tab={tab}
              device={deviceConnected}
              onPress={() => handleSelectRoute(item)}
              onDelete={() => requestDelete(item)}
            />

            {tab === "CREATED" && editMode ? (
              <View style={styles.editRow}>
                <Pressable
                  onPress={() =>
                    router.replace({
                      pathname: "/(app)/route-editor",
                      params: { pathId: item.id },
                    } as any)
                  }
                  style={[styles.editBtn, { borderRadius: ui.buttonRadius }]}
                >
                  <Text style={[styles.editBtnText, { fontSize: ui.smallText }]}>EDIT</Text>
                </Pressable>

                <Pressable
                  onPress={() => toggleLeaderboard(item)}
                  disabled={busyVisibilityId === item.id}
                  style={[
                    styles.leaderBtn,
                    item.isPublic ? styles.leaderBtnOff : styles.leaderBtnOn,
                    busyVisibilityId === item.id && { opacity: 0.6 },
                    { borderRadius: ui.buttonRadius },
                  ]}
                >
                  <Text
                    style={[
                      styles.leaderBtnText,
                      item.isPublic ? styles.leaderBtnTextOff : styles.leaderBtnTextOn,
                      { fontSize: ui.smallText },
                    ]}
                  >
                    {busyVisibilityId === item.id
                      ? "UPDATING…"
                      : item.isPublic
                      ? "MAKE PRIVATE"
                      : "UPLOAD TO LEADERBOARD"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
        ListHeaderComponent={
          <>
            <RoutesHeader
              tab={tab}
              setTab={setTab}
              query={query}
              setQuery={setQuery}
              onBack={() => router.back()}
              onCreate={goCreate}
              device={deviceConnected}
              errorText={errorText}
              onRetry={() => fetchPage({ reset: true })}
            />

            {tab === "CREATED" ? (
              <View style={[styles.modeBar, { padding: ui.modePadding }]}>
                <Text style={[styles.modeLabel, { fontSize: ui.smallText }]}>EDIT MODE</Text>

                <Pressable
                  onPress={() => setEditMode((v) => !v)}
                  style={[
                    styles.modeToggle,
                    editMode && styles.modeToggleOn,
                    { borderRadius: ui.buttonRadius },
                  ]}
                >
                  <View style={[styles.checkBox, editMode && styles.checkBoxOn]}>
                    {editMode ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  <Text
                    style={[
                      styles.modeToggleText,
                      editMode && styles.modeToggleTextOn,
                      { fontSize: ui.smallText },
                    ]}
                  >
                    {editMode ? "ON" : "OFF"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingBottom: ui.contentBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111111" />}
        onEndReachedThreshold={0.35}
        onEndReached={onEndReached}
        ListFooterComponent={
          loading || loadingMore ? (
            <View style={[styles.footer, { paddingVertical: ui.footerPad }]}>
              <ActivityIndicator color="#111111" />
              <Text style={styles.footerText}>{loading ? "Loading…" : "Loading more…"}</Text>
            </View>
          ) : hasMore ? (
            <View style={[styles.footer, { paddingVertical: ui.footerPad }]}>
              <Text style={styles.footerMuted}>Scroll to load more</Text>
            </View>
          ) : data.length > 0 ? (
            <View style={[styles.footer, { paddingVertical: ui.footerPad }]}>
              <Text style={styles.footerMuted}>End</Text>
            </View>
          ) : (
            <View style={{ height: 10 }} />
          )
        }
      />

      <PathBoardViewer
        context="OWNER"
        boardConf={selected?.boardConf}
        visible={!!selected}
        path={selected?.path || []}
        pathName={selected?.title || "Route"}
        onClose={() => setSelected(null)}
        canUpload={canUploadButton}
        onUpload={onUpload}
        uploadLabel={uploadLabel}
        canToggleLeaderboard={tab === "CREATED"}
        isPublic={!!selected?.isPublic}
        onToggleLeaderboard={() => {
          if (!selected) return;
          return toggleLeaderboard(selected);
        }}
      />

      <ConfirmSheet
        visible={confirmOpen}
        title={tab === "CREATED" ? "Delete route?" : "Remove route?"}
        message={
          pendingDelete
            ? `This will ${tab === "CREATED" ? "permanently delete" : "remove"} "${pendingDelete.title}".`
            : ""
        }
        confirmLabel={tab === "CREATED" ? "DELETE" : "REMOVE"}
        cancelLabel="CANCEL"
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={performDelete}
      />
    </ScreenLayout>
  );
}

const getResponsiveStyles = (s: (val: number) => number) =>
  StyleSheet.create({
    emptyWrap: { marginTop: s(10) },
    emptyBtn: {
      marginTop: s(10),
      paddingVertical: s(12),
      alignItems: "center",
      backgroundColor: "#111111",
      borderWidth: 1,
      borderColor: "#111111",
    },
    emptyBtnText: { color: "#FFFFFF", fontWeight: "700", letterSpacing: 0.8, fontSize: s(14) },
    footer: { alignItems: "center", gap: s(10) },
    footerText: { color: "#444444", fontWeight: "600", fontSize: s(14) },
    footerMuted: { color: "#7A7A7A", fontWeight: "500", fontSize: s(14) },
    modeBar: {
      marginTop: s(10),
      marginBottom: s(6),
      marginHorizontal: s(2),
      backgroundColor: "#F7F7F7",
      borderWidth: 1,
      borderColor: "#D9D9D9",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: s(18),
    },
    modeLabel: { color: "#6B6B6B", fontWeight: "700", letterSpacing: 0.8 },
    modeToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(10),
      paddingVertical: s(10),
      paddingHorizontal: s(12),
      backgroundColor: "#EDEDED",
      borderWidth: 1,
      borderColor: "#D9D9D9",
    },
    modeToggleOn: { borderColor: "#111111", backgroundColor: "#111111" },
    modeToggleText: { color: "#111111", fontWeight: "700", letterSpacing: 0.8 },
    modeToggleTextOn: { color: "#FFFFFF" },
    checkBox: {
      width: s(22),
      height: s(22),
      borderRadius: s(8),
      borderWidth: 1,
      borderColor: "#D0D0D0",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    checkBoxOn: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
    checkMark: { color: "#111111", fontWeight: "700", fontSize: s(14), lineHeight: s(16) },
    editRow: { marginTop: s(8), flexDirection: "row", gap: s(10), paddingHorizontal: s(6) },
    editBtn: {
      flex: 1,
      paddingVertical: s(12),
      alignItems: "center",
      backgroundColor: "#EDEDED",
      borderWidth: 1,
      borderColor: "#D9D9D9",
    },
    editBtnText: { color: "#111111", fontWeight: "700", letterSpacing: 0.8 },
    leaderBtn: { flex: 1.2, paddingVertical: s(12), alignItems: "center", borderWidth: 1 },
    leaderBtnOn: { backgroundColor: "#111111", borderColor: "#111111" },
    leaderBtnOff: { backgroundColor: "rgba(225,85,114,0.08)", borderColor: "rgba(225,85,114,0.28)" },
    leaderBtnText: { fontWeight: "700", letterSpacing: 0.6, textAlign: "center", paddingHorizontal: s(6) },
    leaderBtnTextOn: { color: "#FFFFFF" },
    leaderBtnTextOff: { color: "#C44760" },
  });