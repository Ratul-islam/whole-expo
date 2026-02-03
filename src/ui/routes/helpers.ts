export function safeArr<T = any>(x: any): T[] {
  return Array.isArray(x) ? x : [];
}

export function titleSafe(s: any) {
  const t = String(s ?? "").trim();
  return t.length ? t : "Untitled Route";
}

export function timeTiny(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "2-digit" });
}

/**
 * Robustly unwrap API payloads shaped like:
 * A) axios -> res.data = { ...payload }
 * B) nested -> res.data = { status, data: {...payload} }
 */
export function unwrapPayload(res: any) {
  if (!res) return null;
  const d = res?.data ?? res;
  return d?.data ?? d;
}

export function pickKey(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).length > 0) return v;
  }
  return undefined;
}
