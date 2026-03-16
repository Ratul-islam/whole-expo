import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import { deviceService } from "@/src/device/device.services";
import { api } from "@/src/api/client";
import { tokenStorage } from "@/src/lib/tokenStorage";

export type SessionStatus =
  | "starting"
  | "preset_loaded"
  | "paused"
  | "in_game"
  | "completed"
  | "abandoned";

export type LiveSessionDoc = {
  _id: string;
  sessionId: string;
  userId: string;
  control:string;
  deviceId: string;
  deviceSecret: string;
  status: SessionStatus;
  time:number;
  score: number;
  correct: number;
  wrong: number;
  startedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DeviceStatusDoc = {
  _id: string;
  deviceId: string;
  deviceSecret: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userId: string;
  sessionId?: LiveSessionDoc | null;
};

function httpToWs(url: string) {
  return url.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://");
}

function deepFreeze<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  Object.freeze(obj);
  // @ts-ignore
  for (const key of Object.keys(obj)) {
    // @ts-ignore
    const val = obj[key];
    if (val && typeof val === "object" && !Object.isFrozen(val)) deepFreeze(val);
  }
  return obj;
}

function normalizeDeviceStatus(res: any): DeviceStatusDoc | null {
  const d = res?.data?.data ?? res?.data ?? res ?? null;
  if (!d || typeof d !== "object") return null;
  if (!d.deviceId || !d.deviceSecret) return null;

  const s = d.sessionId && typeof d.sessionId === "object" ? d.sessionId : null;

  const out: DeviceStatusDoc = {
    _id: String(d._id ?? ""),
    deviceId: String(d.deviceId),
    deviceSecret: String(d.deviceSecret),
    isAvailable: Boolean(d.isAvailable),
    createdAt: String(d.createdAt ?? ""),
    updatedAt: String(d.updatedAt ?? ""),
    __v: Number(d.__v ?? 0),
    userId: String(d.userId ?? ""),
    sessionId: s
      ? {
          _id: String(s._id ?? ""),
          sessionId: String(s.sessionId ?? s.session_id ?? ""),
          userId: String(s.userId ?? ""),
          deviceId: String(s.deviceId ?? ""),
          deviceSecret: String(s.deviceSecret ?? ""),
          status: (s.status ?? "starting") as SessionStatus,
          score: Number(s.score ?? 0),
          control: s.control,
          correct: Number(s.correct ?? 0),
          time: Number(s.time?? 0),
          wrong: Number(s.wrong ?? 0),
          startedAt: s.startedAt ? String(s.startedAt) : undefined,
          createdAt: s.createdAt ? String(s.createdAt) : undefined,
          updatedAt: s.updatedAt ? String(s.updatedAt) : undefined,
        }
      : null,
  };

  if (__DEV__) deepFreeze(out);

  return out;
}

async function checkConnected(): Promise<DeviceStatusDoc | null> {
  try {
    const res: any = await deviceService.status();
    return normalizeDeviceStatus(res);
  } catch (e: any) {
    const status = e?.response?.status ?? e?.status ?? e?.code;
    if (status === 400) return null;
    return null;
  }
}

