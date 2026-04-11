import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../config/env";
import { tokenStorage } from "../lib/tokenStorage";
import { ENDPOINTS } from "./endpoints";

type RefreshResponseAny = any;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes(ENDPOINTS.AUTH.LOGIN) ||
    url.includes(ENDPOINTS.AUTH.REFRESH)
  );
}

function extractAccessToken(refreshRes: RefreshResponseAny): string | null {
  // supports:
  // { accessToken, refreshToken }
  // { data: { accessToken, refreshToken } }
  const t =
    refreshRes?.data?.accessToken ??
    refreshRes?.accessToken ??
    refreshRes?.data?.data?.accessToken ??
    null;

  return typeof t === "string" && t.length > 10 ? t : null;
}

function extractRefreshToken(refreshRes: RefreshResponseAny): string | null {
  const t =
    refreshRes?.data?.refreshToken ??
    refreshRes?.refreshToken ??
    refreshRes?.data?.data?.refreshToken ??
    null;

  return typeof t === "string" && t.length > 10 ? t : null;
}

function safeForceLogout() {
  // IMPORTANT: avoid circular import issues by requiring only at runtime
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require("../auth/auth.store");
    if (useAuthStore?.getState?.().logout) {
      useAuthStore.getState().logout(); // async is fine; we don't await inside interceptor
      return;
    }
  } catch {}
  // fallback: at least clear tokens
  tokenStorage.clear();
}

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor: attach access token + log full URL
api.interceptors.request.use(async (config) => {
  const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.log("➡️ API REQUEST:", config.method?.toUpperCase(), fullUrl);

  const access = await tokenStorage.getAccess();
  console.log(access)
  if (access) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});

// ✅ Response interceptor: refresh on 401 (except auth endpoints)
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original) return Promise.reject(error);

    const status = error.response?.status;
    const fullUrl = `${original.baseURL ?? ""}${original.url ?? ""}`;
    console.log("❌ API ERROR:", status, original.method?.toUpperCase(), fullUrl);

    // 🚫 never refresh for auth endpoints
    if (isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    // only handle 401
    if (status !== 401) {
      return Promise.reject(error);
    }

    // stop infinite loops
    if (original._retry) {
      // if we already retried and still 401 -> logout hard
      await tokenStorage.clear();
      safeForceLogout();
      return Promise.reject(error);
    }
    original._retry = true;

    // If refresh already happening, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(error);

          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;

          resolve(api(original));
        });
      });
    }

    // Start refresh flow
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (!refreshToken) {
        resolveQueue(null);
        await tokenStorage.clear();
        safeForceLogout();
        return Promise.reject(error);
      }

      // IMPORTANT: use plain axios (not `api`) to avoid interceptor recursion
      const refreshUrl = `${ENV.API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`;

      const refreshRes = await axios.post(
        refreshUrl,
        { refreshToken },
        {
          timeout: 20000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const newAccess = extractAccessToken(refreshRes?.data ?? refreshRes);
      const rotatedRefresh =
        extractRefreshToken(refreshRes?.data ?? refreshRes) ?? refreshToken;

      if (!newAccess) {
        // refresh response shape mismatch or backend failed silently
        resolveQueue(null);
        await tokenStorage.clear();
        safeForceLogout();
        return Promise.reject(error);
      }

      await tokenStorage.setTokens(newAccess, rotatedRefresh);

      // Release queued requests with new token
      resolveQueue(newAccess);

      // Retry original request with new token
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;

      return api(original);
    } catch (refreshErr) {
      // Refresh failed → log out everywhere
      await tokenStorage.clear();
      resolveQueue(null);
      safeForceLogout();

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
