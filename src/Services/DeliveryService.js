import { apiUrl, getApiBaseCandidatesFor404Retry } from "../config/apiBase.js";

const PATH = "/api/Delivery/GetAllDelivery";

const FETCH_MS = 25000;

function fetchSignal() {
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      return AbortSignal.timeout(FETCH_MS);
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function basesForDelivery() {
  const list = [];
  const seen = new Set();
  const push = (b) => {
    if (typeof b !== "string" || !b.trim()) return;
    const n = b.trim().replace(/\/+$/, "");
    if (seen.has(n)) return;
    seen.add(n);
    list.push(n);
  };
  for (const b of getApiBaseCandidatesFor404Retry()) push(b);
  // Stabiler Fallback, falls primärer Host unter Last hängt.
  push("https://pizzawangen.runasp.net");
  if (typeof window !== "undefined" && window.location?.origin) {
    push(window.location.origin.replace(/\/+$/, ""));
  }
  return list;
}

/** ASP.NET Newtonsoft sendet oft PascalCase (PostBox, Data) — Frontend erwartet camelCase. */
const normalizeDeliveryRow = (d) => {
  if (!d || typeof d !== "object") return null;
  return {
    ...d,
    id: d.id ?? d.Id,
    postBox: String(d.postBox ?? d.PostBox ?? "").trim(),
    city: String(d.city ?? d.City ?? "").trim(),
    orderAb: Number(d.orderAb ?? d.OrderAb ?? 0),
  };
};

function trimmedLooksLikeHtml(text) {
  const s = String(text).slice(0, 120).toLowerCase();
  return s.includes("<!doctype") || s.includes("<html");
}

/**
 * @returns {{ kind: "json"; rows: any[] } | { kind: "not-json" }}
 */
function parseDeliveryBody(text) {
  if (!text || typeof text !== "string") return { kind: "not-json" };
  const trimmed = text.trim();
  if (trimmedLooksLikeHtml(trimmed)) return { kind: "not-json" };
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return { kind: "not-json" };
  let payload;
  try {
    payload = JSON.parse(trimmed);
  } catch {
    return { kind: "not-json" };
  }
  if (Array.isArray(payload)) {
    return {
      kind: "json",
      rows: payload.map(normalizeDeliveryRow).filter(Boolean),
    };
  }
  if (payload && typeof payload === "object") {
    const hasDataKey =
      Object.prototype.hasOwnProperty.call(payload, "data") ||
      Object.prototype.hasOwnProperty.call(payload, "Data");
    if (hasDataKey) {
      const raw = payload.data ?? payload.Data;
      const list = Array.isArray(raw) ? raw : [];
      return {
        kind: "json",
        rows: list.map(normalizeDeliveryRow).filter(Boolean),
      };
    }
  }
  return { kind: "not-json" };
}

const DeliveryService = {
  getDeliveryData: async () => {
    const bases = basesForDelivery();
    if (!bases.length) return [];

    const signal = fetchSignal();
    let lastProblem = null;

    for (const base of bases) {
      const url = apiUrl(PATH, base);
      try {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          mode: "cors",
          cache: "no-store",
          ...(signal ? { signal } : {}),
        });
        const text = await res.text();
        if (!res.ok || !text) {
          lastProblem = `HTTP ${res.status}`;
          continue;
        }
        const parsed = parseDeliveryBody(text);
        if (parsed.kind === "json") {
          return parsed.rows;
        }
        lastProblem = "not-json";
      } catch (e) {
        lastProblem = e?.name === "TimeoutError" ? "timeout" : e?.message || "network";
      }
    }

    if (lastProblem) {
      console.warn("[DeliveryService] GetAllDelivery failed on all bases:", lastProblem);
    }
    return [];
  },
};

export default DeliveryService;