export function useDeviceLive() {
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [device, setDevice] = useState<DeviceStatusDoc | null>(null);
  const [wsOnline, setWsOnline] = useState(false);

  const [deviceRev, setDeviceRev] = useState(0);

  const [renderTick, setRenderTick] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<any>(null);
  const closedRef = useRef(false);

  const connected = useMemo(
    () => !!device?.deviceId && !!device?.deviceSecret,
    [device?.deviceId, device?.deviceSecret]
  );

  const closeWs = useCallback((why = "manual") => {
    console.log("[WS] closeWs()", why);
    closedRef.current = true;
    if (retryRef.current) clearTimeout(retryRef.current);
    retryRef.current = null;
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setWsOnline(false);
  }, []);

  const scheduleRetry = useCallback((reason: string, fn: () => void) => {
    if (closedRef.current) return;
    if (retryRef.current) {
      console.log("[WS] retry already scheduled", reason);
      return;
    }
    console.log("[WS] retry scheduled in 1500ms →", reason);
    retryRef.current = setTimeout(() => {
      retryRef.current = null;
      fn();
    }, 1500);
  }, []);

  const refreshDevice = useCallback(async () => {
    console.log("[WS] refreshDevice() called");
    setDeviceLoading(true);
    try {
      const doc = await checkConnected();
      setDevice(() => doc);
      setDeviceRev((x) => x + 1);
      setRenderTick((x) => x + 1);
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  const connectWsIfConnected = useCallback(async () => {
    console.log("[WS] connectWsIfConnected() called");

    const doc = await checkConnected();
    if (!doc) {
      console.log("[WS] ❌ not connected → close");
      setDevice(() => null);
      setDeviceRev((x) => x + 1);
      setRenderTick((x) => x + 1);
      setWsOnline(false);
      closeWs("not-connected");
      return;
    }

    console.log("[WS] ✅ device connected =", doc.deviceId);
    setDevice(() => doc);
    setDeviceRev((x) => x + 1);
    setRenderTick((x) => x + 1);

    const base = api.defaults.baseURL || "";
    console.log("[WS] api.defaults.baseURL =", base);

    if (!base) {
      console.log("[WS] ❌ missing baseURL");
      return;
    }

    const access = await tokenStorage.getAccess();
    console.log("[WS] access token exists =", !!access);

    if (!access) {
      setWsOnline(false);
      return;
    }

    const existingState = wsRef.current?.readyState;
    if (typeof existingState === "number") {
      console.log("[WS] existing ws readyState =", existingState);
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[WS] already OPEN ✅");
      setWsOnline(true);
      return;
    }

    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;

    closedRef.current = false;

    const wsBase = httpToWs(base); // base contains /api/v1
    /**
     * IMPORTANT:
     * If your backend WS route is under /api/v1/device/live,
     * you MUST keep /api/v1 here.
     *
     * If backend WS is /device/live (no /api/v1), then remove /api/v1.
     */
    const url = `${wsBase}/device/live?token=${encodeURIComponent(access)}`;

    console.log("[WS] WS connecting →", url.replace(access, "***"));

    let ws: WebSocket;
    try {
      // @ts-ignore
      ws = new WebSocket(url, undefined, { headers: { Authorization: `Bearer ${access}` } });
    } catch {
      ws = new WebSocket(url);
    }

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] OPEN ✅");
      setWsOnline(true);
      setRenderTick((x) => x + 1);
    };

    ws.onmessage = (ev) => {
      let payload: any = ev.data;
      try {
        payload = JSON.parse(String(ev.data));
      } catch {}

      console.log("[WS] message:", payload);

      setWsOnline(true);

      // ✅ normalize
      let next: DeviceStatusDoc | null = null;

      if (payload?.type === "device_snapshot") {
        next = payload?.data ? normalizeDeviceStatus({ data: payload.data }) : null;
      } else if (payload?.status === "success" && payload?.data) {
        next = normalizeDeviceStatus({ data: payload.data });
      } else if (payload?.data) {
        // fallback
        next = normalizeDeviceStatus({ data: payload.data });
      }

      if (!next) return;

      // ✅ ALWAYS set a new reference + bump revision so UI must update
      setDevice(() => next);
      setDeviceRev((x) => x + 1);
      setRenderTick((x) => x + 1);

      console.log("[WS] device updated →", {
        status: next.sessionId?.status,
        score: next.sessionId?.score,
        correct: next.sessionId?.correct,
        wrong: next.sessionId?.wrong,
        updatedAt: next.sessionId?.updatedAt,
      });
    };

    ws.onerror = (e) => {
      console.log("[WS] ERROR ❌", e);
      setWsOnline(false);
      scheduleRetry("ws-error", connectWsIfConnected);
    };

    ws.onclose = (e) => {
      console.log("[WS] CLOSED 🧯", e);
      setWsOnline(false);
      scheduleRetry("ws-close", connectWsIfConnected);
    };
  }, [closeWs, scheduleRetry]);

  // initial
  useEffect(() => {
    (async () => {
      console.log("[WS] hook mount → initial refresh + connect");
      await refreshDevice();
      await connectWsIfConnected();
    })();

    return () => closeWs("unmount");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resume from background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active") {
        console.log("[WS] AppState active → connectWsIfConnected()");
        connectWsIfConnected();
      }
    });
    return () => {
      // @ts-ignore
      sub?.remove?.();
    };
  }, [connectWsIfConnected]);

  return {
    device,
    deviceLoading,
    connected,
    wsOnline,

    // ✅ KEY FIX
    deviceRev,
    renderTick,

    refreshDevice,
    connectWsIfConnected,
    closeWs,
  };
}
