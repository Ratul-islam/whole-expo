// src/device/device.services.ts
import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { loadPresetType } from "./device.types";

type LiveHandlers = {
  onOpen?: () => void;
  onClose?: (e: WebSocketCloseEvent) => void;
  onError?: (e: any) => void;
  onMessage?: (data: any) => void;
};

function httpToWs(url: string) {
  return url.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}

function getWsBaseUrl(): string {
  // axios baseURL (e.g. http://192.168.0.115:8000)
  // @ts-ignore
  const baseURL: string = api?.defaults?.baseURL ?? "";
  if (!baseURL) throw new Error("api.defaults.baseURL is not set");
  return httpToWs(baseURL);
}

export const deviceService = {
  status: async () => {
    const { data } = await api.get(ENDPOINTS.DEVICE.STATUS);
    return data;
  },
  loadPreset:async (payload:loadPresetType)=>{
    const { data } = await api.post(ENDPOINTS.DEVICE.LOADPRST,payload );
    return data;
  },
  live: (token: string, handlers: LiveHandlers = {}) => {
    const wsBase = getWsBaseUrl();
    const url = `${wsBase}${ENDPOINTS.DEVICE.LIVE}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);

    ws.onopen = () => handlers.onOpen?.();
    ws.onclose = (e) => handlers.onClose?.(e);
    ws.onerror = (e) => handlers.onError?.(e);

    ws.onmessage = (evt) => {
      const raw = String(evt.data);
      console.log(raw)
      try {
        handlers.onMessage?.(JSON.parse(raw));
      } catch {
        handlers.onMessage?.(raw);
      }
    };

    return {
      socket: ws,
      close: () => {
        try {
          ws.close();
        } catch {}
      },
      send: (obj: any) => {
        try {
          ws.send(JSON.stringify(obj));
        } catch {}
      },
    };
  },
};
