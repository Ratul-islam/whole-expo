import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
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
  PathDTO,
  PathStep,
  RouteCardModel,
  Tab,
} from "@/src/ui/routes/types";

import { pickKey, safeArr, titleSafe, unwrapPayload } from "@/src/ui/routes/helpers";
import { RoutesHeader } from "@/src/ui/routes/RoutesHeader";
import { RouteCard } from "@/src/ui/routes/RouteCard";
import { ConfirmSheet } from "@/src/ui/routes/ConfirmSheet";

const LIMIT = 10;

type Notice = null | { type: "info" | "success" | "error"; title: string; message?: string };

export default function MyRoutesScreen() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("CREATED");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [created, setCreated] = useState<RouteCardModel[]>([]);
  const [saved, setSaved] = useState<RouteCardModel[]>([]); // placeholder until API
  const [fallbackAll, setFallbackAll] = useState<PathDTO[]>([]);

  const [deviceConnected, setDeviceConnected] = useState<ConnectedDevice>(null);
  const [selected, setSelected] = useState<RouteCardModel | null>(null);

  // ✅ professional feedback (no Alerts)
  const [notice, setNotice] = useState<Notice>(null);

  // ✅ confirm delete sheet
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RouteCardModel | null>(null);

  const queryRef = useRef(query);
  queryRef.current = query;

  const data = tab === "CREATED" ? created : saved;
  const canUpload = !!(deviceConnected?.deviceId && deviceConnected?.deviceSecret);

  const mapToModel = (p: PathDTO): RouteCardModel => ({
    id: p._id,
    title: titleSafe(p.name),
    steps: safeArr(p.path).length,
    createdAt: p.createdAt,
    path: safeArr<PathStep>(p.path),
  });

  const goCreate = () => router.push("/(app)/route-editor");

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

      if (connectedFlag === false) {
        setDeviceConnected(null);
        return;
      }

      if (!deviceId || !deviceSecret) {
        setDeviceConnected(null);
        return;
      }

      setDeviceConnected({ deviceId, deviceSecret });
    } catch (err) {
      console.log("device status error:", err);
      setDeviceConnected(null);
    }
  };

  const fetchPage = async (opts: { reset?: boolean } = {}) => {
    const reset = !!opts.reset;

    // SAVED placeholder until you add endpoint
    if (tab === "SAVED") {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      setErrorText(null);
      setHasMore(false);
      return;
    }

    try {
      setErrorText(null);

      const q = queryRef.current.trim();
      const nextPage = reset ? 1 : page;

      const res = (await (pathService as any).getAllPath?.({
        page: nextPage,
        limit: LIMIT,
        q,
      })) as ApiResponse | any;

      const ok = res && res.status === "success";
      const meta: ApiMeta | undefined = ok ? res.meta : res?.meta;

      const dataRaw = ok ? safeArr<PathDTO>(res.data) : safeArr<PathDTO>(res?.data);

      const backendHasPaging =
        !!meta && (typeof meta.hasMore === "boolean" || typeof meta.total === "number");

      if (backendHasPaging) {
        const chunk = dataRaw.map(mapToModel);
        setCreated((prev) => (reset ? chunk : [...prev, ...chunk]));

        const hm =
          typeof meta.hasMore === "boolean"
            ? meta.hasMore
            : typeof meta.total === "number"
              ? (reset ? chunk.length : created.length + chunk.length) < meta.total
              : chunk.length === LIMIT;

        setHasMore(hm);
        setPage(nextPage + 1);

        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      // fallback: backend returns all
      const normalized = dataRaw.map((p) => ({
        ...p,
        name: titleSafe(p.name),
        path: safeArr<PathStep>(p.path),
      }));

      const base = reset || fallbackAll.length === 0 ? normalized : fallbackAll;
      if (reset || fallbackAll.length === 0) setFallbackAll(normalized);

      const filtered = base.filter((p) => {
        if (!q) return true;
        const hay = `${p.name} ${safeArr(p.path).length}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });

      const start = (nextPage - 1) * LIMIT;
      const slice = filtered.slice(start, start + LIMIT).map(mapToModel);

      setCreated((prev) => (reset ? slice : [...prev, ...slice]));
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
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
  }, []);

  useEffect(() => {
    setLoading(true);
    resetPaging();
    fetchPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      resetPaging();
      fetchPage({ reset: true });
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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

    if (!deviceConnected?.deviceId || !deviceConnected?.deviceSecret) {
      setNotice({
        type: "info",
        title: "Device required",
        message: "Scan/connect a device to upload this route.",
      });
      return;
    }

    try {
      setNotice({ type: "info", title: "Uploading", message: "Sending route to device…" });

      await deviceService.loadPreset({
        deviceId: deviceConnected.deviceId,
        deviceSecret: deviceConnected.deviceSecret,
        pathId: selected.id,
      });

      setNotice({ type: "success", title: "Uploaded", message: "Route uploaded to device." });
      setSelected(null);
      router.push("/(app)")
    } catch (e: any) {
      setNotice({ type: "error", title: "Upload failed", message: e?.message || "Please try again." });
    }
  };

  // Professional delete flow: confirm sheet + banner result
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
      setSaved((prev) => prev.filter((x) => x.id !== r.id));
      setNotice({ type: "success", title: "Removed", message: "Route removed from saved list." });
      return;
    }

    try {
      setNotice({ type: "info", title: "Deleting", message: "Removing route…" });

      await pathService.deletePath({ pathId: r.id });

      // Update UI
      setCreated((prev) => prev.filter((x) => x.id !== r.id));

      setNotice({ type: "success", title: "Deleted", message: "Route deleted." });
    } catch (err: any) {
      console.log("delete error:", err);
      setNotice({
        type: "error",
        title: "Delete failed",
        message: err?.message || "Could not delete the route.",
      });
    }
  };

  const empty = () => {
    if (loading) return null;

    if (tab === "SAVED") {
      return (
        <View style={{ marginTop: 10 }}>
          <EmptyState title="No saved routes" hint="Saved routes will appear here." />
        </View>
      );
    }

    return (
      <View style={{ marginTop: 10 }}>
        <EmptyState
          title={query.trim() ? "No results" : "No routes yet"}
          hint={query.trim() ? "Try a different search." : "Create your first route to get started."}
        />
        {!query.trim() ? (
          <Pressable onPress={goCreate} style={s.emptyBtn}>
            <Text style={s.emptyBtnText}>OPEN ROUTE EDITOR</Text>
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
          <RouteCard
            item={item}
            tab={tab}
            device={deviceConnected}
            onPress={() => setSelected(item)}
            onDelete={() => requestDelete(item)}
          />
        )}
        ListHeaderComponent={
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
            // notice={notice}
            // onDismissNotice={() => setNotice(null)}
          />
        }
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        onEndReachedThreshold={0.35}
        onEndReached={onEndReached}
        ListFooterComponent={
          loading || loadingMore ? (
            <View style={s.footer}>
              <ActivityIndicator />
              <Text style={s.footerText}>{loading ? "Loading…" : "Loading more…"}</Text>
            </View>
          ) : hasMore ? (
            <View style={s.footer}>
              <Text style={s.footerMuted}>Scroll to load more</Text>
            </View>
          ) : data.length > 0 ? (
            <View style={s.footer}>
              <Text style={s.footerMuted}>End</Text>
            </View>
          ) : (
            <View style={{ height: 10 }} />
          )
        }
      />

      <PathBoardViewer
        visible={!!selected}
        path={selected?.path || []}
        pathName={selected?.title || "Route"}
        onClose={() => setSelected(null)}
        canUpload={canUpload}
        onUpload={onUpload}
        uploadLabel={canUpload ? "UPLOAD TO DEVICE" : "SCAN DEVICE TO UPLOAD"}
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

const s = StyleSheet.create({
  emptyBtn: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  emptyBtnText: { color: "#EAF0FF", fontWeight: "900", letterSpacing: 1.2 },

  footer: { paddingVertical: 16, alignItems: "center", gap: 10 },
  footerText: { color: "rgba(255,255,255,0.75)", fontWeight: "800" },
  footerMuted: { color: "rgba(255,255,255,0.55)", fontWeight: "800" },
});
