import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ScrollView, RefreshControl, View, StyleSheet, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useAuthStore } from "../../src/auth/auth.store";
import { sessionService } from "@/src/session/session.services";
import { useDeviceLive } from "@/hooks/useDeviceLive";
import type { RecentSession, SessionStatus } from "@/src/ui/home/RecentRuns";
import type { DevicePhase } from "@/src/ui/home/StatusOrb";
import { MainHeader } from "@/src/ui/home/MainHeader";
import { StatusOrb } from "@/src/ui/home/StatusOrb";
import { HudPanel } from "@/src/ui/home/HudPanel";
import { RecentRuns } from "@/src/ui/home/RecentRuns";
import { GameDetailsModal } from "@/src/ui/app/GameDetailsModal";
import type { GameDetails } from "@/src/ui/app/GameDetailsModal";
import { deviceService } from "@/src/device/device.services";
import { SafeAreaView } from "react-native-safe-area-context";


async function fetchRecentSessions(): Promise<any[]> {
  const res: any = await sessionService.getCompletedSessions();

  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;

  return [];
}

function formatTinyTime(iso?: string) {
  if (!iso) return "—";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toPhase(device: any): DevicePhase {
  if (!device?.deviceId || !device?.deviceSecret) return "DISCONNECTED";

  const st = device.sessionId?.status as SessionStatus | undefined;
  if (!st) return "CONNECTED";
  if (st === "starting") return "CONNECTED";
  if (st === "preset_loaded") return "PRESET_LOADED";
  if (st === "in_game") return "IN_GAME";
  if (st === "paused") return "PAUSED";
  if (st === "completed") return "COMPLETED";
  if (st === "abandoned") return "ABANDONED";

  return "CONNECTED";
}

export default function MainMenuScreen() {
  const router = useRouter();
  const logout = useAuthStore((st: any) => st.logout);

  const params = useLocalSearchParams<{ deviceId?: string; deviceSecret?: string }>();
  const scannedDeviceId = typeof params.deviceId === "string" ? params.deviceId : "";
  const scannedDeviceSecret = typeof params.deviceSecret === "string" ? params.deviceSecret : "";

  const { device, connected, wsOnline, refreshDevice, connectWsIfConnected, deviceRev } =
    useDeviceLive();

  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    console.log("[INDEX] deviceRev changed →", deviceRev, {
      status: device?.sessionId?.status,
      score: device?.sessionId?.score,
      time: device?.sessionId?.time,
      correct: device?.sessionId?.correct,
      wrong: device?.sessionId?.wrong,
      updatedAt: device?.sessionId?.updatedAt,
    });
  }, [deviceRev, device]);

  console.log("[INDEX] render#", renderCount.current, {
    deviceId: device?.deviceId,
    wsOnline,
    deviceRev,
    score: device?.sessionId?.score,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [items, setItems] = useState<RecentSession[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsGame, setDetailsGame] = useState<GameDetails | null>(null);

  const phase = useMemo(() => toPhase(device), [deviceRev, device]);

  const liveScore = device?.sessionId?.score ?? 0;
  const liveCorrect = device?.sessionId?.correct ?? 0;
  const liveWrong = device?.sessionId?.wrong ?? 0;

  const completed = useMemo(
    () => items.filter((s) => s.status === "completed").slice(0, 8),
    [items]
  );

  const totalScore = useMemo(
    () => items.reduce((sum, s) => sum + (typeof s.score === "number" ? s.score : 0), 0),
    [items]
  );

  const lastPlayed = useMemo(() => {
    const first = items[0];
    return first?.endedAt || first?.createdAt || "";
  }, [items]);

  const loadSessions = async () => {
    try {
      setErr(null);

      const data = await fetchRecentSessions();

      setItems(
        (Array.isArray(data) ? data : []).map((x: any) => ({
          sessionId: String(x.sessionId ?? x.session_id ?? ""),
          deviceId: String(x.deviceId ?? x.device_id ?? ""),
          status: (x.status ?? "completed") as SessionStatus,
          score:
            typeof x.score === "number"
              ? x.score
              : typeof x.final_score === "number"
              ? x.final_score
              : undefined,
          correct: typeof x.correct === "number" ? x.correct : undefined,
          wrong: typeof x.wrong === "number" ? x.wrong : undefined,
          endedAt: x.endedAt ?? x.ended_at,
          time: x.time ?? x.time,
          createdAt: x.createdAt ?? x.created_at,
          pathName: x.pathName ?? x.path_name ?? x.path?.name ?? x.path?.meta?.name,
        }))
      );
    } catch (e: any) {
      setErr(e?.message || "Failed to load recent games");
      setItems([]);
    }
  };

  const loadAll = async () => {
    console.log("[INDEX] loadAll() start");
    await Promise.all([refreshDevice(), loadSessions()]);
    console.log("[INDEX] loadAll() done → connect WS");
    connectWsIfConnected();
  };

  useEffect(() => {
    (async () => {
      console.log("[INDEX] mount → initial load");
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scannedDeviceId || scannedDeviceSecret) {
      console.log("[INDEX] scanner params changed → refreshDevice + connect WS");
      (async () => {
        await refreshDevice();
        connectWsIfConnected();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedDeviceId, scannedDeviceSecret]);

  useFocusEffect(
    useCallback(() => {
      console.log("[INDEX] focus → connectWsIfConnected()");
      connectWsIfConnected();
    }, [connectWsIfConnected])
  );

  const onRefresh = async () => {
    console.log("[INDEX] pull-to-refresh");
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const onLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const onScan = () => router.push("/(app)/scanner");

  const onLoadPreset = () => {
    if (!device?.deviceId || !device?.deviceSecret) {
      onScan();
      return;
    }

    router.push({
      pathname: "/(app)/my-routes",
      params: {
        deviceId: device.deviceId,
        deviceSecret: device.deviceSecret,
      },
    });
  };

  const startGame = async () => {
    if (!device?.deviceId || !device?.deviceSecret) return;

    try {
      setActionLoading(true);

      await deviceService.startGame({
        deviceId: device.deviceId,
        deviceSecret: device.deviceSecret,
      });

      await refreshDevice();
      connectWsIfConnected();
    } catch (e: any) {
      console.log(e);
    } finally {
      setActionLoading(false);
    }
  };

  const pauseGame = async () => {
    if (!device?.deviceId || !device?.deviceSecret) return;

    try {
      setActionLoading(true);

      await deviceService.pauseGame({
        deviceId: device.deviceId,
        deviceSecret: device.deviceSecret,
      });

      await refreshDevice();
      connectWsIfConnected();
    } catch (e: any) {
      console.log(e);
    } finally {
      setActionLoading(false);
    }
  };

  const resumeGame = async () => {
    if (!device?.deviceId || !device?.deviceSecret) return;

    try {
      setActionLoading(true);

      await deviceService.resumeGame({
        deviceId: device.deviceId,
        deviceSecret: device.deviceSecret,
      });

      await refreshDevice();
      connectWsIfConnected();
    } catch (e: any) {
      console.log(e);
    } finally {
      setActionLoading(false);
    }
  };

  const onPrimary = async () => {
    if (actionLoading) return;

    if (phase === "DISCONNECTED") {
      onScan();
      return;
    }

    if (!device?.deviceId || !device?.deviceSecret) {
      onScan();
      return;
    }

    if (device.sessionId?.control === "offline") return;

    if (phase === "PRESET_LOADED") {
      await startGame();
      return;
    }

    if (phase === "IN_GAME") {
      await pauseGame();
      return;
    }

    if (phase === "PAUSED") {
      await resumeGame();
      return;
    }

    onLoadPreset();
  };

  const deviceText = connected ? `DEVICE ${device?.deviceId ?? "—"}` : "NO DEVICE";
  const lastPlayedText = lastPlayed ? formatTinyTime(lastPlayed) : "—";

return (
  <>
    <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#000"
        />
      }
    >
      <View style={styles.inner}>

        <MainHeader deviceText={deviceText} onLogout={onLogout} />

        <StatusOrb
          key={`orb-${deviceRev}`}
          phase={phase}
          deviceId={device?.deviceId}
          session={device?.sessionId}
          wsOnline={wsOnline && connected}
        />

        <HudPanel
          key={`hud-${deviceRev}`}
          phase={phase}
          control={device?.sessionId?.control}
          connected={connected}
          wsOnline={wsOnline}
          totalScore={totalScore}
          liveScore={phase === "IN_GAME" ? liveScore : "—"}
          lastPlayedText={lastPlayedText}
          liveCorrect={liveCorrect}
          liveWrong={liveWrong}
          onPrimary={onPrimary}
          onRoutes={() => router.push("/(app)/my-routes")}
          onLeaderboard={() => router.push("/(app)/leaderBoard")}
          onScan={onScan}
        />

        <RecentRuns
          loading={loading}
          err={err}
          completed={completed}
          onRetry={loadAll}
          onPressItem={(g) => {
            setDetailsGame(g as any);
            setDetailsOpen(true);
          }}
          formatTime={formatTinyTime}
        />

        <View style={{ height: 30 }} />

        <GameDetailsModal
          visible={detailsOpen}
          game={detailsGame}
          onClose={() => {
            setDetailsOpen(false);
            setDetailsGame(null);
          }}
          showDeviceSecret={false}
        />
      </View>
    </ScrollView>
  </>
);
}

const styles = StyleSheet.create({
  bottomSpacer: {
    height: 28,
  },

  safe: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },

  inner: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
});